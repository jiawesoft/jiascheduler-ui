<template>
  <div class="navbar">
    <div class="left-side">
      <a-space>
        <img alt="logo" class="jiascheduler-logo" src="/src/assets/logo.png" />
        <a-typography-title
          :style="{ margin: 0, fontSize: '18px' }"
          :heading="5"
        >
          {{ $t('app.name') }}
        </a-typography-title>
        <icon-menu-fold
          v-if="!topMenu && appStore.device === 'mobile'"
          style="font-size: 22px; cursor: pointer"
          @click="toggleDrawerMenu"
        />
      </a-space>
    </div>
    <div class="center-side">
      <Menu v-if="topMenu" />
    </div>
    <ul class="right-side">
      <!-- <li>
        <a-tooltip :content="$t('settings.search')">
          <a-button class="nav-btn" type="outline" :shape="'circle'">
            <template #icon>
              <icon-search />
            </template>
          </a-button>
        </a-tooltip>
      </li> -->
      <li>
        <!-- allow-search -->
        <a-select
          :popup-visible="teamVisible"
          class="team-select"
          :placeholder="$t('team.select.placeholder')"
          popup-container=".navbar"
          allow-clear
          @popup-visible-change="handlePopupVisibleChange"
        >
          <!-- <a-option>
            <a-space>
              <icon-user />
              <div class="select-option-text">我的个人空间</div>
            </a-space>
          </a-option> -->
          <a-option v-for="item in teamList" :key="item.name">
            <a-space>
              <icon-user-group />
              <div class="select-option-text">{{ item.name }}</div>
            </a-space>
          </a-option>
          <!-- <a-option>
            <a-space>
              <icon-user-group />
              <div class="select-option-text"
                >16421941642194060团队1642194060团队060团队</div
              >
            </a-space>
          </a-option> -->
          <template #footer>
            <div class="team-manager">
              <a-button type="text" @click="goToTeamPage">
                <template #icon>
                  <icon-relation />
                </template>
                <span class="team-text">{{ $t('menu.user.team') }}</span>
              </a-button>
            </div>
          </template>
        </a-select>
      </li>
      <li>
        <a-tooltip :content="$t('settings.language')">
          <a-button
            class="nav-btn"
            type="outline"
            :shape="'circle'"
            @click="setDropDownVisible"
          >
            <template #icon>
              <icon-language />
            </template>
          </a-button>
        </a-tooltip>
        <a-dropdown trigger="click" @select="changeLocale as any">
          <div ref="triggerBtn" class="trigger-btn"></div>
          <template #content>
            <a-doption
              v-for="item in locales"
              :key="item.value"
              :value="item.value"
            >
              <template #icon>
                <icon-check v-show="item.value === currentLocale" />
              </template>
              {{ item.label }}
            </a-doption>
          </template>
        </a-dropdown>
      </li>
      <li>
        <a-tooltip
          :content="
            theme === 'light'
              ? $t('settings.navbar.theme.toDark')
              : $t('settings.navbar.theme.toLight')
          "
        >
          <a-button
            class="nav-btn"
            type="outline"
            :shape="'circle'"
            @click="handleToggleTheme"
          >
            <template #icon>
              <icon-moon-fill v-if="theme === 'dark'" />
              <icon-sun-fill v-else />
            </template>
          </a-button>
        </a-tooltip>
      </li>
      <!-- <li>
        <a-tooltip :content="$t('settings.navbar.alerts')">
          <div class="message-box-trigger">
            <a-badge :count="9" dot>
              <a-button
                class="nav-btn"
                type="outline"
                :shape="'circle'"
                @click="setPopoverVisible"
              >
                <icon-notification />
              </a-button>
            </a-badge>
          </div>
        </a-tooltip>
        <a-popover
          trigger="click"
          :arrow-style="{ display: 'none' }"
          :content-style="{ padding: 0, minWidth: '400px' }"
          content-class="message-popover"
        >
          <div ref="refBtn" class="ref-btn"></div>
          <template #content>
            <message-box />
          </template>
        </a-popover>
      </li> -->
      <li>
        <a-tooltip
          :content="
            isFullscreen
              ? $t('settings.navbar.screen.toExit')
              : $t('settings.navbar.screen.toFull')
          "
        >
          <a-button
            class="nav-btn"
            type="outline"
            :shape="'circle'"
            @click="toggleFullScreen"
          >
            <template #icon>
              <icon-fullscreen-exit v-if="isFullscreen" />
              <icon-fullscreen v-else />
            </template>
          </a-button>
        </a-tooltip>
      </li>
      <!-- <li>
        <a-tooltip :content="$t('settings.title')">
          <a-button
            class="nav-btn"
            type="outline"
            :shape="'circle'"
            @click="setVisible"
          >
            <template #icon>
              <icon-settings />
            </template>
          </a-button>
        </a-tooltip>
      </li> -->
      <li>
        <a-dropdown trigger="click">
          <a-avatar
            :size="32"
            :style="{
              marginRight: '8px',
              cursor: 'pointer',
              backgroundColor: stringColor(avatar),
            }"
          >
            <!-- todo: random bg color -->
            <span>{{ avatar[0] }}</span>
            <!-- <img alt="avatar" :src="avatar" /> -->
          </a-avatar>
          <template #content>
            <!-- <a-doption>
              <a-space @click="switchRoles">
                <icon-tag />
                <span>
                  {{ $t('messageBox.switchRoles') }}
                </span>
              </a-space>
            </a-doption> -->
            <!-- <a-doption>
              <a-space @click="$router.push({ name: 'Info' })">
                <icon-user />
                <span>
                  {{ $t('messageBox.userCenter') }}
                </span>
              </a-space>
            </a-doption> -->
            <a-doption>
              <a-space @click="setVisible">
                <icon-apps />
                <span>
                  {{ $t('settings.title') }}
                </span>
              </a-space>
            </a-doption>
            <a-doption>
              <a-space @click="$router.push({ name: 'Setting' })">
                <icon-settings />
                <span>
                  {{ $t('messageBox.userSettings') }}
                </span>
              </a-space>
            </a-doption>
            <a-doption>
              <a-space @click="handleLogout">
                <icon-export />
                <span>
                  {{ $t('messageBox.logout') }}
                </span>
              </a-space>
            </a-doption>
          </template>
        </a-dropdown>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, inject } from 'vue';
  import { useRouter } from 'vue-router';
  // import { Message } from '@arco-design/web-vue';
  import { useDark, useToggle, useFullscreen } from '@vueuse/core';
  import { useAppStore, useUserStore } from '@/store';
  import { LOCALE_OPTIONS } from '@/locale';
  import { stringColor } from '@/utils';
  import useLocale from '@/hooks/locale';
  import useUser from '@/hooks/user';
  import Menu from '@/components/menu/index.vue';
  // import MessageBox from '../message-box/index.vue';

  const router = useRouter();
  const appStore = useAppStore();
  const userStore = useUserStore();
  const { logout } = useUser();
  const { changeLocale, currentLocale } = useLocale();
  const { isFullscreen, toggle: toggleFullScreen } = useFullscreen();
  const locales = [...LOCALE_OPTIONS];
  const avatar = computed(() => {
    return userStore.avatar || userStore.nickname;
  });
  const theme = computed(() => {
    return appStore.theme;
  });
  const teamList = computed(() => {
    return appStore.getTeamList;
  });
  const topMenu = computed(() => appStore.topMenu && appStore.menu);
  const isDark = useDark({
    selector: 'body',
    attribute: 'arco-theme',
    valueDark: 'dark',
    valueLight: 'light',
    storageKey: 'arco-theme',
    onChanged(dark: boolean) {
      // overridden default behavior
      appStore.toggleTheme(dark);
    },
  });
  const toggleTheme = useToggle(isDark);
  const handleToggleTheme = () => {
    toggleTheme();
  };
  const setVisible = () => {
    appStore.updateSettings({ globalSettings: true });
  };
  // const refBtn = ref();
  const triggerBtn = ref();
  // const setPopoverVisible = () => {
  //   const event = new MouseEvent('click', {
  //     view: window,
  //     bubbles: true,
  //     cancelable: true,
  //   });
  //   refBtn.value.dispatchEvent(event);
  // };
  const handleLogout = () => {
    logout();
  };
  const setDropDownVisible = () => {
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    triggerBtn.value.dispatchEvent(event);
  };
  // const switchRoles = async () => {
  //   const res = await userStore.switchRoles();
  //   Message.success(res as string);
  // };
  const toggleDrawerMenu = inject('toggleDrawerMenu') as () => void;

  const teamVisible = ref(false);
  appStore.queryTeamList({});

  const handlePopupVisibleChange = (visible: boolean) => {
    teamVisible.value = visible;
  };

  const goToTeamPage = () => {
    router.push({ name: 'Team' });
    teamVisible.value = false;
  };

  // const stringColor = (str: string) => {
  //   let hash = 0;
  //   for (let i = 0; i < str.length; i += 1) {
  //     /* eslint no-bitwise: 0 */
  //     hash = str.charCodeAt(i) + ((hash << 5) - hash);
  //   }

  //   let color = '#';
  //   for (let i = 0; i < 3; i += 1) {
  //     /* eslint no-bitwise: 0 */
  //     const value = (hash >> (i * 8)) & 0xff;
  //     const str = `00${value.toString(16)}`.slice(-2);
  //     color = `${color}${str}`;
  //   }
  //   return color;
  // };
</script>

<style scoped lang="less">
  .navbar {
    display: flex;
    justify-content: space-between;
    height: 100%;
    background-color: var(--color-bg-2);
    border-bottom: 1px solid var(--color-border);
    :deep(.team-select) {
      min-width: 186px;
    }
    :deep(.team-select.arco-select-view-single) {
      border: 1px solid rgb(var(--primary-3));
    }
    :deep(
        .team-select.arco-select-view-single:focus-within,
        .team-select.arco-select-view-single.arco-select-view-focus
      ) {
      border: 1px solid rgb(var(--primary-6));
    }

    .team-manager {
      :deep(.arco-btn) {
        width: 100%;
        padding: 0 12px;
        justify-content: flex-start;
      }
      .team-text {
        padding-left: 2px;
      }
    }
    .select-option-text {
      width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .left-side {
    display: flex;
    align-items: center;
    padding-left: 20px;
    .jiascheduler-logo {
      width: 33px;
      height: 33px;
      border-radius: 4px;
    }
  }

  .center-side {
    flex: 1;
  }

  .right-side {
    display: flex;
    padding-right: 20px;
    list-style: none;
    :deep(.locale-select) {
      border-radius: 20px;
    }
    li {
      display: flex;
      align-items: center;
      padding: 0 10px;
    }

    a {
      color: var(--color-text-1);
      text-decoration: none;
    }
    .nav-btn {
      border-color: rgb(var(--gray-2));
      color: rgb(var(--gray-8));
      font-size: 16px;
    }
    .trigger-btn,
    .ref-btn {
      position: absolute;
      bottom: 14px;
    }
    .trigger-btn {
      margin-left: 14px;
    }
  }
</style>

<style lang="less">
  .message-popover {
    .arco-popover-content {
      margin-top: 0;
    }
  }
</style>
