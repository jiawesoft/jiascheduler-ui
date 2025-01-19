<template>
  <div class="container">
    <Breadcrumb
      :items="['menu.repository', 'menu.repository.jobBundleScript']"
    />
    <a-card class="general-card">
      <a-row>
        <a-col flex="auto">
          <a-form
            :model="formModel"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            :auto-label-width="true"
            label-align="left"
            @submit="search"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item field="name" :label="$t('jobBundleScript.name')">
                  <a-input v-model="formModel.name" />
                </a-form-item>
              </a-col>

              <a-col :span="8">
                <a-form-item
                  field="updatedTime"
                  :label="$t('columns.updatedTime')"
                >
                  <a-range-picker
                    v-model="formModel.updated_time_range"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-col flex="auto" style="display: flex; justify-content: end">
          <a-space direction="horizontal">
            <a-button type="primary" @click="search">
              <template #icon>
                <icon-search />
              </template>
              {{ $t('form.search') }}
            </a-button>
            <a-button @click="reset">
              <template #icon>
                <icon-refresh />
              </template>
              {{ $t('form.reset') }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-divider style="margin-top: 0" />
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button
              type="primary"
              size="small"
              @click="handleOpenJobModal($event, null)"
            >
              <template #icon>
                <icon-plus />
              </template>
              {{ $t('operations.create') }}
            </a-button>
          </a-space>
        </a-col>
        <a-col
          :span="12"
          style="display: flex; align-items: center; justify-content: end"
        >
          <a-tooltip :content="$t('columns.actions.refresh')">
            <div class="action-icon" @click="search"
              ><icon-refresh size="18"
            /></div>
          </a-tooltip>
          <a-dropdown @select="handleSelectDensity">
            <a-tooltip :content="$t('columns.actions.density')">
              <div class="action-icon"><icon-line-height size="18" /></div>
            </a-tooltip>
            <template #content>
              <a-doption
                v-for="item in densityList"
                :key="item.value"
                :value="item.value"
                :class="{ active: item.value === size }"
              >
                <span>{{ item.name }}</span>
              </a-doption>
            </template>
          </a-dropdown>
          <a-tooltip :content="$t('columns.actions.columnSetting')">
            <a-popover
              trigger="click"
              position="bl"
              @popup-visible-change="popupVisibleChange"
            >
              <div class="action-icon"><icon-settings size="18" /></div>
              <template #content>
                <div id="tableSetting">
                  <div
                    v-for="(item, index) in showColumns"
                    :key="item.dataIndex"
                    class="setting"
                  >
                    <div style="margin-right: 4px; cursor: move">
                      <icon-drag-arrow />
                    </div>
                    <div>
                      <a-checkbox
                        v-model="item.checked"
                        @change="
                          handleChange($event, item as TableColumnData, index)
                        "
                      >
                      </a-checkbox>
                    </div>
                    <div class="title">
                      {{ item.title === '#' ? '序列号' : item.title }}
                    </div>
                  </div>
                </div>
              </template>
            </a-popover>
          </a-tooltip>
        </a-col>
      </a-row>
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :columns="(cloneColumns as TableColumnData[])"
        :data="renderData"
        :bordered="false"
        :size="size"
        @page-change="onPageChange"
      >
        <template #index="{ rowIndex }">
          {{ rowIndex + 1 + (pagination.page - 1) * pagination.pageSize }}
        </template>

        <template #executor="{ record }">
          {{ execuotrs[record.executor_id as string] }}
        </template>

        <template #operations="{ record }">
          <a-button
            type="text"
            size="small"
            @click="handleOpenJobModal($event, record)"
          >
            {{ $t('operations.view') }}
          </a-button>
        </template>
      </a-table>
    </a-card>
    <a-modal
      v-model:visible="jobBundleScriptModalVisible"
      title-align="start"
      style="width: auto"
      :draggable="true"
      :ok-text="$t('form.save')"
      unmount-on-close
      width="50%"
      @before-ok="handleSaveJobBundleScript"
      @cancel="handleCancel"
    >
      <template #title> {{ $t('jobBundleScript.saveBundleScript') }}</template>
      <a-form
        ref="saveJobBundleScriptRef"
        :rules="jobBundleScriptFormValidateRules"
        :model="jobBundleScriptForm"
        :auto-label-width="true"
      >
        <a-form-item
          field="name"
          required
          validate-trigger="blur"
          :label="$t('jobBundleScript.name')"
        >
          <a-input v-model="jobBundleScriptForm.name" />
        </a-form-item>
        <a-form-item field="info" :label="$t('jobBundleScript.info')">
          <a-textarea v-model="jobBundleScriptForm.info" />
        </a-form-item>

        <a-form-item field="executor_id" :label="$t('job.executor')">
          <SelectExecutor v-model="jobBundleScriptForm.executor_id" />
        </a-form-item>
        <a-form-item field="code" :label="$t('jobBundleScript.code')">
          <v-ace-editor
            v-if="jobBundleScriptModalVisible"
            :key="jobBundleScriptForm.executor_id"
            v-model:value="jobBundleScriptForm.code"
            :style="{ height: '300px', width: '100%' }"
            :lang="getEditorLang"
            :print-margin="false"
            :theme="theme === 'dark' ? 'chaos' : 'chrome'"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import {
    JobBundleScriptRecord,
    queryJobBundleScriptList,
    QueryJobReq,
    saveJobBundleScript,
  } from '@/api/job';
  import {
    ExecutorRecord,
    queryExecutorList,
    QueryExecutorReq,
  } from '@/api/executor';
  import { getCommand } from '@/utils';
  import useLoading from '@/hooks/loading';
  import { Pagination } from '@/types/global';
  import type { SelectOptionData } from '@arco-design/web-vue/es/select/interface';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';

  import cloneDeep from 'lodash/cloneDeep';
  import Sortable from 'sortablejs';
  import { computed, nextTick, reactive, ref, toRefs, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useAppStore } from '@/store';
  import { VAceEditor } from 'vue3-ace-editor';
  // import 'ace-builds/src-noconflict/mode-json'; // Load the language definition file used below
  import { Message } from '@arco-design/web-vue';
  import 'ace-builds/src-noconflict/mode-python';
  import 'ace-builds/src-noconflict/mode-sh';
  import 'ace-builds/src-noconflict/mode-powershell';
  import 'ace-builds/src-noconflict/theme-chrome';
  import 'ace-builds/src-noconflict/theme-chaos';

  import SelectExecutor from '../components/select-executor.vue';

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };
  const jobBundleScriptModalVisible = ref(false);
  const saveJobBundleScriptRef = ref();

  const theme = computed(() => {
    return useAppStore().theme;
  });

  const state = reactive({
    jobBundleScriptForm: {
      id: 0,
      name: '',
      code: 'echo hello world',
      executor_id: 1,
      upload_file: '',
      args: {},
      info: '',
    },
  });
  const { jobBundleScriptForm } = toRefs(state);

  const generateFormModel = () => {
    return {
      name: '',
      updated_time_range: [],
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref<JobBundleScriptRecord[]>([]);
  const formModel = ref(generateFormModel());
  const cloneColumns = ref<Column[]>([]);
  const showColumns = ref<Column[]>([]);
  const jobOptions = ref<SelectOptionData[]>([]);

  const size = ref<SizeProps>('medium');

  const getEditorLang = computed<string>(() => {
    const executorItem = executorOptions.value.find(
      (item) => item.id === jobBundleScriptForm.value.executor_id
    );
    const currentCommand = executorItem ? executorItem.command : 'bash';
    return getCommand(currentCommand);
  });

  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };

  const execuotrs: { [key: string]: string } = {
    '1': 'bash',
    '2': 'python',
  };

  const pagination = reactive({
    ...basePagination,
  });
  const densityList = computed(() => [
    {
      name: t('columns.size.mini'),
      value: 'mini',
    },
    {
      name: t('columns.size.small'),
      value: 'small',
    },
    {
      name: t('columns.size.medium'),
      value: 'medium',
    },
    {
      name: t('columns.size.large'),
      value: 'large',
    },
  ]);
  const columns = computed<TableColumnData[]>(() => [
    {
      title: t('columns.index'),
      dataIndex: 'index',
      slotName: 'index',
    },
    {
      title: t('job.eid'),
      dataIndex: 'eid',
    },
    {
      title: t('jobBundleScript.name'),
      dataIndex: 'name',
    },
    {
      title: t('job.executor'),
      dataIndex: 'executor_name',
    },
    {
      title: t('team.name'),
      dataIndex: 'team_name',
    },
    {
      title: t('columns.updatedTime'),
      dataIndex: 'updated_time',
    },
    {
      title: t('columns.updatedUser'),
      dataIndex: 'updated_user',
    },
    {
      title: t('operations'),
      dataIndex: 'operations',
      slotName: 'operations',
    },
  ]);

  const jobBundleScriptFormValidateRules = {
    name: {
      required: true,
    },
  };

  const fetchData = async (
    params: QueryJobReq = { page: 1, page_size: 20, name: '' }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryJobBundleScriptList(params);
      renderData.value = data.list;
      pagination.page = params.page;
      pagination.total = data.total;
      jobOptions.value = data.list.map((v) => {
        return {
          label: v.name,
          value: v.eid,
        };
      });
    } catch (err) {
      // you can report use errorHandler or other
    } finally {
      setLoading(false);
    }
  };

  const handleOpenJobModal = (e: any, record: any) => {
    saveJobBundleScriptRef.value?.clearValidate();
    if (record) {
      jobBundleScriptForm.value = { ...record };
    } else {
      jobBundleScriptForm.value = {
        id: 0,
        name: '',
        code: '# type your code',
        executor_id: 1,
        upload_file: '',
        args: {},
        info: '',
      };
    }
    fetchExecutorData({ default_id: jobBundleScriptForm.value.executor_id });
    jobBundleScriptModalVisible.value = true;
  };

  const handleSaveJobBundleScript = async () => {
    const ret = await saveJobBundleScriptRef.value.validate();
    if (ret) {
      return false;
    }
    try {
      await saveJobBundleScript({
        ...jobBundleScriptForm.value,
      });
    } catch (err) {
      return false;
    }

    Message.success(t('form.submit.success'));
    search();
    return true;
  };

  const handleCancel = () => {
    jobBundleScriptModalVisible.value = false;
  };

  const search = () => {
    fetchData({
      ...basePagination,
      ...formModel.value,
    } as unknown as QueryJobReq);
  };
  const onPageChange = (current: number) => {
    fetchData({
      page_size: pagination.pageSize,
      page: current,
      ...formModel.value,
    });
  };

  fetchData();
  const reset = () => {
    formModel.value = generateFormModel();
  };

  const handleSelectDensity = (
    val: string | number | Record<string, any> | undefined,
    e: Event
  ) => {
    size.value = val as SizeProps;
  };

  const handleChange = (
    checked: boolean | (string | boolean | number)[],
    column: Column,
    index: number
  ) => {
    if (!checked) {
      cloneColumns.value = showColumns.value.filter(
        (item) => item.dataIndex !== column.dataIndex
      );
    } else {
      cloneColumns.value.splice(index, 0, column);
    }
  };

  const exchangeArray = <T extends Array<any>>(
    array: T,
    beforeIdx: number,
    newIdx: number,
    isDeep = false
  ): T => {
    const newArray = isDeep ? cloneDeep(array) : array;
    if (beforeIdx > -1 && newIdx > -1) {
      // 先替换后面的，然后拿到替换的结果替换前面的
      newArray.splice(
        beforeIdx,
        1,
        newArray.splice(newIdx, 1, newArray[beforeIdx]).pop()
      );
    }
    return newArray;
  };

  const popupVisibleChange = (val: boolean) => {
    if (val) {
      nextTick(() => {
        const el = document.getElementById('tableSetting') as HTMLElement;
        const sortable = new Sortable(el, {
          onEnd(e: any) {
            const { oldIndex, newIndex } = e;
            exchangeArray(cloneColumns.value, oldIndex, newIndex);
            exchangeArray(showColumns.value, oldIndex, newIndex);
          },
        });
      });
    }
  };

  const executorOptions = ref<ExecutorRecord[]>([]);
  const fetchExecutorData = async (params: {
    name?: string;
    default_id?: number;
  }) => {
    const { data } = await queryExecutorList({
      ...basePagination,
      ...params,
    } as unknown as QueryExecutorReq);
    executorOptions.value = data.list;
  };

  watch(
    () => columns.value,
    (val) => {
      cloneColumns.value = cloneDeep(val);
      cloneColumns.value.forEach((item, index) => {
        item.checked = true;
      });
      showColumns.value = cloneDeep(cloneColumns.value);
    },
    { deep: true, immediate: true }
  );
</script>

<script lang="ts">
  export default {
    name: 'JobList',
  };
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 20px 20px;
  }
  :deep(.arco-table-th) {
    &:last-child {
      .arco-table-th-item-title {
        margin-left: 16px;
      }
    }
  }
  .action-icon {
    margin-left: 12px;
    cursor: pointer;
  }
  .active {
    color: #0960bd;
    background-color: #e3f4fc;
  }
  .setting {
    display: flex;
    align-items: center;
    width: 200px;
    .title {
      margin-left: 12px;
      cursor: pointer;
    }
  }
</style>
