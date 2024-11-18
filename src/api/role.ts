import axios from 'axios';

import qs from 'query-string';

export interface RoleRecord {
  id: number;
  name: string;
  info: string;
  user_total: number;
  created_time: string;
  created_user: string;
}

export interface QueryRoleListReq extends Partial<RoleRecord> {
  default_id?: number;
  page: number;
  page_size: number;
}

export interface QueryRoleListResp {
  list: RoleRecord[];
  total: number;
}

export function queryRoleList(req: QueryRoleListReq) {
  return axios.get<QueryRoleListResp>('/api/role/list', {
    params: req,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

type SaveRoleReq = Partial<RoleRecord>;

export interface SaveRoleResp {
  ret: number;
}

export function saveRole(req: SaveRoleReq) {
  return axios.post<SaveRoleResp>('/api/role/save', req);
}

export interface BindInstanceReq {
  role_id: number;
  instance_ids?: number[];
  instance_group_ids?: number[];
}

export interface BindInstanceResp {
  result: number;
}

export function bindInstance(req: BindInstanceReq) {
  return axios.post<BindInstanceResp>('/api/role/bind-instance', req);
}

export interface UnindInstanceReq {
  role_id: number;
  instance_ids: number[];
  instance_group_ids: number[];
}

export interface UnindInstanceResp {
  result: number;
}

export function unbindInstance(req: BindInstanceReq) {
  return axios.post<UnindInstanceResp>('/api/role/unbind-instance', req);
}

export interface SetUserReq {
  role_id: number;
  user_ids: number[];
}

export interface SetUserResp {
  affected: number;
}

export function setUser(req: SetUserReq) {
  return axios.post<SetUserResp>('/api/role/set-user', req);
}
