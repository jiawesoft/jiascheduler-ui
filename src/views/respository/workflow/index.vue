<template>
  <div>
    <router-view />
    <div v-if="!isEdit" class="container">
      <Breadcrumb :items="['menu.repository', 'menu.repository.jobList']" />
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
              <a-row :gutter="5">
                <a-col :span="20">
                  <a-form-item field="name" :label="$t('workflow.name')">
                    <a-input v-model="formModel.name" @press-enter="search" />
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
            <a-space direction="horizontal" size="large">
              <a-button
                type="primary"
                size="small"
                @click="handleOpenWorkflowModal($event, null)"
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
          :bordered="false"
          :size="size"
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
                  @click="router.push('workflow/edit?id=' + record.id)"
                >
                  {{ $t('operations.edit') }}
                </a-button>
              </a-space>
              <a-space>
                <a-button size="mini" @click="router.push('workflow/edit')">
                  {{ $t('workflow.version') }}
                </a-button>
              </a-space>
              <a-space>
                <a-button
                  size="mini"
                  status="success"
                  @click="handleOpenWorkflowVersionModal($event, record)"
                >
                  {{ $t('operations.dispatch') }}
                </a-button>
              </a-space>
              <a-space>
                <a-popconfirm
                  :content="$t('job.action.confirm.deleteJob')"
                  @before-ok="handleDeleteWorkflow($event, record)"
                >
                  <a-button type="dashed" size="mini" status="danger">
                    {{ $t('operations.delete') }}
                  </a-button>
                </a-popconfirm>
              </a-space>
            </a-space>
          </template>
        </a-table>
      </a-card>

      <a-modal
        v-model:visible="workflowModalVisible"
        title-align="start"
        style="width: auto"
        :draggable="true"
        :ok-text="$t('form.save')"
        unmount-on-close
        width="500px"
        @before-ok="handleSaveWorkflow"
        @cancel="handleCancel"
      >
        <template #title> {{ $t('workflow.save') }}</template>

        <a-form
          ref="saveWorkflowRef"
          :key="workflowForm.id"
          :rules="workflowFormValidateRules"
          :model="workflowForm"
          :auto-label-width="true"
        >
          <a-form-item
            field="name"
            workflowVersionModalVisible
            validate-trigger="blur"
            :label="$t('workflow.name')"
          >
            <a-input v-model="workflowForm.name" />
          </a-form-item>
          <a-form-item field="info" :label="$t('job.info')">
            <a-textarea v-model="workflowForm.info" />
          </a-form-item>
        </a-form>
      </a-modal>

      <a-modal
        v-model:visible="dispatchJobModalVisible"
        title-align="start"
        :draggable="true"
        :ok-text="$t('job.dispatch')"
        width="60%"
        @before-ok="handleDispatchJob"
        @cancel="handleCancel"
      >
        <template #title> {{ $t('job.schedule') }}</template>
        <a-form
          ref="dispatchJobRef"
          :model="dispatchJobForm"
          :rules="dispatchJobFormValidateRules"
          :auto-label-width="true"
        >
          <a-form-item
            field="schedule_name"
            validate-trigger="blur"
            :label="$t('job.schedule.name')"
          >
            <a-input v-model="dispatchJobForm.schedule_name" />
          </a-form-item>

          <a-form-item
            field="endpoints"
            validate-trigger="blur"
            :label="$t('job.endpoint')"
          >
            <SelectInstance
              v-if="dispatchJobModalVisible"
              v-model="dispatchJobForm.endpoints"
            />
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {
    deleteJob,
    dispatchJob,
    endpoint,
    JobAction,
    QueryJobReq,
    ScheduleType,
  } from '@/api/job';

  import useLoading from '@/hooks/loading';

  import { Pagination } from '@/types/global';
  import type { SelectOptionData } from '@arco-design/web-vue/es/select/interface';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import cloneDeep from 'lodash/cloneDeep';
  import Sortable from 'sortablejs';
  import { computed, nextTick, reactive, ref, toRefs, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { genVersionFromTime } from '@/utils/time';
  import { Message } from '@arco-design/web-vue';

  import { useRouter } from 'vue-router';
  import {
    saveWorkflow,
    queryWorkflowList,
    WorkflowRecord,
  } from '@/api/workflow';
  import SelectInstance from '../components/select-instance.vue';

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };
  const workflowModalVisible = ref(false);
  const dispatchJobModalVisible = ref(false);
  const saveWorkflowRef = ref();
  const dispatchJobRef = ref();
  const router = useRouter();

  const isEdit = computed(() => {
    console.log(
      'router.currentRoute.value.name',
      router.currentRoute.value.name
    );
    return router.currentRoute.value.name === 'editWorkflow';
  });

  interface WorkflowForm {
    id: number;
    name: string;
    info: string;
  }

  interface DispatchJobForm {
    eid: string;
    schedule_name: string;
    namespace: string;
    schedule_type: string;
    action: string;
    is_sync: boolean;
    endpoints: endpoint[];
  }

  const generateFormModel = () => {
    return {
      name: '',
      info: '',
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref<WorkflowRecord[]>([]);
  const formModel = ref(generateFormModel());
  const cloneColumns = ref<Column[]>([]);
  const showColumns = ref<Column[]>([]);

  const size = ref<SizeProps>('medium');

  const state = reactive<{
    workflowForm: WorkflowForm;
    dispatchJobForm: DispatchJobForm;
  }>({
    workflowForm: {
      id: 0,
      name: '',
      info: '',
    },
    dispatchJobForm: {
      eid: '',
      schedule_name: '',
      namespace: 'default',
      schedule_type: 'once',
      action: 'exec',
      is_sync: false,
      endpoints: [],
    },
  });
  const { workflowForm, dispatchJobForm } = toRefs(state);

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
      slotName: 'index',
    },

    {
      title: t('workflow.name'),
      dataIndex: 'name',
    },
    {
      title: t('workflow.info'),
      dataIndex: 'info',
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
      title: t('columns.createdUser'),
      dataIndex: 'created_user',
    },
    {
      title: t('operations'),
      dataIndex: 'operations',
      slotName: 'operations',
    },
  ]);

  const workflowFormValidateRules = {
    name: {
      required: true,
    },
  };
  const dispatchJobFormValidateRules = {
    schedule_name: {
      required: true,
    },
    endpoints: {
      required: true,
    },
  };

  const fetchData = async (
    params: QueryJobReq = {
      page: basePagination.page,
      page_size: basePagination.pageSize,
    }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryWorkflowList(params);

      renderData.value = data.list;
      pagination.page = params.page;
      pagination.total = data.total;
    } catch (err) {
      // you can report use errorHandler or other
    } finally {
      setLoading(false);
    }
  };

  const search = () => {
    fetchData({
      page: basePagination.page,
      page_size: basePagination.pageSize,
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

  // 刷新
  const refreshPage = () => {
    fetchData();
  };

  const handleOpenWorkflowModal = (e: any, record: any) => {
    saveWorkflowRef.value?.clearValidate();
    if (record) {
      workflowForm.value = {
        ...record,
      };
    } else {
      workflowForm.value = {
        id: 0,
        name: '',
        info: '',
      };
    }

    workflowModalVisible.value = true;
  };

  const handleDeleteWorkflow = async (e: any, record: any) => {
    setLoading(true);
    try {
      await deleteJob({
        eid: record.eid,
      });
    } finally {
      setLoading(false);
    }

    search();
    return true;
  };

  const handleOpenWorkflowVersionModal = (e: any, record: any) => {
    dispatchJobRef.value.clearValidate();
    dispatchJobForm.value = {
      ...record,
      schedule_name: `${record.name}-${genVersionFromTime()}`,
      ip: [],
      action: 'exec',
      schedule_type: 'once',
    };
    dispatchJobModalVisible.value = true;
  };

  const handleSaveWorkflow = async () => {
    const ret = await saveWorkflowRef.value.validate();
    if (ret) {
      return false;
    }
    try {
      const data = {
        ...workflowForm.value,
      };

      await saveWorkflow({
        ...data,
      });
    } catch (err) {
      return false;
    }

    Message.success(t('form.submit.success'));
    search();
    return true;
  };

  const handleDispatchJob = async () => {
    const ret = await dispatchJobRef.value.validate();
    if (ret) {
      return false;
    }
    try {
      await dispatchJob({
        schedule_type: dispatchJobForm.value.schedule_type as ScheduleType,
        eid: dispatchJobForm.value.eid,
        schedule_name: dispatchJobForm.value.schedule_name,
        action: dispatchJobForm.value.action as JobAction,
        is_sync: false,
        endpoints: dispatchJobForm.value.endpoints,
      });
    } catch (err) {
      return false;
    }
    Message.success(t('form.submit.success'));

    setTimeout(() => {
      router.push({
        path: '/run-status/run-list',
        query: {
          scheduleType: 'workflow',
        },
      });
    }, 200);

    return true;
  };

  const handleCancel = () => {
    workflowModalVisible.value = false;
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
