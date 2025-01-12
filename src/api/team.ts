import axios from 'axios';
import qs from 'query-string';

export interface QueryTeamListReq {
  default_id?: number;
  name?: string;
  page?: number;
  page_size?: number;
}

export interface TeamRecord {
  id: number;
  name: string;
  info: string;
  is_admin: boolean;
  user_total: string;
  created_time: string;
  created_user: string;
}

export interface QueryTeamListResp {
  list: TeamRecord[];
  total: number;
}

export interface RemoveTeamReq {
  team_id: number;
  user_ids?: string[];
}

export function queryTeamList(params: QueryTeamListReq) {
  return axios.get<QueryTeamListResp>('/api/team/list', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export function removeFile(data: RemoveTeamReq) {
  return axios.post('/api/team/remove-member', {
    ...data,
  });
}

export interface AddTeamReq {
  id?: number;
  name: string;
  info?: string;
  user_id?: string[];
}
export function addTeam(data: AddTeamReq) {
  return axios.post('/api/team/save', {
    ...data,
  });
}

export interface QueryTeamDetailReq {
  id: number;
}

export interface TeamDetailRecord {
  user_id: string;
  username?: string;
  is_admin?: boolean;
  created_time?: string;
}

export interface QueryTeamDetailResp {
  list: TeamDetailRecord[];
  id: number;
  name: string;
  info: string;
  created_user: string;
}

export function queryTeamDetail(params: QueryTeamDetailReq) {
  return axios.get<QueryTeamDetailResp>('/api/team/detail', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export interface TeamMember {
  user_id: string;
  is_admin: boolean;
}

export interface AddTeamUserReq {
  team_id: number;
  members: TeamMember[];
}
export function addTeamUser(data: AddTeamUserReq) {
  return axios.post('/api/team/add-member', {
    ...data,
  });
}
