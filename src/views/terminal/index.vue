<template>
  <div class="container">
    <div class="terminal-page">
      <div class="terminal-aside">
        <div class="terminal-logo">
          <a-avatar :size="24">
            <img src="/src/assets/logo.png" />
          </a-avatar>
        </div>
        <!-- <div class="terminal-list">
          <a-menu mode="pop" :default-collapsed="true">
            <a-sub-menu key="1">
              <template #icon><icon-apps></icon-apps></template>
              <a-menu-item key="2_0">Beijing</a-menu-item>
              <a-menu-item key="2_1">Shanghai</a-menu-item>
              <a-menu-item key="2_2">Guangzhou</a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="2">
              <template #icon><icon-bulb></icon-bulb></template>
              <a-menu-item key="3_0">Wuhan</a-menu-item>
              <a-menu-item key="3_1">Chengdu</a-menu-item>
            </a-sub-menu>
          </a-menu>
        </div> -->
      </div>
      <div class="terminal-main">
        <div
          ref="terminalRef"
          class="multi-terminal"
          :style="{
            height: commandVisible ? 'calc(100% - 184px)' : 'calc(100% - 34px)',
          }"
        >
          <splitpanes class="default-theme" @resize="splitResized">
            <pane
              v-for="item in splitTerminalList"
              :key="item.id"
              :min-size="10"
            >
              <terminal
                :id="item.id"
                :ref="(el) => handleSetRefMap(el, item.id)"
                :split-number="splitTerminalList.length"
                :selected="item.selected"
                :is-full="isFullscreen"
                :current-ip="item.ip"
                :namespace="item.namespace"
                :instance-id="item.instanceId"
                :server-ip-list="serverIpList"
                :loading="loading"
                @add-split="handleAddTerminal"
                @delete-split="handleDeleteTerminal"
                @full-screen-terminal="handleFullScreen"
                @outer-split-selected="outerSplitSelected"
                @fetch-list="fetchData"
                @change-ip="changeIp"
              ></terminal>
            </pane>
          </splitpanes>
        </div>
        <quick-command
          v-if="commandVisible"
          :connect-chat="connectChatNumber"
          @send-command="sendCommand"
        ></quick-command>
        <div class="terminal-footer">
          <div class="footer-inner" @click="showQuickCommand">
            <icon-code-square :stroke-width="2" :size="18" />
            <span class="command-text">{{
              $t('terminal.footer.quickCommand')
            }}</span>
            <icon-caret-down v-if="commandVisible" :size="12" />
            <icon-caret-up v-else :size="12" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Splitpanes, Pane } from 'splitpanes';
  import 'splitpanes/dist/splitpanes.css';

  import { computed, nextTick, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import useLoading from '@/hooks/loading';
  import { useDark, useToggle, useFullscreen } from '@vueuse/core';
  import { useAppStore } from '@/store';
  import {
    InstanceRecord,
    QueryUserServerReq,
    queryUserServerList,
  } from '@/api/instance';
  import { ServerList } from '@/api/terminal';
  import terminal from './components/terminal.vue';
  import quickCommand from './components/quick-command.vue';

  const terminalRef = ref<HTMLElement | null>(null);
  const { isFullscreen, toggle } = useFullscreen(terminalRef);

  const appStore = useAppStore();
  const isDark = useDark({
    selector: 'body',
    attribute: 'arco-theme',
    valueDark: 'dark',
    valueLight: 'light',
    storageKey: 'arco-theme',
    onChanged(dark: boolean) {
      appStore.toggleTheme(dark);
    },
  });
  useToggle(isDark);
  const route = useRoute();
  const currentIp = ref('');
  const instanceId = ref(`${route.query.instance_id}`);

  const terminalRefMap = ref({});

  interface splitItem {
    id: string;
    config?: string;
    selected?: boolean;
    ip?: string;
    namespace?: string;
    instanceId?: string;
  }
  const splitTerminalList = ref<splitItem[]>([]);

  const { loading, setLoading } = useLoading(false);
  const serverIpList = ref<InstanceRecord[]>([]);
  const fetchData = async (
    params: QueryUserServerReq = {
      page: 1,
      page_size: 20,
    }
  ) => {
    try {
      setLoading(true);
      const { data } = await queryUserServerList(params);
      serverIpList.value = data?.list || [];

      const currentIpItem = serverIpList.value.find(
        (v) => v.instance_id === instanceId.value
      );
      splitTerminalList.value = [
        {
          id: Math.random().toString(16).substring(2),
          ip: currentIpItem?.ip || '',
          namespace: currentIpItem?.namespace,
          instanceId: currentIpItem?.instance_id,
        },
      ];

      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  fetchData({ page: 1, page_size: 20, instance_id: instanceId.value });

  const changeIp = (ip: string) => {
    if (!ip) return;
    currentIp.value = ip;
  };

  // const HISTORYTERMINAL = 'historyTerminal';
  // const historyString = localStorage.getItem(HISTORYTERMINAL);

  // const router = useRouter();
  // router.replace('/terminal');

  const connectChatNumber = computed(() => {
    return appStore.connect_number;
  });

  function sendCommand(options: any) {
    nextTick(() => {
      if (!options.checkAllChat) {
        splitTerminalList.value.map((item) => {
          if (item.selected) {
            terminalRefMap.value[`Terminal_${item.id}`].sendCommand(
              `${options.command} \r`,
              false
            );
          }
          return item;
        });
      } else {
        splitTerminalList.value.map((item) => {
          terminalRefMap.value[`Terminal_${item.id}`].sendCommand(
            `${options.command} \r`,
            true
          );
          return item;
        });
      }
    });
  }

  function splitResized() {
    nextTick(() => {
      setTimeout(() => {
        splitTerminalList.value.map((item) => {
          terminalRefMap.value[`Terminal_${item.id}`].terminalResize();
          return item;
        });
      }, 200);
    });
  }

  function handleAddTerminal(server: ServerList) {
    const currentNum = appStore.connect_number;
    appStore.setConnectNumber(currentNum + 1);
    splitTerminalList.value.push({
      id: Math.random().toString(16).substring(2),
      ip: server.ip,
      namespace: server?.namespace,
      instanceId: server?.instanceId,
    });
    splitResized();
  }
  function handleDeleteTerminal(id: string) {
    const currentIndex = splitTerminalList.value.findIndex((o) => o.id === id);
    splitTerminalList.value.splice(currentIndex, 1);
    splitResized();
  }

  function handleFullScreen() {
    toggle();
    splitResized();
  }

  /** 动态设置Ref */
  const handleSetRefMap = (el: any, id: string) => {
    if (el) {
      terminalRefMap.value[`Terminal_${id}`] = el;
    }
  };

  const commandVisible = ref<boolean>(false);

  function showQuickCommand() {
    commandVisible.value = !commandVisible.value;
    splitResized();
  }

  function outerSplitSelected(id: string) {
    splitTerminalList.value = splitTerminalList.value.map((item) => {
      item.selected = false;
      if (item.id === id) {
        item.selected = true;
      }
      return item;
    });
  }
</script>

<style scoped lang="less">
  .container {
    // padding: 0 20px 20px 20px;
    display: flex;
    position: absolute;
    width: 100%;
    height: 100%;
  }
  .terminal-page {
    display: flex;
    flex: 1;
    position: relative;
    min-height: 336px;
    width: 100%;
    height: 100%;
    overflow: hidden;
    .terminal-aside {
      background-color: var(--color-neutral-3);
      border-right: 1px solid var(--color-neutral-4);
      width: 40px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      .terminal-logo {
        padding: 12px 0 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .terminal-list {
        flex: 1;
        :deep(.arco-menu) {
          background: none;
        }
        :deep(.arco-menu-inner) {
          padding: 4px;
        }
        :deep(.arco-menu-item) {
          padding: 0 12px;
          line-height: 40px;
          min-height: 40px;
        }
        :deep(.arco-menu-pop-header) {
          padding: 0 12px;
          line-height: 40px;
          min-height: 40px;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          background: none;
        }
        :deep(.arco-menu-pop-header:hover) {
          background: var(--color-bg-1);
        }
      }
    }
    .terminal-main {
      display: flex;
      width: calc(100% - 48px);
      flex-direction: column;
      .multi-terminal {
        width: 100%;
        // height: calc(100% - 16px);
        display: flex;
      }
      :deep(.splitpanes.default-theme .splitpanes__pane) {
        background-color: transparent;
      }
    }
  }
  .terminal-footer {
    display: flex;
    .footer-inner {
      padding: 0 10px;
      display: flex;
      height: 34px;
      align-items: center;
      font-size: 13px;
      cursor: pointer;
      color: var(--color-neutral-8);
      &:hover {
        color: rgb(var(--arcoblue-5));
      }
    }
    .command-text {
      padding: 0 3px;
    }
  }
</style>
