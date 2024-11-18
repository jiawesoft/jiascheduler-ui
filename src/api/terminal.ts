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
}
export interface QueryFileListParams extends Partial<FileRecord> {
  ip: string;
  dir?: string;
  namespace?: string;
  // status: number;
  // page: number;
  // page_size: number;
}

export interface QuryFileListRes {
  entry: FileRecord[];
  current_dir: string;
  namespace?: string;
}

export interface RemoveParams {
  ip: string;
  remove_type: string;
  path: string;
  namespace: string;
}

export interface DownloadData {
  ip: string;
  file_path: string;
  namespace?: string;
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
