import axios from 'axios';
import type { TableData } from '@arco-design/web-vue/es/table/interface';

export interface ContentDataRecord {
  x: string;
  y: number;
}

export function queryContentData() {
  return axios.get<ContentDataRecord[]>('/api/content-data');
}

export interface PopularRecord {
  key: number;
  clickNumber: string;
  title: string;
  increases: number;
}

export function queryPopularList(params: { type: string }) {
  return axios.get<TableData[]>('/api/popular/list', { params });
}

export interface HistoryParams {
  eid: string;
  schedule_id: string;
}

export interface DataModel {
  job_type: string | number;
  filter_schedule_history?: HistoryParams[];
}

export interface JobRecordList {
  name: string;
  eid: string;
  last_start_time: string;
  total: number;
  exec_succ_num: number;
  exec_fail_num: number;
  check_succ_num: number;
  check_fail_num: number;
  eval_fail_num: number;
  info: string;
}

export interface DashboardRecord {
  name: string;
  eid: string;
  schedule_name: string;
  results: JobRecordList[];
}

export interface QueryDashboardRecord {
  rows: DashboardRecord[];
  exec_fail_num: number;
  exec_succ_num: number;
  job_num: number;
  running_num: number;
}

export function queryDashboardList(data: DataModel) {
  return axios.post<QueryDashboardRecord>('/api/job/dashboard', { ...data });
}
