import { checkVersion } from '@/api/migration';
import { useAppStore } from '@/store';
import NProgress from 'nprogress'; // progress bar
import type { LocationQueryRaw, Router } from 'vue-router';

async function isInstall() {
  const appStore = useAppStore();
  if (!appStore.$state.bindAddr) {
    const { data } = await checkVersion();
    appStore.updateSettings({
      isInstalled: data.is_installed,
      needUpgrade: data.need_upgrade,
      bindAddr: data.bind_addr,
      appVersion: data.current_version,
      configFile: data.config_file,
    });
  }
  return appStore.$state.isInstalled;
}

export default function setupInstallGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    NProgress.start();

    const isPass = await isInstall();
    if (isPass && to.name === 'install') {
      next({
        name: 'Server',
      });
      return;
    }

    if (isPass || to.name === 'install') {
      next();
      return;
    }

    next({
      name: 'install',
      query: {
        redirect: to.name,
        ...to.query,
      } as LocationQueryRaw,
    });
  });
}
