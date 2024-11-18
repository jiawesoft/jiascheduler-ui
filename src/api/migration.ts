import axios from 'axios';

export interface CheckVersionResp {
  is_installed: boolean;
  current_version: string;
  need_upgrade: boolean;
  bind_addr: string;
  config_file: string;
}

export function checkVersion() {
  return axios.get<CheckVersionResp>('/api/migration/version/check');
}

export interface DatabaseConnectionModel {
  redis_url: string;
  database_url: string;
  database_type: string;
}
export interface DataModel {
  username: string;
  password: string;
  comet_secret: string;
}

export type InstallModel = DatabaseConnectionModel & DataModel;

export function installApp(data: InstallModel) {
  return axios.post('/api/migration/install', { ...data });
}
