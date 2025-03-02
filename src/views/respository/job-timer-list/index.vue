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
              <a-col :span="5">
                <a-form-item field="job_type" :label="$t('job.type')">
                  <a-radio-group
                    v-model="formModel.job_type"
                    type="button"
                    @change="search"
                  >
                    <a-radio value="default">{{
                      $t('job.type.default')
                    }}</a-radio>
                    <a-radio value="bundle">{{
                      $t('job.type.bundle')
                    }}</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
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
        <a-col :span="12">
          <a-space direction="horizontal" size="large">
            <a-button
              type="primary"
              size="small"
              @click="handleOpenJobTimerModal($event, null)"
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

        <template #operations="{ record }">
          <a-button
            type="text"
            size="small"
            @click="handleOpenJobTimerModal($event, record)"
          >
            {{ $t('operations.view') }}
          </a-button>
          <a-button
            type="text"
            size="small"
            @click="handleOpenDispatchJobTimerModal($event, record)"
          >
            {{ $t('operations.dispatch') }}
          </a-button>
        </template>
      </a-table>
    </a-card>
    <a-modal
      v-model:visible="jobTimerModalVisible"
      title-align="start"
      style="width: auto"
      :draggable="true"
      :ok-text="$t('form.save')"
      width="50%"
      @before-ok="handleSubmitJobTimer"
      @cancel="handleCancel"
    >
      <template #title> {{ $t('job.saveTimer') }}</template>
      <a-space direction="vertical" size="large" :style="{ width: '500px' }">
        <a-form
          ref="saveJobTimerRef"
          :rules="jobTimerFormValidateRules"
          :model="jobTimerForm"
          :auto-label-width="true"
        >
          <a-form-item field="job_type" required :label="$t('job.type')">
            <a-radio-group v-model="formModel.job_type" type="button">
              <a-radio value="default">{{ $t('job.type.default') }}</a-radio>
              <a-radio value="bundle">{{ $t('job.type.bundle') }}</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item
            field="name"
            required
            validate-trigger="blur"
            :label="$t('job.timer.name')"
          >
            <a-input v-model="jobTimerForm.name" />
          </a-form-item>
          <a-form-item field="info" :label="$t('job.timer.info')">
            <a-textarea v-model="jobTimerForm.info" />
          </a-form-item>

          <a-form-item
            field="timer_expr"
            required
            :tooltip="$t('job.timerExpr.tooltips')"
            :label="$t('job.timerExpr')"
          >
            <a-input-group>
              <a-input
                v-model="jobTimerForm.timer_expr.second"
                :style="{ width: '90px' }"
                placeholder="second"
              />
              <a-input
                v-model="jobTimerForm.timer_expr.minute"
                :style="{ width: '90px' }"
                placeholder="minute"
              />
              <a-input
                v-model="jobTimerForm.timer_expr.hour"
                :style="{ width: '90px' }"
                placeholder="hour"
              />
              <a-input
                v-model="jobTimerForm.timer_expr.day_of_month"
                :style="{ width: '120px' }"
                placeholder="day of month"
              />
              <a-input
                v-model="jobTimerForm.timer_expr.month"
                :style="{ width: '90px' }"
                placeholder="month"
              />
              <a-input
                v-model="jobTimerForm.timer_expr.year"
                :style="{ width: '90px' }"
                placeholder="year"
              />
            </a-input-group>
          </a-form-item>

          <a-form-item field="eid" validate-trigger="blur" :label="$t('job')">
            <SelectJob
              v-if="jobTimerModalVisible"
              v-model:eid="jobTimerForm.eid"
              v-model:job-type="formModel.job_type"
              @change-job="changeJob"
            />
          </a-form-item>
        </a-form>
      </a-space>
    </a-modal>
    <a-modal
      v-model:visible="dispatchJobTimerModalVisible"
      title-align="start"
      :draggable="true"
      :ok-text="$t('job.dispatch')"
      width="60%"
      @before-ok="handleDispatchJobTimer"
      @cancel="handleCancel"
    >
      <template #title> {{ $t('job.schedule') }}</template>
      <a-form
        ref="dispatchJobTimerRef"
        :model="dispatchJobTimerForm"
        :rules="dispatchJobTimerFormValidateRules"
        :auto-label-width="true"
      >
        <a-form-item
          field="schedule_name"
          validate-trigger="blur"
          :label="$t('job.schedule.name')"
        >
          <a-input v-model="dispatchJobTimerForm.schedule_name" />
        </a-form-item>

        <a-form-item field="eid" :disabled="true" :label="$t('job.timer')">
          <SelectJobTimer
            v-if="dispatchJobTimerModalVisible"
            v-model:eid="dispatchJobTimerForm.eid"
            v-model:job-type="dispatchJobTimerForm.job_type"
          />
        </a-form-item>
        <a-form-item
          field="endpoints"
          validate-trigger="blur"
          :label="$t('job.endpoint')"
        >
          <SelectInstance
            v-if="dispatchJobTimerModalVisible"
            v-model="dispatchJobTimerForm.endpoints"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import {
    dispatchJob,
    endpoint,
    JobAction,
    JobTimerRecord,
    QueryJobReq,
    queryJobTimerList,
    saveJobTimer,
    ScheduleType,
    TimerExpr,
  } from '@/api/job';
  import useLoading from '@/hooks/loading';
  import { Pagination } from '@/types/global';
  import type { SelectOptionData } from '@arco-design/web-vue/es/select/interface';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import cloneDeep from 'lodash/cloneDeep';
  import Sortable from 'sortablejs';
  import { computed, nextTick, reactive, ref, toRefs, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { Message } from '@arco-design/web-vue';

  import { useRouter } from 'vue-router';
  import { genVersionFromTime } from '@/utils/time';
  import SelectInstance from '../components/select-instance.vue';
  import SelectJobTimer from '../components/select-job-timer.vue';
  import SelectJob from '../components/select-job.vue';

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };
  const jobTimerModalVisible = ref(false);
  const dispatchJobTimerModalVisible = ref(false);
  const saveJobTimerRef = ref();
  const dispatchJobTimerRef = ref();
  const router = useRouter();

  interface JobTimerForm {
    id: number;
    job_type: string;
    name: string;
    timer_expr: TimerExpr;
    eid: string;
    executor_id: number;
    info: string;
  }

  interface DispatchJobTimerForm {
    eid: string;
    job_type: string;
    schedule_name: string;
    namespace: string;
    timer_expr: TimerExpr;
    schedule_type: string;
    action: string;
    is_sync: boolean;
    endpoints: endpoint[];
  }

  const defaultTimerExpr: TimerExpr = {
    second: '',
    minute: '',
    hour: '',
    day_of_month: '',
    month: '',
    year: '',
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
  const renderData = ref<JobTimerRecord[]>([]);
  const formModel = ref(generateFormModel());
  const cloneColumns = ref<Column[]>([]);
  const showColumns = ref<Column[]>([]);
  const jobOptions = ref<SelectOptionData[]>([]);

  const state = reactive<{
    jobTimerForm: JobTimerForm;
    dispatchJobTimerForm: DispatchJobTimerForm;
  }>({
    jobTimerForm: {
      id: 0,
      job_type: formModel.value.job_type,
      name: '',
      executor_id: 0,
      timer_expr: defaultTimerExpr,
      eid: '',
      info: '',
    },
    dispatchJobTimerForm: {
      eid: '',
      schedule_name: '',
      namespace: 'default',
      job_type: formModel.value.job_type,
      timer_expr: defaultTimerExpr,
      schedule_type: 'once',
      action: 'exec',
      is_sync: false,
      endpoints: [],
    },
  });
  const { jobTimerForm, dispatchJobTimerForm } = toRefs(state);

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
      title: t('job.eid'),
      dataIndex: 'eid',
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
      title: t('job.type'),
      dataIndex: 'job_type',
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

  const jobTimerFormValidateRules = {
    name: {
      required: true,
    },
    eid: {
      required: true,
    },
    timer_expr: {
      required: true,
      type: 'object' as any,
      validator: (value: any, cb: (error?: string) => void) => {
        if (
          !value.second ||
          !value.minute ||
          !value.hour ||
          !value.day_of_month ||
          !value.month ||
          !value.year
        ) {
          cb(t('job.timerExpr.validation.error'));
        }
      },
    },
  };
  const dispatchJobTimerFormValidateRules = {
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
      job_type: formModel.value.job_type,
    }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryJobTimerList(params);

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

  const changeJob = (str: string) => {
    if (str && !jobTimerForm.value.name) {
      jobTimerForm.value.name = str;
    }
  };

  const handleOpenJobTimerModal = (e: any, record: any) => {
    saveJobTimerRef.value.clearValidate();
    if (record) {
      jobTimerForm.value = { ...record };
    } else {
      jobTimerForm.value = {
        id: 0,
        job_type: formModel.value.job_type,
        name: '',
        eid: '',
        timer_expr: defaultTimerExpr,
        executor_id: 1,
        info: '',
      };
    }
    jobTimerModalVisible.value = true;
  };

  const handleOpenDispatchJobTimerModal = (e: any, record: any) => {
    dispatchJobTimerRef.value.clearValidate();
    dispatchJobTimerForm.value = {
      ...record,
      ip: [],
      job_type: formModel.value.job_type,
      schedule_name: `${record.name}-${genVersionFromTime()}`,
      action: 'start_timer',
      schedule_type: 'timer',
    };
    dispatchJobTimerModalVisible.value = true;
  };

  const handleSubmitJobTimer = async () => {
    const ret = await saveJobTimerRef.value.validate();
    if (ret) {
      return false;
    }
    try {
      const data = { ...jobTimerForm.value };
      await saveJobTimer({
        ...data,
      });
      Message.success(t('form.submit.success'));
    } catch (err) {
      return false;
    }

    search();
    return true;
  };

  const handleDispatchJobTimer = async () => {
    const ret = await dispatchJobTimerRef.value.validate();
    if (ret) {
      return false;
    }
    try {
      await dispatchJob({
        schedule_type: dispatchJobTimerForm.value.schedule_type as ScheduleType,
        eid: dispatchJobTimerForm.value.eid,
        schedule_name: dispatchJobTimerForm.value.schedule_name,
        timer_expr: dispatchJobTimerForm.value.timer_expr,
        action: dispatchJobTimerForm.value.action as JobAction,
        is_sync: false,
        endpoints: dispatchJobTimerForm.value.endpoints,
      });
    } catch (err) {
      return false;
    }

    Message.success(t('form.submit.success'));

    router.push('/run-status/run-list');
    return true;
  };

  const handleCancel = () => {
    jobTimerModalVisible.value = false;
  };

  const search = () => {
    fetchData({
      page: basePagination.page,
      page_size: basePagination.pageSize,
      ...formModel.value,
      job_type: formModel.value.job_type,
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
