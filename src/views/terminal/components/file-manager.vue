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
      </a-space>
    </template>
    <div class="file-body">
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
  import { Message } from '@arco-design/web-vue';
  import type {
    TableData,
    TableColumnData,
  } from '@arco-design/web-vue/es/table/interface';
  import {
    QueryFileListParams,
    FileRecord,
    queryFileList,
    uploadFile,
    removeFile,
  } from '@/api/terminal';

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
    currentIpParams: {
      type: Object,
      default: () => {
        return {
          ip: '',
          namespace: '',
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
      ip: props.fileIp,
      dir: defaultPath.value,
      namespace: props.currentIpParams.namespace,
    }
  ) => {
    setLoading(true);

    try {
      const { data } = await queryFileList(params);
      defaultPath.value = data.current_dir;
      fileData.value = data.entry;
    } catch (err) {
      Message.error(`${err}`);
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

  const customRequest = (options: RequestOption) => {
    // docs: https://axios-http.com/docs/cancellation
    const controller = new AbortController();

    (async function requestWrap() {
      const {
        onProgress,
        onError,
        onSuccess,
        fileItem,
        name = 'file',
      } = options;
      onProgress(20);
      const formData = new FormData();
      formData.append('ip', props.fileIp);
      formData.append('namespace', props.currentIpParams.namespace);
      formData.append('file_path', `${defaultPath.value}/${fileItem.name}`);
      formData.append(name as string, fileItem.file as Blob);
      const onUploadProgress = (event: ProgressEvent) => {
        let percent;
        if (event.total > 0) {
          percent = (event.loaded / event.total) * 100;
        }
        onProgress(parseInt(String(percent), 10), event);
      };

      try {
        const res = await uploadFile(formData, {
          controller,
          onUploadProgress,
        });
        fetchData();
        onSuccess(res);
      } catch (error) {
        onError(error);
      }
    })();
    return {
      abort() {
        controller.abort();
      },
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
    try {
      const filePath = `${defaultPath.value}/${record.file_name}`;
      const url = `/api/file/sftp/tunnel/download?ip=${props.fileIp}&file_path=${filePath}&namespace=${props.currentIpParams.namespace}`;
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = record.file_name;
      downloadLink.click();
    } catch (err) {
      Message.error(`${err}`);
    }
  };
  const deleteFile = async (record: FileRecord) => {
    setLoading(true);
    try {
      await removeFile({
        ip: props.fileIp,
        remove_type: record.file_type.toLowerCase(),
        path: `${defaultPath.value}/${record.file_name}`,
        namespace: props.currentIpParams.namespace,
      });
      Message.success(`success`);
      fetchData();
    } catch (err) {
      Message.error(`${err}`);
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
