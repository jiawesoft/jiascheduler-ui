import { AppRouteRecordRaw } from '../types';

const TERMINAL: AppRouteRecordRaw = {
  path: '/terminal',
  name: 'terminal',
  component: () => import('@/views/terminal/index.vue'),
  meta: {
    locale: 'menu.terminal',
    hideInMenu: true,
    hideChildrenInMenu: true,
    requiresAuth: true,
    roles: ['*'],
  },
};

export default TERMINAL;
