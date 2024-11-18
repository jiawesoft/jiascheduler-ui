import axios from 'axios';
import qs from 'query-string';

export interface JobRecord {
  id?: number;
  name: string;
  work_dir: string;
  work_usr: string;
  timeout: number;
  display_on_dashboard: boolean;
  code: string;
  eid?: string;
  job_type?: string;
  executor_id: number;
  args?: { [key: string]: string };
  info: string;
}

export interface QueryJobReq extends Partial<JobRecord> {
  default_eid?: string;
  page: number;
  page_size: number;
}

export interface QueryJobListResp {
  list: JobRecord[];
  total: number;
}

export function queryJobList(params: QueryJobReq) {
  return axios.get<QueryJobListResp>('/api/job/list', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export interface SaveJobResp {
  ret: number;
}
export type SaveJobReq = Partial<JobRecord>;

export function saveJob(data: SaveJobReq) {
  if (data?.id === 0) {
    delete data.id;
  }
  return axios.post<SaveJobResp>('/api/job/save', data);
}

export type ScheduleType = 'once' | 'timer' | 'flow';
export type JobAction = 'exec' | 'kill' | 'start_schedule' | 'stop_schedule';

export interface TimerExpr {
  second: string;
  minute: string;
  hour: string;
  day_of_month: string;
  month: string;
  year: string;
}

export interface endpoint {
  namespace: string;
  ip: string;
}

export interface DispatchJobReq {
  eid: string;
  schedule_name: string;
  namespace: 'default';
  schedule_type: ScheduleType;
  timer_expr?: TimerExpr;
  action: JobAction;
  is_sync: false;
  endpoints: endpoint[];
}
export interface DispatchJobResp {
  [key: string]: any;
}

export function dispatchJob(data: DispatchJobReq) {
  return axios.post<DispatchJobResp>('/api/job/dispatch', data);
}

export interface RunRecord {
  bind_ip: string;
  created_time: string;
  created_user: string;
  dispatch_result: string;
  eid: string;
  job_type: string;
  schedule_type: string;
  end_time: string;
  exit_status: string;
  id: number;
  next_time: string;
  prev_time: string;
  run_status: string;
  schedule_id: string;
  schedule_name: string;
  schedule_status: string;
  start_time: string;
  updated_time: string;
  updated_user: string;
}
export interface QueryRunListReq extends Partial<RunRecord> {
  page: number;
  page_size: number;
}

export interface QueryRunListResp {
  list: RunRecord[];
  total: number;
}

export function queryRunList(params: QueryRunListReq) {
  return axios.get<QueryRunListResp>('/api/job/run-list', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export interface ScheduleRecord {
  id: number;
  schedule_id: string;
  name: string;
  eid: string;
  job_type: string;
  dispatch_result: string;
  schedule_type: ScheduleType;
  action: JobAction;
  dispatch_data: string;
  snapshot_data: string;
  created_user: string;
  updated_user: string;
  created_time: string;
  updated_time: string;
}
export interface QueryScheduleListReq extends Partial<ScheduleRecord> {
  page: number;
  page_size: number;
}

export interface QuryScheduleListResp {
  list: JobRecord[];
  total: number;
}

export function queryScheduleList(params: QueryScheduleListReq) {
  return axios.get<QuryScheduleListResp>('/api/job/schedule-list', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export interface BundleScriptResult {
  name: string;
  cond_expr: string;
  eid: string;
  eval_err: string | null;
  exit_code: number;
  exit_status: string;
  result: boolean;
  stderr: string;
  stdout: string;
}

export interface ExecRecord {
  id: number;
  schedule_id: string;
  job_type: string;
  bundle_script_result: BundleScriptResult[];
  eid: string;
  schedule_type: string;
  bind_ip: string;
  exit_status: string;
  start_time: string;
  end_time: string;
  created_time: string;
  updated_time: string;
  schedule_name: string;
  bind_namespace: string;
}
export interface QueryExecListReq extends Partial<ExecRecord> {
  page: number;
  page_size: number;
}

export interface QueryExecListRes {
  list: ExecRecord[];
  total: number;
}

export function queryExecList(params: QueryExecListReq) {
  return axios.get<QueryExecListRes>('/api/job/exec-list', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export interface JobActionReq {
  action: 'StartTimer' | 'StopTimer' | 'Exec' | 'Stop';
  namespace: string;
  ip: string;
  schedule_id: string;
}

export interface JobActionRes {
  ret: string;
}

export function jobAction(data: JobActionReq) {
  return axios.post<QueryExecListRes>('/api/job/action', data);
}

export interface JobBundleScriptRecord {
  id?: number;
  name: string;
  code: string;
  eid?: string;
  cond_expr?: string;
  executor_id: number;
  args?: { [key: string]: string };
  info: string;
}

export interface SaveJobBundleScriptResp {
  ret: number;
}

export function saveJobBundleScript(data: JobBundleScriptRecord) {
  if (data?.id === 0) {
    delete data.id;
  }
  return axios.post<SaveJobBundleScriptResp>(
    '/api/job/save-bundle-script',
    data
  );
}

export interface JobBundleScriptReq extends Partial<JobBundleScriptRecord> {
  page: number;
  page_size: number;
}

export interface JobBundleScriptListResp {
  list: JobBundleScriptRecord[];
  total: number;
}

export function queryJobBundleScriptList(params: JobBundleScriptReq) {
  return axios.get<JobBundleScriptListResp>('/api/job/bundle-script-list', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export interface JobTimerRecord {
  id?: number;
  name: string;
  job_name: string;
  code: string;
  eid: string;
  info: string;
  timer_expr: TimerExpr;
  executor_id: number;
}

export type SaveJobTimerReq = Partial<JobTimerRecord>;

export interface SaveJobTimerRes {
  ret: number;
}

export function saveJobTimer(data: SaveJobTimerReq) {
  if (data?.id === 0) {
    delete data.id;
  }
  return axios.post<SaveJobTimerRes>('/api/job/save-timer', data);
}

export interface QueryJobTimerReq extends Partial<JobTimerRecord> {
  page: number;
  page_size: number;
}

export interface QueryJobTimerListResp {
  list: JobTimerRecord[];
  total: number;
}

export function queryJobTimerList(params: QueryJobTimerReq) {
  return axios.get<QueryJobTimerListResp>('/api/job/timer-list', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export interface RedispatchJobReq {
  schedule_id: string;
  action: string;
}

type DispatchJobResult = {
  namespace: string;
  ip: string;
  response: object;
  has_err: boolean;
  call_err: string;
};

type RedispatchJobResp = DispatchJobResult[];

export function redispatchJob(req: RedispatchJobReq) {
  return axios.post<RedispatchJobResp>('/api/job/redispatch', req);
}