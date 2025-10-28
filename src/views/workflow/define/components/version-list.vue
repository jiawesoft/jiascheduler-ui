<template>
  <a-row>
    <a-col flex="auto">
      <a-form
        key="search-workflow-version"
        :model="formModel"
        :label-col-props="{ span: 6 }"
        :auto-label-width="true"
        :wrapper-col-props="{ span: 18 }"
        label-align="left"
        @submit="search"
      >
        <a-row :gutter="5">
          <a-col :span="20">
            <a-form-item field="version" :label="$t('workflow.version')">
              <a-input v-model="formModel.version" @press-enter="search" />
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
    <a-col :span="22" />
    <a-col
      :span="2"
      style="display: flex; align-items: center; justify-content: end"
    >
      <a-tooltip :content="$t('columns.actions.refresh')">
        <div class="action-icon" @click="search">
          <icon-refresh size="18" />
        </div>
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
                :dataIndex="item.dataIndex"
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
                  {{ item.title === '#' ? t('columns.sn') : item.title }}
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
    :size="size"
    :bordered="false"
    @page-change="onPageChange"
  >
    <template #index="{ rowIndex }">
      {{ rowIndex + 1 + (pagination.page - 1) * pagination.pageSize }}
    </template>

    <template #operations="{ record }">
      <a-space direction="horizontal">
        <a-space>
          <a-button
            size="mini"
            @click="
              router.push(
                'define/edit?id=' +
                  record.workflow_id +
                  '&version_id=' +
                  record.id
              )
            "
          >
            {{ $t('operations.view') }}
          </a-button>
        </a-space>
        <a-space>
          <a-button
            size="mini"
            status="normal"
            type="outline"
            @click="handleStartProcessModal($event, record)"
          >
            {{ $t('operations.start') }}
          </a-button>
        </a-space>
        <a-space>
          <a-popconfirm
            :content="$t('workflow.action.confirm.delete')"
            @before-ok="handleDeleteWorkflowVersion($event, record)"
          >
            <a-button type="dashed" size="mini" status="danger">
              {{ $t('operations.delete') }}
            </a-button>
          </a-popconfirm>
        </a-space>
      </a-space>
    </template>
  </a-table>

  <!-- start process modal -->
  <a-modal
    v-model:visible="startProcessModalVisible"
    title-align="start"
    :draggable="true"
    :ok-text="$t('job.dispatch')"
    width="60%"
    @before-ok="handleStartProcess"
    @cancel="handleCancel"
  >
    <template #title> {{ $t('workflow.startProcess') }}</template>
    <a-form
      ref="startProcessFormRef"
      :model="startProcessForm"
      layout="vertical"
      :auto-label-width="true"
    >
      <a-form-item
        field="process_name"
        validate-trigger="blur"
        :label="$t('workflow.name')"
        required
      >
        <a-input v-model="startProcessForm.process_name" />
      </a-form-item>

      <a-form-item
        v-if="
          startProcessForm.user_variables &&
          startProcessForm.user_variables.length > 0
        "
        field="user_variables"
        :label="$t('workflow.userVariables')"
        :tooltip="$t('workflow.userVariables.tips')"
      >
        <workflow-user-variables
          :key="startProcessForm.id"
          v-model:args="startProcessForm.user_variables"
        />
      </a-form-item>

      <a-form-item>
        <a-collapse :default-active-key="['1']" :bordered="false">
          <a-collapse-item
            header="Beijing Toutiao Technology Co., Ltd."
            key="1"
          >
          </a-collapse-item>
        </a-collapse>
      </a-form-item>

      <a-form-item
        field="endpoints"
        validate-trigger="blur"
        :label="$t('workflow.defaultExecutionEndpoint')"
      >
        <a-collapse :default-active-key="['select-instance']" :bordered="false">
          <a-collapse-item
            :header="$t('workflow.defaultExecutionEndpoint.tips')"
            key="select-instance"
          >
            <SelectInstance
              v-if="startProcessModalVisible"
              v-model="defaultTarget"
            />
          </a-collapse-item>
        </a-collapse>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
  import useLoading from '@/hooks/loading';
  import { useAppStore } from '@/store';
  import { Pagination } from '@/types/global';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';

  import cloneDeep from 'lodash/cloneDeep';
  import Sortable from 'sortablejs';
  import { computed, nextTick, reactive, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';
  import { getFormatTimeVersion } from '@/utils/time';
  import { endpoint } from '@/api/job';
  import {
    deleteWorkflowVersion,
    queryWorkflowVersionList,
    QueryWorkflowVersionListReq,
    startWorkflowProcess,
    WorkflowProcessArgs,
    WorkflowUserVariables as UserVariables,
    WorkflowVersionRecord,
  } from '@/api/workflow';
  import SelectInstance from '@/views/respository/components/select-instance.vue';

  import WorkflowUserVariables from '@/components/workflow-user-variables/index.vue';

  const props = defineProps<{
    workflowId: number;
    workflowName: string;
  }>();

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };
  const visible = ref(false);
  const startProcessModalVisible = ref(false);
  const startProcessForm = ref<{
    process_args: WorkflowProcessArgs;
    user_variables?: UserVariables[];
    [key: string]: any;
  }>({
    workflow_id: 0,
    version_id: 0,
    process_name: '',
    process_args: {
      user_variables: {},
      default_target: [],
      nodes: [],
    },
  });

  const defaultTarget = ref<endpoint[]>([]);

  const theme = computed(() => {
    return useAppStore().theme;
  });

  const generateFormModel = () => {
    return {
      version: '',
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref<WorkflowVersionRecord[]>([]);
  const formModel = ref(generateFormModel());
  const startProcessFormRef = ref();
  const cloneColumns = ref<Column[]>([]);
  const showColumns = ref<Column[]>([]);
  const router = useRouter();

  const size = ref<SizeProps>('medium');

  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
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
      width: 20,
      slotName: 'index',
      fixed: 'left',
    },

    {
      title: t('workflow.version'),
      dataIndex: 'version',
      ellipsis: true,
      width: 140,
      tooltip: true,
      fixed: 'left',
    },

    {
      title: t('workflow.versionInfo'),
      dataIndex: 'version_info',
      ellipsis: true,
      width: 140,
      tooltip: true,
    },

    {
      title: t('columns.createdTime'),
      dataIndex: 'created_time',
      ellipsis: true,
      width: 120,
      tooltip: true,
    },

    {
      title: t('columns.createdUser'),
      dataIndex: 'created_user',
      ellipsis: true,
      width: 60,
      tooltip: true,
    },
    {
      title: t('operations'),
      dataIndex: 'operations',
      slotName: 'operations',
      width: 140,
      fixed: 'right',
    },
  ]);

  const fetchData = async (
    params: QueryWorkflowVersionListReq = {
      page: 1,
      page_size: 20,
      workflow_id: props.workflowId,
    }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryWorkflowVersionList(params);
      renderData.value = data.list;
      pagination.page = params.page;
      pagination.total = data.total;
    } catch (err) {
      // you can report use errorHandler or other
    } finally {
      setLoading(false);
    }
  };

  const refreshPage = () => {
    fetchData();
  };

  const handleStartProcessModal = (e: any, record: any) => {
    if (record) {
      startProcessForm.value = {
        ...record,
        version_id: record.id,
        process_name: `${props.workflowName}-${getFormatTimeVersion()}`,
        process_args: {
          user_variables: {},
          default_target: [],
          nodes: [],
        },
      };
    }

    startProcessModalVisible.value = true;
  };

  const handleCancel = () => {
    visible.value = false;
  };

  const search = () => {
    fetchData({
      page: basePagination.page,
      page_size: basePagination.pageSize,
      ...formModel.value,
      workflow_id: props.workflowId,
    } as unknown as QueryWorkflowVersionListReq);
  };
  const onPageChange = (current: number) => {
    fetchData({
      page_size: pagination.pageSize,
      page: current,
      ...formModel.value,
      workflow_id: props.workflowId,
    } as unknown as QueryWorkflowVersionListReq);
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
    cloneColumns.value = showColumns.value.filter((item) => item.checked);
  };

  const handleDeleteWorkflowVersion = async (e: any, record: any) => {
    setLoading(true);
    try {
      await deleteWorkflowVersion({
        workflow_id: record.workflow_id,
        version_id: record.id,
      });
    } finally {
      setLoading(false);
    }

    search();
    return true;
  };

  const popupVisibleChange = (val: boolean) => {
    if (val) {
      nextTick(() => {
        const el = document.getElementById('tableSetting') as HTMLElement;
        const sortable = new Sortable(el, {
          onEnd(e: any) {
            const { oldIndex, newIndex } = e;
            if (oldIndex !== newIndex) {
              const newList = e.from.children;
              const newArrayList: string[] = [];
              Array.from(newList).forEach((element: any) => {
                const currentDataIndex: string =
                  element.getAttribute('dataIndex') || '';
                newArrayList.push(currentDataIndex);
              });
              const resultList: Column[] = newArrayList
                .map((v) => {
                  return showColumns.value.find((m) => m.dataIndex === v);
                })
                .filter((v) => v !== undefined);
              showColumns.value = resultList;
              cloneColumns.value = resultList.filter((v) => v?.checked);
            }
          },
        });
      });
    }
  };

  const handleStartProcess = async () => {
    const ret = await startProcessFormRef.value.validate();
    if (ret) {
      return false;
    }

    const userVariables = {};
    if (startProcessForm.value.user_variables) {
      startProcessForm.value.user_variables.forEach((v) => {
        userVariables[v.name] = v.val;
      });
    }

    try {
      await startWorkflowProcess({
        workflow_id: startProcessForm.value.workflow_id,
        version_id: startProcessForm.value.version_id,
        process_name: startProcessForm.value.process_name,
        process_args: {
          ...startProcessForm.value.process_args,
          user_variables: userVariables,
          default_target: defaultTarget.value.map((v) => {
            return v.instance_id;
          }),
        },
      });
    } catch (err) {
      return false;
    }
    // Message.success(t('form.submit.success'));

    setTimeout(() => {
      router.push({
        path: '/workflow/process',
      });
    }, 200);

    return true;
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
    name: 'WorkflowVersionList',
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
