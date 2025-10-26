import axios from 'axios';
import qs from 'query-string';

export interface WorkflowJobArgs {
  name: string;
  val: string;
  info?: string;
  val_type: string;
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
    formal_args: WorkflowJobArgs[];
    upload_file: string;
    target?: string[];
  };
}

export interface NodeConfig {
  id: string;
  name: string;
  node_type: string;
  is_join_all: boolean;
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
  logical_op: string;
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
export interface WorkflowUserVariables {
  name: string;
  val: string;
  info: string;
}
export interface WorkflowRecord {
  id: number;
  name: string;
  info: string;
  nodes: NodeConfig[];
  edges: EdgeConfig[];
  user_variables: WorkflowUserVariables[];
}

export interface SaveWorkflowResp {
  result: number;
  next_exec_times: string[];
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
  id?: number;
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
  user_variables: WorkflowUserVariables[];
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
  workflow_id?: number;
  id?: number;
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

export interface QueryWorkflowProcessListReq {
  process_name?: string;
  workflow_id: number;
  default_id?: number;
  tag_ids?: number[];
  page: number;
  page_size: number;
}

export interface WorkflowProcessRecord {
  process_id: string;
  process_name: string;
  created_user: string;
  current_run_id: string;
  current_node_id: string;
  current_node_status: string;
  process_status: string;
}

export interface QueryWorkflowProcessListResp {
  list: WorkflowProcessRecord[];
  total: number;
}

export function queryWorkflowProcessList(params: QueryWorkflowProcessListReq) {
  return axios.get<QueryWorkflowProcessListResp>('/api/workflow/process/list', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export interface getWorkflowProcessDetailReq {
  process_id: string;
}

export interface NodeTask {
  id: number;
  process_id: string;
  node_id: string;
  run_id: string;
  task_status: string;
  bind_ip: string;
  exit_code: number;
  exit_status: string;
  output: string;
  restart_num: number;
  dispatch_result: null;
  created_user: string;
  created_time: string;
  updated_time: string;
}
export interface CompletedNode {
  base: {
    id: number;
    process_id: string;
    run_id: string;
    node_id: string;
    node_status: string;
    created_user: string;
    created_time: string;
    updated_time: string;
  };
  tasks: NodeTask[];
}

export interface CompletedEdge {
  base: {
    id: number;
    process_id: string;
    run_id: string;
    edge_id: string;
    edge_type: string;
    eval_val: string;
    props: any;
    source_node_id: string;
    target_node_id: string;
    created_user: string;
    created_time: string;
  };
}

export interface getWorkflowProcessDetailResp {
  process_id: string;
  process_name: string;
  created_user: string;
  current_run_id: string;
  current_node_id: string;
  current_node_status: string;
  process_status: string;
  process_args: any;
  completed_nodes: CompletedNode[];
  completed_edges: CompletedEdge[];
  origin_nodes: NodeConfig[];
  origin_edges: EdgeConfig[];
}
export function getWorkflowProcessDetail(params: getWorkflowProcessDetailReq) {
  return axios.get<getWorkflowProcessDetailResp>(
    '/api/workflow/process/detail',
    {
      params,
      paramsSerializer: (obj) => {
        return qs.stringify(obj);
      },
    }
  );
}

export interface DeleteWorkflowReq {
  workflow_id: number;
}

export function deleteWorkflow(data: DeleteWorkflowReq) {
  return axios.post('/api/workflow/delete', data);
}

export interface DeleteWorkflowVersionReq {
  workflow_id: number;
  version_id: number;
}

export function deleteWorkflowVersion(data: DeleteWorkflowVersionReq) {
  return axios.post('/api/workflow/delete-version', data);
}

export interface DeleteWorkflowProcessReq {
  workflow_id?: number;
  process_id?: string;
}

export function deleteWorkflowProcess(data: DeleteWorkflowProcessReq) {
  return axios.post('/api/workflow/delete-process', data);
}

export interface CustomTimerExpr {
  timezone: string;
  expr: string;
}
export interface WorkflowTimerRecord {
  id: number;
  workflow_id: number;
  version_id: number;
  timer_expr: CustomTimerExpr;
  schedule_guid: string;
  is_active: boolean;
  tags?: { [key: string]: string }[];
  team_id: number;
  team_name: string;
  created_user: string;
  updated_user: string;
  created_time: string;
  updated_time: string;
}

export interface QueryWorkflowTimerListReq {
  name?: string;
  tag_ids?: number[];
  page: number;
  page_size: number;
}

export interface QueryWorkflowTimerListResp {
  list: WorkflowTimerRecord[];
  total: number;
}

export function queryWorkflowTimerList(params: QueryWorkflowTimerListReq) {
  return axios.get<QueryWorkflowTimerListResp>('/api/workflow/timer/list', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export interface SaveWorkflowTimerResp {
  ret: number;
}
export type SaveWorkflowTimerReq = Partial<WorkflowTimerRecord>;

export function saveWorkflowTimer(data: SaveWorkflowTimerReq) {
  if (data?.id === 0) {
    delete data.id;
  }
  return axios.post<SaveWorkflowResp>('/api/workflow/timer/save', data);
}

export interface ScheduleWorkflowTimerResp {
  ret: string;
}
export interface ScheduleWorkflowTimerReq {
  id: number;
  action: 'start_timer' | 'stop_timer';
}

export function scheduleWorkflowTimer(req: ScheduleWorkflowTimerReq) {
  return axios.post<ScheduleWorkflowTimerResp>(
    '/api/workflow/timer/schedule',
    req
  );
}

export interface DeleteWorkflowTimerReq {
  id: number;
}

export function deleteWorkflowTimer(data: DeleteWorkflowTimerReq) {
  return axios.post('/api/workflow/timer/delete', data);
}
