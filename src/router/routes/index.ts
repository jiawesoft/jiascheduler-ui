import type { RouteRecordNormalized } from 'vue-router';

// const modules = import.meta.glob('./modules/*.ts', { eager: true });
const modules = import.meta.glob(
  [
    './modules/dashboard.ts',
    './modules/server.ts',
    './modules/run-status.ts',
    './modules/manage.ts',
    './modules/repository.ts',
    './modules/user.ts',
    './modules/terminal.ts',
    './modules/install.ts',
  ],
  { eager: true }
);
const externalModules = import.meta.glob('./externalModules/*.ts', {
  eager: true,
});

function formatModules(_modules: any, result: RouteRecordNormalized[]) {
  Object.keys(_modules).forEach((key) => {
    const defaultModule = _modules[key].default;
    if (!defaultModule) return;
    const moduleList = Array.isArray(defaultModule)
      ? [...defaultModule]
      : [defaultModule];
    result.push(...moduleList);
  });
  return result;
}

export const appRoutes: RouteRecordNormalized[] = formatModules(modules, []);

export const appExternalRoutes: RouteRecordNormalized[] = formatModules(
  externalModules,
  []
);
