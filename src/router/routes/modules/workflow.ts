import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const REPOSITORY: AppRouteRecordRaw = {
  path: '/workflow',
  name: 'Workflow',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.workflow',
    requiresAuth: true,
    icon: 'icon-layers',
    order: 2,
  },
  children: [
    {
      path: '/workflow/define', // The midline path complies with SEO specifications
      name: 'workflowIndex',
      component: () => import('@/views/workflow/define/layout.vue'),
      children: [
        {
          path: '',
          name: 'workflowList',
          component: () => import('@/views/workflow/define/index.vue'),
          meta: {
            locale: 'menu.workflow.define',
            requiresAuth: true,
            hideInMenu: true,
            activeMenu: 'workflowIndex',
            roles: ['*'],
          },
        },
        {
          path: 'edit',
          name: 'editWorkflow',
          component: () => import('@/views/workflow/define/edit.vue'),
          meta: {
            locale: 'menu.workflow.edit',
            requiresAuth: true,
            hideInMenu: true,
            activeMenu: 'workflowIndex',
            roles: ['*'],
          },
        },
      ],
      meta: {
        locale: 'menu.workflow.define',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'timer', // The midline path complies with SEO specifications
      name: 'WorkflowTimer',
      component: () => import('@/views/workflow/timer/index.vue'),
      meta: {
        locale: 'menu.workflow.timer',
        requiresAuth: true,
        ignoreCache: true,
        roles: ['*'],
      },
    },
    {
      path: 'process', // The midline path complies with SEO specifications
      name: 'ProcessList',
      component: () => import('@/views/workflow/process/index.vue'),
      meta: {
        locale: 'menu.workflow.processList',
        requiresAuth: true,
        ignoreCache: true,
        roles: ['*'],
      },
    },
  ],
};

export default REPOSITORY;
