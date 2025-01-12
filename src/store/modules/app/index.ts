import { getMenuList } from '@/api/user';
import defaultSettings from '@/config/settings.json';
import { Notification } from '@arco-design/web-vue';
import type { NotificationReturn } from '@arco-design/web-vue/es/notification/interface';
import { queryTeamList, QueryTeamListReq } from '@/api/team';
import { defineStore } from 'pinia';
import type { RouteRecordNormalized } from 'vue-router';
import { AppState } from './types';

const settingConfig = localStorage.getItem('setting-config');
const defaultConfig = settingConfig
  ? JSON.parse(settingConfig)
  : defaultSettings;
const useAppStore = defineStore('app', {
  state: (): AppState => ({
    ...defaultConfig,
    connect_number: 1,
    teamList: [],
    currentTeamId: -99,
  }),

  getters: {
    appCurrentSetting(state: AppState): AppState {
      return { ...state };
    },
    appDevice(state: AppState) {
      return state.device;
    },
    appAsyncMenus(state: AppState): RouteRecordNormalized[] {
      return state.serverMenu as unknown as RouteRecordNormalized[];
    },
    getTeamList(state: AppState) {
      return state.teamList;
    },
  },

  actions: {
    // Update app settings
    updateSettings(partial: Partial<AppState>) {
      // @ts-ignore-next-line
      this.$patch(partial);
    },

    // Change theme color
    toggleTheme(dark: boolean) {
      if (dark) {
        this.theme = 'dark';
        document.body.setAttribute('arco-theme', 'dark');
      } else {
        this.theme = 'light';
        document.body.removeAttribute('arco-theme');
      }
    },
    toggleDevice(device: string) {
      this.device = device;
    },
    toggleMenu(value: boolean) {
      this.hideMenu = value;
    },
    async fetchServerMenuConfig() {
      let notifyInstance: NotificationReturn | null = null;
      try {
        notifyInstance = Notification.info({
          id: 'menuNotice', // Keep the instance id the same
          content: 'loading',
          closable: true,
        });
        const { data } = await getMenuList();
        this.serverMenu = data;
        notifyInstance = Notification.success({
          id: 'menuNotice',
          content: 'success',
          closable: true,
        });
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        notifyInstance = Notification.error({
          id: 'menuNotice',
          content: 'error',
          closable: true,
        });
      }
    },
    clearServerMenu() {
      this.serverMenu = [];
    },
    setConnectNumber(val: number) {
      this.connect_number = val;
    },

    setBindAddr(val: string) {
      this.bindAddr = val;
    },
    setTeamId(id: number) {
      this.currentTeamId = id;
    },
    async queryTeamList(params: QueryTeamListReq) {
      const { data } = await queryTeamList(params);
      this.teamList = data?.list || [];
      if (this.currentTeamId === -99 && this.teamList.length > 0) {
        this.setTeamId(this.teamList[0].id);
      }
    },
  },
});

export default useAppStore;
