import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const RUN_STATUS: AppRouteRecordRaw = {
  path: '/manage',
  name: 'manage',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.manage',
    requiresAuth: true,
    icon: 'icon-settings',
    order: 3,
    roles: ['admin'],
  },
  children: [
    {
      path: 'instance-list', // The midline path complies with SEO specifications
      name: 'InstanceList',
      component: () => import('@/views/manage/instance-list/index.vue'),
      meta: {
        locale: 'menu.manage.instanceList',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: 'user-and-permissions', // The midline path complies with SEO specifications
      name: 'UserAndPermissions',
      component: () => import('@/views/manage/users-and-permissions/index.vue'),
      meta: {
        locale: 'menu.manage.usersAndPermissions',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: 'executor', // The midline path complies with SEO specifications
      name: 'Executor',
      component: () => import('@/views/manage/executor/index.vue'),
      meta: {
        locale: 'menu.manage.executor',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
  ],
};

export default RUN_STATUS;
