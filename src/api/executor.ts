import axios from 'axios';
import qs from 'query-string';

export interface ExecutorRecord {
  name: string;
  id: number;
  command: string;
  info: string;
  platform: string;
}

export interface QueryExecutorReq extends Partial<ExecutorRecord> {
  page: number;
  page_size: number;
}

export interface QueryExecutorListResp {
  list: ExecutorRecord[];
  total: number;
}

export function queryExecutorList(params: QueryExecutorReq) {
  return axios.get<QueryExecutorListResp>('/api/executor/list', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export type SaveExecutorReq = Partial<ExecutorRecord>;

export interface SaveExecutorResp {
  ret: number;
}

export function saveExecutor(req: SaveExecutorReq) {
  return axios.post<SaveExecutorResp>('/api/executor/save', req);
}
