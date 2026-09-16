import axios from 'axios';
import qs from 'query-string';

/** 实例上配置的 SSH 登录用户（对应 instance.sys_users） */
export interface SysUser {
  username: string;
  /** password | key_path | key_content */
  auth_type: string;
  /** 密钥文件路径（auth_type=key_path 时返回） */
  key_path?: string;
  /** 密钥内容，出于安全考虑不会由服务端返回，仅在提交时使用 */
  key_content?: string;
  /** 密码，出于安全考虑不会由服务端返回，留空表示保持原值 */
  password?: string;
  /** 是否为默认登录用户 */
  is_default?: boolean;
  /**
   * 仅前端使用：服务端是否已保存该用户的凭证（密码或密钥内容）。
   * 服务端不下发凭证本身，用它来判断"保持原值"还是"尚未设置"。
   */
  has_stored?: boolean;
}

export interface InstanceRecord {
  id: number;
  ip: string;
  info: string;
  instance_group_id: number;
  instance_group: string;
  instance_id: string;
  sys_user: string;
  /** 实例上配置的多个 SSH 登录用户 */
  sys_users?: SysUser[];
  ssh_port?: number;
  /** agent 上报的 ssh 用户名 */
  ssh_user?: string;
  /** agent 上报的认证方式: password | key_path | key_content */
  ssh_auth_type?: string;
  namespace: string;
  status: number;
  updated_time: string;
  created_time: string;
}

/** /api/instance/user-server-list 返回的记录 */
export interface UserServerRecord {
  instance_id: string;
  ip: string;
  namespace: string;
  instance_group_id: number;
  instance_group: string;
  status: number;
  info: string;
  /** 系统用户（手动设置） */
  sys_user?: string;
  /** 实例上配置的多个 SSH 登录用户 */
  sys_users?: SysUser[];
  ssh_port?: number;
  /** agent 上报的 ssh 用户名 */
  ssh_user?: string;
  /** agent 上报的认证方式: password | key_path | key_content */
  ssh_auth_type?: string;
  created_time: string;
  updated_time: string;
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
  ips?: string[];
  instance_ids?: string[];
  instance_group_id?: number;
  status?: number;
  page: number;
  page_size: number;
}

export interface QueryUserServerListResp {
  list: InstanceRecord[];
  total: number;
}

export function queryUserServerList(params: QueryUserServerReq) {
  return axios.post<QueryUserServerListResp>(
    '/api/instance/user-server-list',
    params
  );
}
