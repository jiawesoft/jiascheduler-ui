import axios from 'axios';
import type { RouteRecordNormalized } from 'vue-router';
import qs from 'query-string';

import { UserState } from '@/store/modules/user/types';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginRes {
  token: string;
}
export function login(data: LoginParams) {
  return axios.post<LoginRes>('/api/user/login', data);
}

export function logout() {
  return axios.post<LoginRes>('/api/user/logout');
}

export function getUserInfo() {
  return axios.post<UserState>('/api/user/info');
}

export function getMenuList() {
  return axios.post<RouteRecordNormalized[]>('/api/user/menu');
}

export interface UserInfo {
  username: string;
  nickname: string;
  role_id: number;
  role: string;
  avatar: string;
  email: string;
  gender: string;
  created_time?: string;
  updated_time?: string;
  introduction: string;
  phone: string;
  user_id: string;
}

type UpdateUserInfoReq = Partial<UserInfo>;

export interface updateUserResp {
  ret: number;
}

export function updateUserInfo(data: UpdateUserInfoReq) {
  return axios.post<updateUserResp>('/api/user/update-info', data);
}

export function adminUpdateUserInfo(data: UpdateUserInfoReq) {
  return axios.post<updateUserResp>('/api/admin/user/update-info', data);
}

export interface QueryUserListReq extends Partial<UserInfo> {
  keyword?: string;
  ignore_role_id?: number;
  page: number;
  page_size: number;
}

export interface QueryUserListRes {
  list: UserInfo[];
  total: number;
}

export function queryUserList(params: QueryUserListReq) {
  return axios.get<QueryUserListRes>('/api/user/list', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export type UserRegisterReq = Partial<UserInfo>;

export interface UserRegisterResp {
  ret: number;
}

export function userRegister(req: UserRegisterReq) {
  return axios.post<UserRegisterResp>('/api/user/register', req);
}
