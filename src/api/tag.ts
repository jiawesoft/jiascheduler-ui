import axios from 'axios';

import qs from 'query-string';

export interface TagResourceReq {
  resource_type: string;
}
export interface TagRecord {
  tag_id: number;
  tag_name: string;
  total: number;
}

export interface queryTagResp {
  list: TagRecord[];
}

export function queryCountResource(params: TagResourceReq) {
  return axios.get<queryTagResp>('/api/tag/count_resource', {
    params,
    paramsSerializer: (obj) => {
      return qs.stringify(obj);
    },
  });
}

export interface TagItem {
  id: number;
  tag_name: string;
}

export interface TagBindReq {
  resource_id: number;
  resource_type: string;
  tag_name: string;
}

export interface TagBindRes {
  result: number;
}

export function bindTag(data: TagBindReq) {
  return axios.post<TagBindRes>('/api/tag/bind_tag', data);
}

export interface TagUnbindReq {
  resource_id: number;
  resource_type: string;
  tag_id: number;
}
export function unBindTag(data: TagUnbindReq) {
  return axios.post<TagBindRes>('/api/tag/unbind_tag', data);
}
