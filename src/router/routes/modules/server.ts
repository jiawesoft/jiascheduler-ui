import { AppRouteRecordRaw } from '../types';
import { DEFAULT_LAYOUT } from '../base';

const Server: AppRouteRecordRaw = {
  path: '/assets',
  name: 'Assets',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.assets',
    requiresAuth: true,
    icon: 'icon-storage',
    order: 1,
    roles: ['*'],
  },
  children: [
    {
      path: 'server',
      name: 'Server',
      component: () => import('@/views/assets/server/index.vue'),
      meta: {
        locale: 'menu.assets.server',
        requiresAuth: true,
        roles: ['*'],
      },
    },
  ],
};

export default Server;
