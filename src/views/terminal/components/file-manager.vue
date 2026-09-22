<template>
  <a-drawer
    width="60%"
    :visible="visible"
    :footer="false"
    @cancel="handleCancel"
  >
    <template #title>
      <a-space>
        {{ fileIp }}
        <!-- <a-tag color="blue" size="small" bordered>
          {{ currentIpParams.namespace }}
        </a-tag> -->
        {{ `(${currentIpParams.namespace})` }}
        {{ $t('terminal.uploadTitle') }}
        <a-tag v-if="sysUser" color="arcoblue" size="small">
          {{ $t('terminal.file.loginUser') }}: {{ sysUser }}
        </a-tag>
      </a-space>
    </template>
    <div class="file-body">
      <!-- In-drawer transfer progress: a reactive bar instead of a toast, because
           the toast api cannot re-render when only its content string changes. -->
      <div v-if="hasFinishedTask" class="transfer-actions">
        <a-button type="text" size="mini" @click="dismissFinished">
          {{ $t('terminal.transfer.clearDone') }}
        </a-button>
      </div>
      <transfer-list
        :tasks="tasks"
        @cancel="cancelTask"
        @dismiss="dismissTask"
      />
      <!-- <a-space> -->
      <!-- <a-button type="primary">
          <template #icon>
            <icon-plus />
          </template>
          <template #default>{{ $t('terminal.createNew') }}</template>
        </a-button> -->
      <!-- </a-space> -->
      <div class="file-path">
        <a-space>
          <a-button type="outline" @click="backFileEvent">
            <template #icon>
              <icon-undo />
            </template>
          </a-button>
          <a-input
            v-model="defaultPath"
            :style="{ width: '440px' }"
            :placeholder="$t('terminal.path')"
            allow-clear
            @press-enter="enterEvent"
          >
            <template #suffix>
              <icon-edit />
            </template>
          </a-input>
          <!-- <a-button type="outline">
            <template #icon>
              <icon-eye />
            </template>
          </a-button> -->
          <a-button type="outline" @click="refreshList">
            <template #icon>
              <icon-refresh />
            </template>
          </a-button>
        </a-space>
        <a-upload
          ref="uploadRef"
          multiple
          :custom-request="customRequest"
          :show-file-list="false"
        >
          <template #upload-button>
            <a-button type="primary">
              <template #icon>
                <icon-upload />
              </template>
              {{ $t('terminal.uploadFile') }}
            </a-button>
          </template>
        </a-upload>
      </div>
      <div class="file-list">
        <a-table
          v-model:selectedKeys="fileSelectedKeys"
          row-key="file_name"
          :loading="loading"
          :columns="fileColumns"
          :data="fileData"
          :pagination="false"
          :scroll="{
            x: '100%',
            y: '100%',
          }"
          @cell-click="tableCellClick"
        >
          <!-- <template #index="{ rowIndex }">
            {{ rowIndex + 1 }}
          </template> -->
          <template #fileName="{ record }">
            <div class="file-item">
              <div class="file-name">
                <img
                  v-if="record.file_type === 'Dir'"
                  class="file-icon"
                  src="/src/assets/images/dir.png"
                />
                <img
                  v-else
                  class="file-icon"
                  src="/src/assets/images/file.png"
                />
                <span class="arco-table-text-ellipsis">
                  {{ record.file_name }}
                </span>
              </div>

              <div class="file-group-btns">
                <a-space>
                  <a-button
                    v-if="record.file_type !== 'Dir'"
                    type="text"
                    size="small"
                    @click="downloadFileEvent(record)"
                  >
                    <template #icon>
                      <icon-download />
                    </template>
                  </a-button>
                  <a-button
                    type="text"
                    size="small"
                    @click="deleteFile(record)"
                  >
                    <template #icon>
                      <icon-delete />
                    </template>
                  </a-button>
                </a-space>
              </div>
            </div>
          </template>
          <template #size="{ record }">
            {{ bytesToSize(record.size) }}
          </template>
        </a-table>
      </div>
    </div>
  </a-drawer>
</template>

<script lang="ts" setup>
  import type { RequestOption } from '@arco-design/web-vue/es/upload/interfaces';
  import { ref, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import { Message, Modal } from '@arco-design/web-vue';
  import type {
    TableData,
    TableColumnData,
  } from '@arco-design/web-vue/es/table/interface';
  import {
    QueryFileListParams,
    FileRecord,
    queryFileList,
    removeFile,
    uploadFileInChunks,
    downloadFileStream,
    queryDownloadSize,
  } from '@/api/terminal';
  import TransferList from '@/components/transfer-list.vue';
  import {
    MAX_CONCURRENT_TRANSFERS,
    nextTransferId,
    type TransferTask,
  } from '@/components/transfer-types';

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false,
    },
    fileIp: {
      type: String,
      default: '',
    },
    sysUser: {
      type: String,
      default: '',
    },
    sessionId: {
      type: String,
      default: '',
    },
    currentIpParams: {
      type: Object,
      default: () => {
        return {
          ip: '',
          namespace: '',
          instanceId: '',
        };
      },
    },
  });
  const emit = defineEmits(['handleClose']);

  // function handleCloseTerminal(type: string) {
  //   emit('closeTerminal', type);
  // }
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();

  const fileSelectedKeys = ref([]);

  const fileData = ref<FileRecord[]>([]);

  // const fileRowSelection = reactive({
  //   type: 'checkbox',
  //   showCheckedAll: false,
  // });

  const fileColumns = computed<TableColumnData[]>(() => [
    // {
    //   title: t('terminal.file.columns.index'),
    //   dataIndex: 'index',
    //   slotName: 'index',
    // },
    {
      title: t('terminal.file.columns.name'),
      dataIndex: 'file_name',
      slotName: 'fileName',
      ellipsis: true,
      minWidth: 200,
    },
    {
      title: t('terminal.file.columns.size'),
      dataIndex: 'size',
      slotName: 'size',
      width: 120,
    },
    {
      title: t('terminal.file.columns.modified'),
      dataIndex: 'modified',
      width: 180,
    },
    {
      title: t('terminal.file.columns.permissions'),
      dataIndex: 'permissions',
      width: 130,
    },
  ]);

  const defaultPath = ref('');

  const fetchData = async (
    params: QueryFileListParams = {
      dir: defaultPath.value,
      terminal_session_id: props.sessionId,
    }
  ) => {
    setLoading(true);

    try {
      const { data } = await queryFileList({
        ...params,
      });
      defaultPath.value = data.current_dir;
      fileData.value = data.entry;
    } catch (err) {
      console.log('Error:', err);
      // Message.error(`${err}`);
    } finally {
      setLoading(false);
    }
  };

  fetchData();

  const refreshList = () => {
    fetchData();
  };

  const enterEvent = () => {
    fetchData();
  };

  const backFileEvent = () => {
    const currentPath = defaultPath.value.split('/');
    if (currentPath.length > 0) {
      currentPath.pop();
      defaultPath.value = currentPath.join('/');
    }
    fetchData();
  };

  const tableCellClick = (record: TableData, column: TableColumnData) => {
    if (record.file_type === 'Dir' && column.dataIndex === 'file_name') {
      // 继续请求下一级目录
      const homePath = defaultPath.value;
      defaultPath.value = `${homePath}/${record.file_name}`;
      fetchData();
    }
  };

  const uploadRef = ref();

  /** Aborts surface as DOMException/AbortError or axios' CanceledError. */
  function isAbortError(error: unknown): boolean {
    if (!error) return false;
    const name = (error as { name?: string })?.name;
    const code = (error as { code?: string })?.code;
    return (
      name === 'AbortError' ||
      name === 'CanceledError' ||
      code === 'ERR_CANCELED'
    );
  }

  /** Uploads and downloads run side by side, each with its own progress row. */
  const tasks = ref<TransferTask[]>([]);
  /** Abort handles keyed by task id, so any task can be cancelled individually. */
  const controllers = new Map<string, AbortController>();

  const runningCount = computed(
    () => tasks.value.filter((v) => v.status === 'running').length
  );
  const hasFinishedTask = computed(() =>
    tasks.value.some((v) => v.status === 'success' || v.status === 'failed')
  );

  /**
   * Create a task and return its id.
   *
   * Note: elements pushed into a `ref([])` are only turned into proxies when
   * they are read back through `tasks.value[i]`. Mutating the raw object that
   * was pushed does NOT trigger re-rendering, which is why every update below
   * goes through the task id and mutates the proxy found in the array.
   */
  function createTask(
    state: Pick<TransferTask, 'name' | 'direction' | 'total'>
  ): string {
    const task: TransferTask = {
      id: nextTransferId(),
      name: state.name,
      direction: state.direction,
      total: state.total,
      loaded: 0,
      percent: 0,
      status: 'pending',
    };
    tasks.value.push(task);
    return task.id;
  }

  /** Mutate the reactive proxy of a task, never the raw pushed object. */
  function patchTask(id: string, patch: Partial<TransferTask>): void {
    const task = tasks.value.find((v) => v.id === id);
    if (!task) return;
    Object.assign(task, patch);
  }

  function updateTask(id: string, loaded: number, total?: number): void {
    patchTask(id, {
      loaded,
      total,
      percent:
        total && total > 0
          ? Math.min(100, Math.round((loaded / total) * 100))
          : 0,
    });
  }

  function settleTask(
    id: string,
    status: 'success' | 'failed' | 'cancelled'
  ): void {
    patchTask(id, status === 'success' ? { status, percent: 100 } : { status });
    controllers.delete(id);
  }

  function cancelTask(id: string): void {
    const task = tasks.value.find((v) => v.id === id);
    if (!task) return;

    Modal.warning({
      title: t('terminal.transfer.cancel'),
      content: t('terminal.transfer.cancelConfirm', { name: task.name }),
      hideCancel: false,
      onOk: () => {
        controllers.get(id)?.abort();
        settleTask(id, 'cancelled');
        Message.info(`${task.name} ${t('terminal.transfer.cancelled')}`);
      },
    });
  }

  function dismissTask(id: string): void {
    tasks.value = tasks.value.filter((v) => v.id !== id);
  }

  function dismissFinished(): void {
    tasks.value = tasks.value.filter(
      (v) => v.status === 'running' || v.status === 'pending'
    );
  }

  /** Wait until fewer than the concurrency cap transfers are running. */
  async function acquireSlot(): Promise<void> {
    while (runningCount.value >= MAX_CONCURRENT_TRANSFERS) {
      // Polling a reactive counter keeps this simple and avoids a semaphore
      // implementation; the interval is short enough to feel instant.
      // eslint-disable-next-line no-await-in-loop
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 120);
      });
    }
  }

  const customRequest = (options: RequestOption) => {
    (async function requestWrap() {
      const { onProgress, onError, onSuccess, fileItem } = options;
      const filePath = `${defaultPath.value}/${fileItem.name}`;
      const total = (fileItem.file as Blob).size;
      const taskId = createTask({
        name: fileItem.name || '',
        direction: 'upload',
        total,
      });
      const controller = new AbortController();
      controllers.set(taskId, controller);

      try {
        await acquireSlot();
        patchTask(taskId, { status: 'running' });
        // Chunked upload: not bound by the 16MiB single frame limit, so large
        // files are supported.
        await uploadFileInChunks({
          file: fileItem.file as Blob,
          filePath,
          terminalSessionId: props.sessionId,
          signal: controller.signal,
          onProgress: (percent) => {
            onProgress(percent);
            updateTask(taskId, Math.round((percent / 100) * total), total);
          },
        });
        settleTask(taskId, 'success');
        Message.success(
          `${fileItem.name} ${t('terminal.transfer.uploadSuccess')}`
        );
        fetchData();
        onSuccess({});
      } catch (error) {
        // A user triggered abort is already reported by cancelTask.
        if (!isAbortError(error)) {
          settleTask(taskId, 'failed');
        }
        onError(error);
      }
    })();

    return {
      // Each file owns its own controller and is cancelled from the transfer
      // list, so there is nothing to abort here.
      abort: () => undefined,
    };
  };

  const bytesToSize = (bytes: number) => {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '-';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / 1024 ** i).toFixed(0);
    if (i === 0) {
      return '1 KB';
    }
    return `${size} ${units[i]}`;
  };

  const downloadFileEvent = async (record: FileRecord) => {
    const filePath = `${defaultPath.value}/${record.file_name}`;

    try {
      // Learn the size first: it feeds the progress bar and turns a silent empty
      // download into a real error.
      const size = await queryDownloadSize({
        filePath,
        terminalSessionId: props.sessionId,
      });
      const taskId = createTask({
        name: record.file_name,
        direction: 'download',
        total: size,
      });
      const controller = new AbortController();
      controllers.set(taskId, controller);

      await acquireSlot();
      patchTask(taskId, { status: 'running' });

      const blob = await downloadFileStream({
        filePath,
        terminalSessionId: props.sessionId,
        total: size,
        signal: controller.signal,
        onProgress: (percent) => {
          updateTask(taskId, Math.round((percent / 100) * size), size);
        },
      });
      settleTask(taskId, 'success');

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = record.file_name;
      link.click();
      // Revoking synchronously can cancel the download before the browser has
      // taken the blob, so release the object url on a later task instead.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);

      Message.success(
        `${record.file_name} ${t(
          'terminal.transfer.downloadSuccess'
        )} (${bytesToSize(size)})`
      );
    } catch (err) {
      if (isAbortError(err)) {
        return;
      }
      // Surface the real reason instead of a bare "Error"
      const reason = err instanceof Error ? err.message : `${err}`;
      Message.error(reason);
      console.error('sftp download failed', err);
    }
  };

  const deleteFile = async (record: FileRecord) => {
    setLoading(true);
    try {
      await removeFile({
        remove_type: record.file_type.toLowerCase(),
        path: `${defaultPath.value}/${record.file_name}`,
        terminal_session_id: props.sessionId,
      });
      Message.success(`success`);
      fetchData();
    } catch (err) {
      console.log('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    emit('handleClose');
  };
</script>

<style lang="less" scoped>
  .file-body {
    height: 100%;
  }
  .file-path {
    margin: 0 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .arco-input-wrapper {
      border: 1px solid #92a0bd;
      &.arco-input-focus {
        border-color: rgb(var(--primary-6));
      }
    }
  }
  .file-list {
    height: calc(100% - 50px);
  }
  .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 28px;
    .file-name {
      display: flex;
      align-items: center;
      cursor: pointer;
      flex: 1;
      min-width: 0;
    }
    .file-icon {
      width: 20px;
      padding-right: 3px;
    }
    .file-group-btns {
      display: none;
    }
    &:hover {
      .file-group-btns {
        display: block;
      }
    }
  }
</style>
