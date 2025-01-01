import axios from 'axios';
import qs from 'query-string';

export interface QueryTeamListParams {
  id?: number;
  name?: string;
  page?: number;
  page_size?: number;
}

export interface TeamListRes {
  id: number;
  name: string;
  info?: string;
  user_total?: string;
  created_time?: string;
  created_user?: string;
}

export interface QueryTeamListRes {
  list: TeamListRes[];
  total: number;
}

export interface RemoveTeamParams {
  team_id: number;
  user_ids?: string[];
}

export function queryTeamList(params: QueryTeamListParams) {
  return axios.get<QueryTeamListRes>('/api/team/list', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function removeFile(data: RemoveTeamParams) {
  return axios.post('/api/team/remove-member', {
    ...data,
  });
}

export interface AddTeamParams {
  id?: number;
  name: string;
  info?: string;
  user_id?: string[];
}
export function addTeam(data: AddTeamParams) {
  return axios.post('/api/team/save', {
    ...data,
  });
}

export interface QueryTeamDetailParams {
  id: number;
}

export interface TeamDetailRes {
  user_id: string;
  username?: string;
  is_admin?: boolean;
  created_time?: string;
}

export interface QueryTeamDetailRes {
  list: TeamDetailRes[];
  id: number;
  name: string;
  info: string;
  created_user: string;
}

export function queryTeamDetail(params: QueryTeamDetailParams) {
  return axios.get<QueryTeamDetailRes>('/api/team/detail', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export interface TeamUserPrams {
  user_id: string;
  is_admin: boolean;
}

export interface AddTeamUserParams {
  team_id: number;
  members: TeamUserPrams[];
}
export function addTeamUser(data: AddTeamUserParams) {
  return axios.post('/api/team/add-member', {
    ...data,
  });
}
