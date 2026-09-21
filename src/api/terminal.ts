import axios from 'axios';
import qs from 'query-string';

export interface FileRecord {
  file_name: string;
  file_type: string;
  permissions: string;
  size: number;
  user: string;
  group: string;
  modified: string;
  instance_id: string;
}
export interface QueryFileListParams extends Partial<FileRecord> {
  dir?: string;
  namespace?: string;
  instance_id: string;
  /** Login user picked from instance `sys_users`; empty means the default one. */
  sys_user?: string;
}

export interface QuryFileListRes {
  entry: FileRecord[];
  current_dir: string;
  namespace?: string;
}

export interface RemoveParams {
  remove_type: string;
  path: string;
  namespace?: string;
  instance_id?: string;
  /** Login user picked from instance `sys_users`; empty means the default one. */
  sys_user?: string;
}

export interface DownloadData {
  ip: string;
  file_path: string;
  namespace?: string;
}

export interface ServerList {
  ip: string;
  key: number;
  info?: string;
  config?: string;
  color?: string;
  selected?: boolean;
  namespace?: string;
  instanceId?: string;
  sysUser?: string;
  userSource?: string;
  /** password | key_path | key_content */
  sshAuthType?: string;
  sshPassword?: string;
  sshKeyPath?: string;
  sshKeyContent?: string;
  sshPort?: string;
}

export function queryFileList(params: QueryFileListParams) {
  return axios.get<QuryFileListRes>('/api/file/sftp/tunnel/read-dir', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function uploadFile(
  data: FormData,
  config: {
    controller: AbortController;
    onUploadProgress?: (progressEvent: any) => void;
  }
) {
  // const controller = new AbortController();
  return axios.post('/api/file/sftp/tunnel/upload', data, config);
}

/** Size of a single chunk, kept in sync with the server. */
export const SFTP_CHUNK_SIZE = 512 * 1024;

/**
 * Read the payload of a response.
 *
 * The shared axios interceptor already unwraps the api envelope: it rejects the
 * promise when `code !== 20000` and hands the inner `data` to the caller. So
 * `resp.data` here is the payload itself, never the `{code, msg, data}` wrapper.
 */
function body<T>(resp: { data: T }, api: string): T {
  if (resp?.data === undefined || resp?.data === null) {
    throw new Error(`${api} returned no payload`);
  }
  return resp.data;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      // Strip the `data:xxx;base64,` prefix.
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Upload a file in chunks.
 *
 * A whole-file upload encodes the entire file into a single WebSocket frame,
 * which is limited to 16 MiB and inflated 3~4x by the JSON number array. With
 * chunking every chunk travels on its own, so file size is no longer a limit.
 */
export async function uploadFileInChunks(params: {
  file: File | Blob;
  filePath: string;
  instanceId: string;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const { file, filePath, instanceId, onProgress, signal } = params;

  const total = file.size;
  const sessionId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  body(
    await axios.post<{ session_id: string; chunk_size: number }>(
      '/api/file/sftp/tunnel/upload/start',
      {
        instance_id: instanceId,
        file_path: filePath,
        session_id: sessionId,
        total_size: total,
      },
      { signal }
    ),
    'POST /sftp/tunnel/upload/start'
  );

  let offset = 0;
  // Chunks must be uploaded strictly one after another: the offset is
  // authoritative and parallel requests would buffer the whole file in memory.
  /* eslint-disable no-await-in-loop */
  while (offset < total) {
    const end = Math.min(offset + SFTP_CHUNK_SIZE, total);
    const base64 = await blobToBase64(file.slice(offset, end));
    body(
      await axios.post<{ next_offset: number }>(
        '/api/file/sftp/tunnel/upload/chunk',
        {
          instance_id: instanceId,
          file_path: filePath,
          session_id: sessionId,
          offset,
          data: base64,
        },
        { signal }
      ),
      'POST /sftp/tunnel/upload/chunk'
    );
    offset = end;
    onProgress?.(Math.round((offset / total) * 100));
  }
  /* eslint-enable no-await-in-loop */

  body(
    await axios.post<{ result: string }>(
      '/api/file/sftp/tunnel/upload/finish',
      {
        instance_id: instanceId,
        file_path: filePath,
        session_id: sessionId,
        total_size: total,
      },
      { signal }
    ),
    'POST /sftp/tunnel/upload/finish'
  );
}

/**
 * Build the streaming download url.
 *
 * The heavy lifting happens in the browser: this endpoint streams the file from
 * the agent straight into the response body, so the payload is assembled on the
 * browser's own download path instead of inside the page. That keeps the page's
 * memory flat no matter how large the file is.
 */
export function buildDownloadStreamUrl(params: {
  filePath: string;
  instanceId: string;
  sysUser?: string;
}): string {
  const search = new URLSearchParams({
    file_path: params.filePath,
    instance_id: params.instanceId,
  });
  if (params.sysUser) {
    search.set('sys_user', params.sysUser);
  }
  return `/file/sftp/tunnel/download/stream?${search.toString()}`;
}

export async function queryDownloadSize(params: {
  filePath: string;
  instanceId: string;
  sysUser?: string;
}): Promise<number> {
  const stat = body(
    await axios.get<{ result: string; next_offset: number }>(
      '/api/file/sftp/tunnel/download/stat',
      {
        params: {
          file_path: params.filePath,
          instance_id: params.instanceId,
          ...(params.sysUser ? { sys_user: params.sysUser } : {}),
        },
        paramsSerializer: (obj) => qs.stringify(obj),
      }
    ),
    'GET /sftp/tunnel/download/stat'
  );
  return Number(stat.result || 0);
}

/**
 * Download a remote file through the streaming endpoint.
 *
 * The response is read as a stream and turned into a blob held by the browser,
 * so the page never keeps a second copy of the file in the JS heap. The reader
 * also validates that the stream actually produced bytes, because a failure
 * inside the agent stream can only be signalled by an empty body.
 */
export async function downloadFileStream(params: {
  filePath: string;
  instanceId: string;
  sysUser?: string;
  signal?: AbortSignal;
  /** total size, used to report a percentage while the stream is read */
  total?: number;
  onProgress?: (percent: number) => void;
}): Promise<Blob> {
  const url = buildDownloadStreamUrl(params);
  const res = await fetch(url, {
    credentials: 'same-origin',
    signal: params.signal,
  });
  if (!res.ok) {
    throw new Error(`GET ${url} failed with http ${res.status}`);
  }
  if (!res.body) {
    throw new Error(`GET ${url} returned an empty response body`);
  }

  const reader = res.body.getReader();
  const first = await reader.read();
  if (first.done || !first.value?.length) {
    await reader.cancel();
    throw new Error(
      `GET ${url} returned no data, the agent side download did not start`
    );
  }

  const parts: BlobPart[] = [first.value as BlobPart];
  let received = first.value.length;
  const report = () => {
    if (params.total && params.total > 0) {
      params.onProgress?.(
        Math.min(100, Math.round((received / params.total) * 100))
      );
    }
  };
  report();

  for (;;) {
    // Sequential reads keep memory at one chunk; the browser owns the rest.
    /* eslint-disable no-await-in-loop */
    const next = await reader.read();
    /* eslint-enable no-await-in-loop */
    if (next.done) {
      break;
    }
    if (next.value?.length) {
      parts.push(next.value as BlobPart);
      received += next.value.length;
      report();
    }
  }

  return new Blob(parts);
}

export function removeFile(data: RemoveParams) {
  return axios.post('/api/file/sftp/tunnel/remove', {
    ...data,
  });
}

export function downloadFile(params: DownloadData) {
  return axios.get('/api/file/sftp/download', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
    responseType: 'blob',
  });
}

export interface TerminalSession {
  session_id: string;
}

export interface CreateTerminalSessionParams {
  instance_id: string;
  user_source?: string;
  auth_type?: string;
  password?: string;
  key_content?: string;
  port?: number;
  sys_user?: string;
}

export function createTerminalSession(params: CreateTerminalSessionParams) {
  return axios.post<TerminalSession>('/api/terminal/session/create', {
    ...params,
  });
}

export function getTerminalSession(params: { session_id: string }) {
  return axios.get<TerminalSession>('/api/terminal/session/detail', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}
