import type { RouteRecordNormalized } from 'vue-router';
import { TeamRecord } from '@/api/team';

export interface AppState {
  theme: string;
  colorWeak: boolean;
  navbar: boolean;
  menu: boolean;
  topMenu: boolean;
  hideMenu: boolean;
  menuCollapse: boolean;
  footer: boolean;
  themeColor: string;
  menuWidth: number;
  globalSettings: boolean;
  device: string;
  tabBar: boolean;
  menuFromServer: boolean;
  serverMenu: RouteRecordNormalized[];
  [key: string]: unknown;
  connect_number: number;
  bindAddr: string;
  isInstalled: boolean;
  needUpgrade: boolean;
  appVersion: string;
  configFile: string;
  teamList: TeamRecord[];
  currentTeamId: number;
}
