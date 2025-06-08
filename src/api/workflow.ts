import axios from 'axios';
import qs from 'query-string';

export interface WorkflowRecord {
  id?: number;
  name: string;
  info: string;
}

export interface SaveWorkflowResp {
  ret: number;
}
export type SaveWorkflowReq = Partial<WorkflowRecord>;

export function saveWorkflow(data: SaveWorkflowReq) {
  if (data?.id === 0) {
    delete data.id;
  }
  return axios.post<SaveWorkflowResp>('/api/workflow/save', data);
}

export interface Task {
  standard?: {
    eid: string;
  };
  custom?: {
    executor_id: number;
    timeout?: number;
    code: string;
    upload_file: string;
  };
}

export interface NodeConfig {
  id: string;
  name: string;
  node_type: string;
  task_type: 'standard|custom';
  task: Task;
  data: object;
}

export interface EdgeConfig {
  name: string;
}

export interface SaveWorkflowVersionReq {
  id?: number;
  pid?: number;
  name: string;
  info?: string;
  save_type: 'draft' | 'release';
  nodes: NodeConfig[];
  edges: EdgeConfig[];
}

export function saveWorkflowVersion(data: SaveWorkflowVersionReq) {
  if (data?.id === 0) {
    delete data.id;
  }
  return axios.post<SaveWorkflowResp>('/api/workflow/version/save', data);
}

export interface QueryWorkflowListReq {
  name?: string;
}

export interface QueryWorkflowListResp {
  list: WorkflowRecord[];
  total: number;
}

export function queryWorkflowList(params: QueryWorkflowListReq) {
  return axios.get<QueryWorkflowListResp>('/api/workflow/list', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}
