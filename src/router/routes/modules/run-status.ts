import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const RUN_STATUS: AppRouteRecordRaw = {
  path: '/run-status',
  name: 'run-status',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.runStatus',
    requiresAuth: true,
    icon: 'icon-thunderbolt',
    order: 2,
  },
  children: [
    {
      path: 'run-list', // The midline path complies with SEO specifications
      name: 'RunList',
      component: () => import('@/views/run-status/run-list/index.vue'),
      meta: {
        locale: 'menu.runStatus.runList',
        requiresAuth: true,
        ignoreCache: true,
        roles: ['*'],
      },
    },
    {
      path: 'schedule-history', // The midline path complies with SEO specifications
      name: 'ScheduleList',
      component: () => import('@/views/run-status/schedule-list/index.vue'),
      meta: {
        locale: 'menu.runStatus.scheduleList',
        requiresAuth: true,
        ignoreCache: true,
        roles: ['*'],
      },
    },
    {
      path: 'exec-history', // The midline path complies with SEO specifications
      name: 'ExecList',
      component: () => import('@/views/run-status/exec-list/index.vue'),
      meta: {
        locale: 'menu.runStatus.execList',
        requiresAuth: true,
        ignoreCache: true,
        roles: ['*'],
      },
    },
  ],
};

export default RUN_STATUS;
