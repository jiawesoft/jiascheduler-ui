<template>
  <div class="container">
    <Breadcrumb :items="['menu.repository', 'menu.repository.jobTimer']" />
    <a-card class="general-card">
      <a-row>
        <a-col flex="auto">
          <a-form
            :model="formModel"
            :auto-label-width="true"
            label-align="left"
            @submit="search"
          >
            <a-row :gutter="5">
              <a-col :span="7">
                <a-form-item field="name" :label="$t('job.timer.name')">
                  <a-input
                    v-model="formModel.name"
                    :placeholder="$t('job.timer.name.placeholder')"
                    @press-enter="search"
                  />
                </a-form-item>
              </a-col>

              <a-col :span="10">
                <a-form-item
                  field="updated_time_range"
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
        <a-col :span="2">
          <a-space direction="horizontal" size="large">
            <a-button
              type="primary"
              size="small"
              @click="handleOpenWorkflowTimerModal($event, null)"
            >
              <template #icon>
                <icon-plus />
              </template>
              {{ $t('operations.create') }}
            </a-button>
          </a-space>
        </a-col>
        <a-col :span="20">
          <tag-item
            :tag-list="tagList"
            @query-tag-list="queryTagList"
          ></tag-item>
        </a-col>
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
        :bordered="false"
        :size="size"
        @page-change="onPageChange"
      >
        <template #index="{ rowIndex }">
          {{ rowIndex + 1 + (pagination.page - 1) * pagination.pageSize }}
        </template>
        <template #tags="{ record }">
          <table-tag-item
            :tag-list="record.tags"
            :resource-id="record.id"
            :resource-type="resourceType"
            @refresh-page="refreshPage"
          ></table-tag-item>
        </template>

        <template #operations="{ record }">
          <a-space direction="horizontal">
            <a-space>
              <a-button
                size="mini"
                @click="handleOpenWorkflowTimerModal($event, record)"
              >
                {{ $t('operations.edit') }}
              </a-button>
            </a-space>
            <a-space>
              <a-button
                size="small"
                status="success"
                @click="handleOpenScheduleWorkflowTimerModal($event, record)"
              >
                {{ $t('operations.dispatch') }}
              </a-button>
            </a-space>
            <a-space>
              <a-popconfirm
                :content="$t('job.action.confirm.deleteJobTimer')"
                @before-ok="handleDeleteWorkflowTimer($event, record)"
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

    <!-- save workflow timer -->
    <a-modal
      v-model:visible="saveWorkflowTimerModalVisible"
      title-align="start"
      style="width: auto"
      :draggable="true"
      :ok-text="$t('form.save')"
      width="auto"
      @before-ok="handleSubmitWorkflowTimer"
      @cancel="handleCancel"
    >
      <template #title> {{ $t('job.saveTimer') }}</template>
      <a-form
        ref="saveWorkflowTimerRef"
        :rules="saveWorkflowTimerFormValidateRules"
        :model="workflowTimerForm"
        :auto-label-width="true"
      >
        <a-form-item
          field="name"
          required
          validate-trigger="blur"
          :label="$t('workflow.timer.name')"
        >
          <a-input v-model="workflowTimerForm.name" />
        </a-form-item>
        <a-form-item field="info" :label="$t('job.timer.info')">
          <a-textarea v-model="workflowTimerForm.info" />
        </a-form-item>

        <a-form-item
          field="timer_expr"
          required
          :tooltip="$t('job.timerExpr.tooltips')"
          :label="$t('job.timerExpr')"
        >
          <a-input-group>
            <a-select
              :options="['local', 'utc']"
              :style="{ width: '160px' }"
              placeholder="timezone"
              v-model="workflowTimerForm.timer_expr.timezone"
            />
            <a-input
              v-model="workflowTimerForm.timer_expr.expr"
              placeholder="timer expr"
              style="width: 100%"
            />
          </a-input-group>
        </a-form-item>
        <a-form-item
          field="ref_workflow"
          :label="$t('workflow.timer.refWorkflow')"
        >
          <select-workflow
            :workflow-id="workflowTimerForm.workflow_id"
            :version-id="workflowTimerForm.version_id"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- schedule workflow timer -->
    <a-modal
      v-model:visible="scheduleJobTimerModalVisible"
      title-align="start"
      :draggable="true"
      :ok-text="$t('job.dispatch')"
      width="60%"
      @before-ok="handleScheduleWorkflowTimer"
      @cancel="handleCancel"
    >
      <template #title> {{ $t('workflow.timer.schedule') }}</template>
      <a-form
        ref="scheduleWorkflowTimerRef"
        :model="scheduleWorkflowTimerForm"
        :rules="scheduleWorkflowTimerFormValidateRules"
        :auto-label-width="true"
      >
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import {
    deleteJobTimer,
    dispatchJob,
    endpoint,
    JobAction,
    JobArg,
    JobRecord,
    JobTimerRecord,
    QueryJobReq,
    queryJobTimerList,
    saveJobTimer,
    ScheduleType,
    TimerExpr,
  } from '@/api/job';
  import { queryCountResource, TagRecord } from '@/api/tag';
  import useLoading from '@/hooks/loading';
  import { Pagination } from '@/types/global';
  import type { SelectOptionData } from '@arco-design/web-vue/es/select/interface';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import cloneDeep from 'lodash/cloneDeep';
  import Sortable from 'sortablejs';
  import { computed, nextTick, reactive, ref, toRefs, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { Message } from '@arco-design/web-vue';

  import JobArgs from '@/components/job-args/index.vue';
  import TableTagItem from '@/components/table-tag-item/index.vue';
  import TagItem from '@/components/tag-item/index.vue';
  import SelectWorkflow from '@/views/workflow/components/select-workflow.vue';
  import { genVersionFromTime } from '@/utils/time';
  import { useRouter } from 'vue-router';
  import {
    CustomTimerExpr,
    deleteWorkflowTimer,
    queryWorkflowTimerList,
    QueryWorkflowTimerListReq,
    saveWorkflowTimer,
    scheduleWorkflowTimer,
    WorkflowTimerRecord,
  } from '@/api/workflow';

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };
  const saveWorkflowTimerModalVisible = ref(false);
  const scheduleJobTimerModalVisible = ref(false);
  const saveWorkflowTimerRef = ref();
  const scheduleWorkflowTimerRef = ref();
  const router = useRouter();

  interface WorkflowTimerForm {
    id: number;
    name: string;
    timer_expr: CustomTimerExpr;
    workflow_id: number;
    version_id: number;
    info: string;
  }

  interface ScheduleWorkflowTimerForm {
    id: number;
    action: 'start_timer' | 'stop_timer';
  }

  const defaultTimerExpr: CustomTimerExpr = {
    timezone: 'local',
    expr: '* * * * *',
  };

  const generateFormModel = () => {
    return {
      name: '',
      job_type: 'default',
      updated_time_range: [],
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref<WorkflowTimerRecord[]>([]);
  const formModel = ref(generateFormModel());
  const cloneColumns = ref<Column[]>([]);
  const showColumns = ref<Column[]>([]);

  const state = reactive<{
    workflowTimerForm: WorkflowTimerForm;
    scheduleWorkflowTimerForm: ScheduleWorkflowTimerForm;
  }>({
    workflowTimerForm: {
      id: 0,
      name: '',
      timer_expr: defaultTimerExpr,
      info: '',
      workflow_id: 0,
      version_id: 0,
    },
    scheduleWorkflowTimerForm: {
      id: 0,
      action: 'start_timer',
    },
  });
  const { workflowTimerForm, scheduleWorkflowTimerForm } = toRefs(state);

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
      slotName: 'index',
    },

    {
      title: t('job.timer.name'),
      dataIndex: 'name',
    },
    {
      title: t('job'),
      dataIndex: 'job_name',
    },
    {
      title: t('job.timer.info'),
      dataIndex: 'info',
    },
    {
      title: t('tag.name'),
      dataIndex: 'tags',
      slotName: 'tags',
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

  const saveWorkflowTimerFormValidateRules = {
    name: {
      required: true,
    },

    timer_expr: {
      required: true,
      type: 'object' as any,
      validator: (value: any, cb: (error?: string) => void) => {
        if (value.expr === '') {
          cb(t('job.timerExpr.validation.error'));
        }
      },
    },
  };

  const scheduleWorkflowTimerFormValidateRules = {
    schedule_name: {
      required: true,
    },
    endpoints: {
      required: true,
    },
  };

  const tagList = ref<TagRecord[]>([]);
  const resourceType = ref('workflow');

  const initTagList = async () => {
    try {
      const { data } = await queryCountResource({
        resource_type: resourceType.value,
      });
      tagList.value = data.list;
    } catch (err) {
      // you can report use errorHandler or other
    }
  };
  initTagList();

  const tagIds = ref<number[]>([]);
  const queryTagList = (tag: number[]) => {
    tagIds.value = tag;
    fetchData();
  };

  const fetchData = async (
    params: QueryWorkflowTimerListReq = {
      page: basePagination.page,
      page_size: basePagination.pageSize,
      tag_ids: tagIds.value,
    }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryWorkflowTimerList(params);

      renderData.value = data.list;
      pagination.page = params.page;
      pagination.total = data.total;
    } catch (err) {
      // you can report use errorHandler or other
    } finally {
      setLoading(false);
    }
  };

  // 刷新
  const refreshPage = () => {
    initTagList();
    fetchData();
  };

  const changeJob = (v: JobRecord) => {
    if (v && !workflowTimerForm.value.name) {
      workflowTimerForm.value.name = v?.name || '';
    }
  };

  const handleOpenWorkflowTimerModal = (e: any, record: any) => {
    saveWorkflowTimerRef.value.clearValidate();
    if (record) {
      workflowTimerForm.value = { ...record };
    } else {
      workflowTimerForm.value = {
        id: 0,
        name: '',
        timer_expr: defaultTimerExpr,
        info: '',
        workflow_id: 0,
        version_id: 0,
      };
    }
    saveWorkflowTimerModalVisible.value = true;
  };

  const handleDeleteWorkflowTimer = async (e: any, record: any) => {
    setLoading(true);
    try {
      await deleteWorkflowTimer({
        id: record.id,
      });
    } finally {
      setLoading(false);
    }

    search();
    return true;
  };

  const handleOpenScheduleWorkflowTimerModal = (e: any, record: any) => {
    scheduleWorkflowTimerRef.value.clearValidate();
    scheduleWorkflowTimerForm.value = {
      ...record,
      ip: [],
      job_type: formModel.value.job_type,
      schedule_name: `${record.name}-${genVersionFromTime()}`,
      action: 'start_timer',
      schedule_type: 'timer',
    };
    scheduleJobTimerModalVisible.value = true;
  };

  const handleSubmitWorkflowTimer = async () => {
    const ret = await saveWorkflowTimerRef.value.validate();
    if (ret) {
      return false;
    }
    try {
      const data = { ...workflowTimerForm.value };
      await saveWorkflowTimer({
        ...data,
      });
      Message.success(t('form.submit.success'));
    } catch (err) {
      return false;
    }
    search();
    return true;
  };

  const handleScheduleWorkflowTimer = async () => {
    const ret = await scheduleWorkflowTimerRef.value.validate();
    if (ret) {
      return false;
    }

    try {
      await scheduleWorkflowTimer({
        id: 0,
        action: 'start_timer',
      });
    } catch (err) {
      return false;
    }

    Message.success(t('form.submit.success'));
    setTimeout(() => {
      router.push({
        path: '/run-status/run-list',
        query: {
          scheduleType: 'timer',
          jobType: formModel.value.job_type,
        },
      });
    }, 200);
    return true;
  };

  const handleCancel = () => {
    saveWorkflowTimerModalVisible.value = false;
  };

  const search = () => {
    fetchData({
      page: basePagination.page,
      page_size: basePagination.pageSize,
      ...formModel.value,
      tag_ids: tagIds.value,
      job_type: formModel.value.job_type,
    } as unknown as QueryJobReq);
  };
  const onPageChange = (current: number) => {
    fetchData({
      page_size: pagination.pageSize,
      page: current,
      ...formModel.value,
      tag_ids: tagIds.value,
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
