import { AppRouteRecordRaw } from '../types';

const INSTALL: AppRouteRecordRaw = {
  path: '/install',
  name: 'install',
  component: () => import('@/views/install/index.vue'),
  meta: {
    locale: 'menu.install',
    hideInMenu: true,
    hideChildrenInMenu: true,
    requiresAuth: false,
    roles: ['*'],
  },
};

export default INSTALL;
