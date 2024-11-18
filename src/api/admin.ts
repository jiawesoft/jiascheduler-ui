import axios from 'axios';

import qs from 'query-string';
import { InstanceRecord } from './instance';

export interface PermissionRecord {
  action: string;
  name: string;
  object: string;
  key: string;
}

export interface queryAllPermissionResp {
  list: PermissionRecord[];
}

export function queryAllPermission() {
  return axios.get<queryAllPermissionResp>('/api/admin/permission/all', {
    // params: req,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export interface QueryAdminUserServerReq extends Partial<InstanceRecord> {
  user_id: string;
  ip?: string;
  instance_group_id?: number;
  statu?: number;
  page: number;
  page_size: number;
}

export interface QueryAdminUserServerListResp {
  list: InstanceRecord[];
  total: number;
}

export function queryAdminUserServerList(params: QueryAdminUserServerReq) {
  return axios.get<QueryAdminUserServerListResp>(
    '/api/admin/instance/user-server-list',
    {
      params,
      paramsSerializer: (obj) => {
        return qs.stringify(obj);
      },
    }
  );
}
