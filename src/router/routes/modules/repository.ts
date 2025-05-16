import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const REPOSITORY: AppRouteRecordRaw = {
  path: '/repository',
  name: 'repository',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.repository',
    requiresAuth: true,
    icon: 'icon-layers',
    order: 2,
  },
  children: [
    {
      path: 'job-list', // The midline path complies with SEO specifications
      name: 'JobList',
      component: () => import('@/views/respository/job-list/index.vue'),
      meta: {
        locale: 'menu.repository.jobList',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'workflow', // The midline path complies with SEO specifications
      name: 'workflowList',
      component: import('@/views/respository/workflow/index.vue'),
      children: [
        {
          path: 'edit',
          name: 'editWorkflow',
          component: () =>
            import('@/views/respository/workflow/edit/index.vue'),
          meta: {
            locale: 'menu.repository.editWorkflow',
            requiresAuth: true,
            hideInMenu: false,
            // activeMenu: 'workflowList',
            roles: ['*'],
          },
        },
      ],
      meta: {
        locale: 'menu.repository.workflow',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'job-timer-list', // The midline path complies with SEO specifications
      name: 'jobTimerList',
      component: () => import('@/views/respository/job-timer-list/index.vue'),
      meta: {
        locale: 'menu.repository.jobTimer',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'flow-job-list', // The midline path complies with SEO specifications
      name: 'flowJobList',
      component: () => import('@/views/respository/flow-job-list/index.vue'),
      meta: {
        locale: 'menu.repository.flowJobList',
        requiresAuth: true,
        hideInMenu: true,
        roles: ['*'],
      },
    },
    {
      path: 'daemon-job-list',
      name: 'daemonJobList',
      component: () => import('@/views/respository/daemon-job-list/index.vue'),
      meta: {
        locale: 'menu.repository.daemonJob',
        requiresAuth: true,
        roles: ['*'],
      },
    },

    {
      path: 'job-bundle-script-list', // The midline path complies with SEO specifications
      name: 'jobBundleScriptList',
      component: () =>
        import('@/views/respository/job-bundle-script-list/index.vue'),
      meta: {
        locale: 'menu.repository.jobBundleScript',
        requiresAuth: true,
        roles: ['*'],
      },
    },
  ],
};

export default REPOSITORY;
