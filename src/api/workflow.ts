import axios from 'axios';
import qs from 'query-string';
import { endpoint } from './job';

export interface WorkflowJobArgs {
  name: string;
  val: string;
  node_assignment?: {
    source_node_id: string;
    is_first_instance_result: boolean;
    is_completed_result: boolean;
  };
}

export interface Task {
  standard?: {
    eid: string;
    formal_args: WorkflowJobArgs[];
    target?: string[];
  };
  custom?: {
    work_dir?: string;
    executor_id: number;
    timeout?: number;
    work_user?: string;
    code: string;
    upload_file: string;
  };
}

export interface NodeConfig {
  id: string;
  name: string;
  node_type: string;
  task_type: 'standard' | 'custom' | 'none';
  task: Task;
  data: {
    [key: string]: any;
  };
}

export interface ConditionVal {
  val: string;
  val_type: 'user_variables' | 'custom' | 'exit_code' | 'output';
}

export interface Condition {
  rules: {
    name: string;
    left_val: ConditionVal;
    op: string;
    right_val: ConditionVal;
    compute_type: string;
  }[];
  expr: string;
}
export interface EdgeConfig {
  id: string;
  name: string;
  condition?: Condition;
  source_node_id: string;
  target_node_id: string;
  data: {
    [key: string]: any;
  };
}

export interface WorkflowRecord {
  id?: number;
  name: string;
  info: string;
  nodes: NodeConfig[];
  edges: EdgeConfig[];
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

export interface ReleaseWorkflowVersionReq {
  workflow_id: number;
  version: string;
  version_info?: string;
  nodes: NodeConfig[];
  edges: EdgeConfig[];
}

export function releaseWorkflowVersion(data: ReleaseWorkflowVersionReq) {
  return axios.post<SaveWorkflowResp>('/api/workflow/release', data);
}

export interface QueryWorkflowListReq {
  name?: string;
  tag_ids?: number[];
  page: number;
  page_size: number;
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

export interface getWorkflowDetailReq {
  workflow_id: number;
  version_id?: number;
}

export interface getWorkflowDetailResp {
  workflow_id: number;
  version_id: number;
  workflow_name: string;
  workflow_info: string;
  version: string;
  version_info: string;
  created_user: string;
  updated_time: string;
  nodes: NodeConfig[];
  edges: EdgeConfig[];
}

export function getWorkflowDetail(params: getWorkflowDetailReq) {
  return axios.get<getWorkflowDetailResp>('/api/workflow/detail', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export interface QueryWorkflowVersionListReq {
  version?: string;
  workflow_id: number;
  default_id?: number;
  page: number;
  page_size: number;
}

export interface WorkflowVersionRecord {
  id: number;
  version: string;
  version_info: string;
  created_time: string;
  created_user: string;
  nodes?: NodeConfig[];
  edges?: EdgeConfig[];
}

export interface QueryWorkflowVersionListResp {
  list: WorkflowVersionRecord[];
  total: number;
}

export function queryWorkflowVersionList(params: QueryWorkflowVersionListReq) {
  return axios.get<QueryWorkflowVersionListResp>('/api/workflow/version/list', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export interface WorkflowNodeArgs {
  node_id: string;
  target: string[];
  args: {
    [key: string]: any;
  };
}
export interface WorkflowProcessArgs {
  default_target: string[];
  user_variables: {
    [key: string]: any;
  };
  nodes: WorkflowNodeArgs[];
}

export interface StartWorkflowProcessReq {
  workflow_id: number;
  version_id: number;
  process_name: string;
  process_args?: WorkflowProcessArgs;
}

export interface StartWorkflowProcessResp {
  process_id: number;
}

export function startWorkflowProcess(data: StartWorkflowProcessReq) {
  return axios.post<StartWorkflowProcessResp>(
    '/api/workflow/start-process',
    data
  );
}
