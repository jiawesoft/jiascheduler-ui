<template>
  <div class="terminal-screen">
    <div v-if="!isFull" class="terminal-header">
      <div v-if="serverList.length > 0" class="server-scroll-list">
        <a-scrollbar ref="scrollBarRef" style="height: 47px; overflow: auto">
          <div style="height: 46px; display: flex">
            <div
              v-for="item in serverList"
              :key="item.key"
              :class="[
                'tab-item',
                { selected: item.key === currentServerIndex },
              ]"
              @click="handleServerTab(item)"
              @contextmenu.prevent="openMenu(item, $event)"
            >
              <span class="server-key">{{ item.key }}</span>
              <span class="server-ip">
                {{ item.ip }}
                ({{ item.namespace }})
              </span>
              <div class="server-close" @click.stop="deleteServer(item)">
                <icon-close size="12"></icon-close>
              </div>
              <div
                v-if="item.color"
                :style="{ background: item.color }"
                class="border-bottom"
              ></div>
            </div>
          </div>
        </a-scrollbar>
        <context-menu
          :context-visible="contextVisible"
          :top="top"
          :left="left"
          :list-number="serverList.length"
          @color-change="terminalColorChange"
          @close-terminal="closeTerminal"
        ></context-menu>
      </div>
      <div class="server-handle-groups">
        <div class="handle-btn">
          <a-dropdown>
            <a-button type="text" status="normal">
              <template #icon>
                <icon-plus size="20" :stroke-width="2" />
              </template>
            </a-button>
            <template #content>
              <a-doption
                v-for="history in curHistoryList"
                :key="history.ip"
                @click="handleAddTerminal(history)"
              >
                <template #icon>
                  <icon-link />
                </template>
                <template #default
                  >{{ history.ip }}
                  <a-tag color="blue" size="small" bordered>{{
                    history.namespace
                  }}</a-tag></template
                >
              </a-doption>
              <a-doption @click="handleNewTerminal">
                <template #icon>
                  <icon-plus-circle />
                </template>
                <template #default>{{ $t('terminal.newConnect') }}</template>
              </a-doption>
            </template>
          </a-dropdown>
          <!-- <a-button type="text" status="normal">
            <template #icon>
              <icon-plus
                size="20"
                :stroke-width="2"
                @click="handleAddTerminal"
              />
            </template>
          </a-button> -->
        </div>
        <div class="handle-btn">
          <a-button type="text" :disabled="splitNumber > 3">
            <template #icon>
              <icon-layout
                size="20"
                :stroke-width="2"
                @click="handleSpliceTerminal"
              />
            </template>
          </a-button>
        </div>
        <div class="handle-btn">
          <a-button type="text">
            <template #icon>
              <icon-fullscreen
                size="20"
                :stroke-width="2"
                @click="handleFullScreenTerminal"
              />
            </template>
          </a-button>
        </div>
      </div>
    </div>
    <div v-if="!isFull" class="terminal-sub-header">
      <div class="sub-header-left">
        <div class="handle-btn" @click="showFileManager">
          <icon-folder size="20" :stroke-width="2"></icon-folder>
        </div>
      </div>
    </div>
    <div
      class="terminal-body"
      :style="{ height: isFull ? '100%' : 'calc(100% - 86px)' }"
    >
      <template v-for="item in serverList" :key="item.key">
        <terminal-body
          v-show="item.key === currentServerIndex"
          :ref="(el) => setRefMap(el, item.key)"
          :ip="item.ip"
          :terminal="item"
          @focus-terminal="focusTerminal"
        ></terminal-body>
      </template>
    </div>
    <new-connect
      v-if="isNewCreate"
      :is-create="isNewCreate"
      :render-data="serverIpList"
      :loading="loading"
      @cancel-modal="cancelModal"
      @add-terminal="handleAddTerminal"
      @fetch-data="fetchIpList"
    ></new-connect>
    <file-manager
      v-if="isShowFile"
      :visible="isShowFile"
      :file-ip="fileIp"
      :current-ip-params="currentIpParams"
      :sys-user="sysUser"
      @handle-close="handleCloseFile"
    ></file-manager>
  </div>
</template>

<script lang="ts" setup>
  import { nextTick, ref, watch, PropType, computed } from 'vue';
  import { useAppStore } from '@/store';
  import { InstanceRecord } from '@/api/instance';
  import { cloneDeep } from 'lodash';

  import terminalBody from './terminal-body.vue';
  import contextMenu from './context-menu.vue';
  import newConnect from './new-connect.vue';
  import fileManager from './file-manager.vue';

  const props = defineProps({
    splitNumber: {
      type: Number,
      default: 1,
    },
    id: {
      type: String,
      default: '',
    },
    currentIp: {
      type: String,
      default: '',
    },
    sysUser: {
      type: String,
      default: '',
    },
    namespace: {
      type: String,
      default: '',
    },
    isFull: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    serverIpList: {
      type: Array as PropType<InstanceRecord[]>,
      default() {
        return [];
      },
    },
  });

  const appStore = useAppStore();

  const emit = defineEmits([
    'addSplit',
    'deleteSplit',
    'fullScreenTerminal',
    'outerSplitSelected',
    'fetchList',
    'changeIp',
  ]);

  const fetchIpList = (params) => {
    emit('fetchList', params);
  };

  interface HistoryList {
    ip: string;
    id?: number;
    namespace?: string;
  }
  const historyList = ref<HistoryList[]>([]);

  const HISTORYTERMINAL = 'historyTerminal';
  const setHistoryTerminal = (history: HistoryList) => {
    if (!history.ip) return;
    const historyString = localStorage.getItem(HISTORYTERMINAL);
    historyList.value = historyString ? JSON.parse(historyString) : [];
    const filterItem = historyList.value.filter(
      (value) =>
        value.ip === history.ip && value.namespace === history.namespace
    );
    if (filterItem.length > 0) {
      const index = historyList.value.findIndex(
        (item) => item.ip === history.ip && item.namespace === history.namespace
      );
      historyList.value.splice(index, 1);
    }
    historyList.value.push({
      ip: history.ip,
      namespace: history.namespace || 'default',
    });
    if (historyList.value.length > 5) {
      historyList.value.shift();
    }
    localStorage.setItem(HISTORYTERMINAL, JSON.stringify(historyList.value));
  };

  const curHistoryList = computed(() => {
    const list = cloneDeep(historyList.value);
    return list.reverse();
  });

  const currentServerIndex = ref<number>(1);
  interface ServerList {
    ip: string;
    key: number;
    info?: string;
    config?: string;
    color?: string;
    selected?: boolean;
    namespace?: string;
  }
  const serverList = ref<ServerList[]>([]);
  if (props.currentIp) {
    serverList.value = [
      {
        ip: `${props.currentIp}`,
        key: currentServerIndex.value,
        selected: true,
        namespace: props.namespace || 'default',
      },
    ];
    setHistoryTerminal({
      ip: `${props.currentIp}`,
      namespace: props.namespace || 'default',
    });
  }

  // const currentEnv = import.meta.env.VITE_APP_ENV;
  // const wsProtocol = currentEnv === 'development' ? 'ws:' : 'wss:';
  // const socketUrl = ref('')
  // const getSocketUrl = (ip: string) => {
  //   return `${wsProtocol}//${window.location.host}/terminal/webssh/${ip}`;
  // }
  // getSocketUrl(`${props.currentIp}`)

  // const router = useRouter();
  // router.replace('/terminal');

  const scrollBarRef = ref<HTMLElement | null>(null);

  const terminalBodyRefMap = ref({});
  function terminalResize() {
    nextTick(() => {
      terminalBodyRefMap.value[
        `Terminal_body_${props.id}_${currentServerIndex.value}`
      ].resize();
    });
  }

  function handleServerTab(item: ServerList) {
    currentServerIndex.value = item.key;
    terminalResize();
    emit('outerSplitSelected', props.id);
    if (props.selected) {
      nextTick(() => {
        terminalBodyRefMap.value[
          `Terminal_body_${props.id}_${currentServerIndex.value}`
        ].selectedTerminal(true);
      });
    }
  }

  function handleAddTerminal(list: HistoryList) {
    const curIp = list.ip || props.currentIp;
    // const addServerKey = serverList.value.length + 1;
    const lastServer = serverList.value[serverList.value.length - 1];
    serverList.value.push({
      ip: `${curIp}`,
      key: lastServer ? lastServer.key + 1 : 1,
      namespace: list.namespace || 'default',
    });
    currentServerIndex.value = lastServer ? lastServer.key + 1 : 1;
    nextTick(() => {
      scrollBarRef.value?.scrollTo({
        left: 99999,
      });
    });
    const currentNum = appStore.connect_number;
    appStore.setConnectNumber(currentNum + 1);
    setHistoryTerminal({
      ip: `${curIp}`,
      namespace: list.namespace || 'default',
    });
  }

  const isNewCreate = ref(false);
  function handleNewTerminal() {
    isNewCreate.value = true;
  }
  function cancelModal() {
    isNewCreate.value = false;
  }

  const contextVisible = ref(false);

  function deleteServer(item?: ServerList) {
    if (!item) {
      return;
    }
    const currentIndex = serverList.value.findIndex((o) => o.key === item.key);
    serverList.value.splice(currentIndex, 1);
    if (currentServerIndex.value === item.key && serverList.value.length > 0) {
      const lastServer = serverList.value[serverList.value.length - 1];
      currentServerIndex.value = lastServer.key;
    }
    if (props.splitNumber > 1 && serverList.value.length === 0) {
      emit('deleteSplit', props.id);
    }
    contextVisible.value = false;
  }

  function handleSpliceTerminal() {
    const seletedItem = serverList.value.find(
      (v) => v.key === currentServerIndex.value
    );
    emit('changeIp', seletedItem?.ip);
    emit('addSplit');
  }

  function handleFullScreenTerminal() {
    emit('fullScreenTerminal');
  }

  /** 动态设置Ref */
  const setRefMap = (el: any, key: number) => {
    if (el) {
      terminalBodyRefMap.value[`Terminal_body_${props.id}_${key}`] = el;
    }
  };

  const top = ref(0);
  const left = ref(0);
  const openCurrentItem = ref<ServerList>();

  function openMenu(item: ServerList, e: any) {
    openCurrentItem.value = item;
    const offsetLeft = 48; // container margin left
    const l = e.clientX - offsetLeft + 15; // 15: margin right
    left.value = l;
    top.value = 48;
    contextVisible.value = true;
  }
  function closeMenu() {
    contextVisible.value = false;
  }

  watch(contextVisible, (value: boolean) => {
    if (value) {
      document.body.addEventListener('click', closeMenu);
    } else {
      document.body.removeEventListener('click', closeMenu);
    }
  });

  function terminalColorChange(color: string) {
    serverList.value = serverList.value.map((item) => {
      if (item.key === openCurrentItem.value?.key) {
        item.color = color;
      }
      return item;
    });
  }

  function closeTerminal(type: string) {
    if (type === 'current') {
      deleteServer(openCurrentItem.value);
    }
    if (type === 'other') {
      if (serverList.value.length === 1) return;
      const otherServerList = serverList.value.filter(
        (item) => item.key !== openCurrentItem.value?.key
      );
      otherServerList.forEach((item) => {
        deleteServer(item);
      });
    }
    if (type === 'all') {
      serverList.value = [];
      if (props.splitNumber > 1 && serverList.value.length === 0) {
        emit('deleteSplit', props.id);
      }
      contextVisible.value = false;
    }

    terminalResize();
  }

  watch(
    () => props.selected,
    (value: boolean) => {
      nextTick(() => {
        terminalBodyRefMap.value[
          `Terminal_body_${props.id}_${currentServerIndex.value}`
        ].selectedTerminal(value);
      });
    }
  );
  const focusTerminal = () => {
    emit('outerSplitSelected', props.id);
  };

  const sendCommand = (content: string, isAll) => {
    nextTick(() => {
      if (isAll) {
        serverList.value.map((item) => {
          terminalBodyRefMap.value[
            `Terminal_body_${props.id}_${item.key}`
          ].sendCmd(content);
          return item;
        });
      } else {
        terminalBodyRefMap.value[
          `Terminal_body_${props.id}_${currentServerIndex.value}`
        ].sendCmd(content);
      }
    });
  };

  const isShowFile = ref(false);
  const fileIp = ref('');
  const currentIpParams = ref({
    ip: '',
    namespace: '',
  });
  const showFileManager = () => {
    isShowFile.value = true;

    const seletedItem = serverList.value.find(
      (v) => v.key === currentServerIndex.value
    );
    fileIp.value = seletedItem ? seletedItem?.ip : '';
    currentIpParams.value = {
      ip: seletedItem?.ip || '',
      namespace: seletedItem?.namespace || 'default',
    };
  };

  const handleCloseFile = () => {
    isShowFile.value = false;
  };

  defineExpose({
    terminalResize,
    sendCommand,
  });
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
      width: 48px;
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
        height: calc(100% - 16px);
        display: flex;
      }
      .terminal-screen {
        // flex: 1;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        .terminal-body {
          // flex: 1;
          height: calc(100% - 86px);
        }
      }
      .terminal-header {
        display: flex;
        background-color: var(--color-neutral-3);
        height: 46px;
        overflow: hidden;
        width: 100%;
        .server-scroll-list {
          max-width: calc(100% - 140px);
          min-width: 120px;
          .tab-item {
            min-width: 120px;
            max-width: 240px;
            flex-shrink: 0;
            box-sizing: border-box;
            padding: 12px 20px;
            cursor: pointer;
            position: relative;
            z-index: 1;
            border-right: 1px solid var(--color-neutral-4);
            display: flex;
            align-items: center;
            height: 100%;
            span.server-key {
              margin-right: 8px;
              color: var(--color-neutral-6);
              font-family: Menlo;
              font-size: 12px;
              font-weight: 700;
            }
            span.server-ip {
              position: relative;
              z-index: 3;
              font-size: 12px;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
              max-width: 100%;
              color: var(--color-neutral-8);
            }
            .border-bottom {
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 2px;
            }
            .server-close {
              position: absolute;
              right: 8px;
              top: calc(50% - 9px);
              z-index: 5;
              display: none;
              align-items: center;
              justify-content: center;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              margin-left: 5px;
              color: var(--color-neutral-10);
              // background-color: rgb(211, 210, 210);
              // box-shadow: -10px 0 15px 11px rgb(223, 223, 223);
              &:hover {
                border-radius: 4px;
                background: var(--color-neutral-4);
              }
            }

            &.selected {
              background: var(--color-neutral-2);
              border-left-color: transparent;
              border-right-color: transparent;
              span.server-ip {
                color: var(--color-neutral-10);
              }
              &:hover {
                &:after {
                  background: linear-gradient(
                    271.95deg,
                    var(--color-neutral-2) 60%,
                    rgba(235, 237, 241, 0) 122.76%
                  );
                }
              }
            }
            &:hover {
              .server-close {
                display: flex;
              }
              &:after {
                position: absolute;
                content: '';
                width: 52px;
                height: 90%;
                right: 0;
                top: 5%;
                z-index: 4;
                background: linear-gradient(
                  271.95deg,
                  var(--color-neutral-3) 60%,
                  rgba(235, 237, 241, 0) 122.76%
                );
              }
            }
          }
        }
        .terminal-server-list {
          display: flex;
          align-items: center;
          width: 100%;
          height: 46px;
        }
        .server-handle-groups {
          display: flex;
          align-items: center;
          width: 300px;
          .handle-btn {
            margin: 0 8px;
          }
        }
      }
      .terminal-sub-header {
        display: flex;
        background-color: var(--color-neutral-2);
        width: 100%;
        padding: 0 16px;
        box-sizing: border-box;
        justify-content: space-between;
        height: 40px;
        .sub-header-left {
          display: flex;
          align-items: center;
        }
      }
      .handle-btn {
        width: 24px;
        height: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        position: relative;
        color: var(--color-text-1);
        :deep(.arco-btn-text, .arco-btn-text[type='button']) {
          color: var(--color-text-1);
          padding: 0 5px;
        }
        :deep(
            .arco-btn-text.arco-btn-disabled,
            .arco-btn-text[type='button'].arco-btn-disabled
          ) {
          color: var(--color-neutral-5);
        }
      }
    }
  }

  .server-scroll-list {
    :deep(.arco-scrollbar-track-direction-horizontal) {
      height: 10px;
    }
    :deep(
        .arco-scrollbar-thumb-direction-horizontal .arco-scrollbar-thumb-bar
      ) {
      height: 5px;
      margin: 3px 0 2px;
    }
  }
</style>
