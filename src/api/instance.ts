import axios from 'axios';
import qs from 'query-string';

export interface InstanceRecord {
  id: number;
  ip: string;
  info: string;
  instance_group_id: number;
  instance_group: string;
  sys_user: string;
  namespace: string;
  status: number;
  updated_time: string;
  created_time: string;
}
export interface QueryInstanceListReq extends Partial<InstanceRecord> {
  role_id?: number;
  ignore_role_id?: number;
  page: number;
  page_size: number;
}

export interface QueryInstanceListResp {
  list: InstanceRecord[];
  total: number;
}

export function queryInstanceList(params: QueryInstanceListReq) {
  return axios.get<QueryInstanceListResp>('/api/instance/list', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export type SaveInstanceReq = Partial<InstanceRecord>;

export interface SaveInstanceResp {
  ret: number;
}

export function saveInstance(req: SaveInstanceReq) {
  return axios.post<SaveInstanceResp>('/api/instance/save', req);
}

export interface InstanceGroupRecord {
  id: number;
  name: string;
  info: string;
  created_user: string;
  updated_time: string;
  created_time: string;
}
export interface QueryInstanceGroupListReq
  extends Partial<InstanceGroupRecord> {
  role_id?: number;
  ignore_role_id?: number;
  page: number;
  page_size: number;
}

export interface QueryInstanceGroupListResp {
  list: InstanceGroupRecord[];
  total: number;
}

export function queryInstanceGroupList(params: QueryInstanceGroupListReq) {
  return axios.get<QueryInstanceGroupListResp>('/api/instance/group/list', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export type SaveInstanceGroupReq = Partial<InstanceRecord>;

export interface SaveInstanceGroupResp {
  ret: number;
}

export function saveInstanceGroup(req: SaveInstanceGroupReq) {
  return axios.post<SaveInstanceGroupResp>('/api/instance/group/save', req);
}

export interface DeleteInstanceGroupReq {
  id: number;
}

export interface DeleteInstanceGroupResp {
  result: number;
}

export function deleteInstanceGroup(req: DeleteInstanceGroupReq) {
  return axios.post<DeleteInstanceGroupResp>('/api/instance/group/delete', req);
}

export interface GrantedUserReq {
  user_ids: string[];
  role_ids: string[];
  group_ids: string[];
}

export function grantedUser(req: GrantedUserReq) {
  return axios.post<DeleteInstanceGroupResp>('/api/instance/granted-user', req);
}

export interface QueryUserServerReq extends Partial<InstanceRecord> {
  ip?: string;
  instance_group_id?: number;
  statu?: number;
  page: number;
  page_size: number;
}

export interface QueryUserServerListResp {
  list: InstanceRecord[];
  total: number;
}

export function queryUserServerList(params: QueryUserServerReq) {
  return axios.get<QueryUserServerListResp>('/api/instance/user-server-list', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}
