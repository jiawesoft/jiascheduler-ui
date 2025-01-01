<template>
  <a-row>
    <a-col flex="auto">
      <a-form
        key="search-run-status"
        :model="formModel"
        :auto-label-width="true"
        :label-col-props="{ span: 6 }"
        :wrapper-col-props="{ span: 18 }"
        label-align="right"
        @submit="search"
      >
        <a-row :gutter="20">
          <a-col :span="6">
            <a-form-item field="job_type" :label="$t('job.type')">
              <a-radio-group
                v-model="formModel.job_type"
                type="button"
                @change="search"
              >
                <a-radio value="default">{{ $t('job.type.default') }}</a-radio>
                <a-radio value="bundle">{{ $t('job.type.bundle') }}</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="schedule_name" :label="$t('job.schedule.name')">
              <a-input
                v-model="formModel.schedule_name"
                @press-enter="search"
                :placeholder="$t('job.schedule.name.placeholder')"
              />
            </a-form-item>
          </a-col>

          <a-col :span="8">
            <a-form-item field="bind_ip" :label="$t('instance.ip')">
              <a-input @press-enter="search" v-model="formModel.bind_ip" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-col>

    <a-col :flex="'200px'" style="text-align: right">
      <a-space direction="horizontal" :wrap="true" :size="18">
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
          style="display: none"
          @click="handleOpenJobModal($event, null)"
        >
          <template #icon> <IconPlayArrowFill /> </template>hidden
          {{ $t('operations.quickStart') }}
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
      {{ executors[record.executor_id as string] }}
    </template>

    <template #jobName="{ record }">
      {{ record.schedule_snapshot_data?.name }}
    </template>

    <template #timerExpr="{ record }">
      <a-tag color="green">{{ record.dispatch_data.params.timer_expr }}</a-tag>
    </template>

    <template #runStatus="{ record }">
      <a-tag v-if="record.run_status === 'stop'" color="blue">
        {{ record.run_status }}
      </a-tag>
      <a-tag v-else-if="record.run_status === 'prepare'" color="orangered">
        {{ record.run_status }}
      </a-tag>
      <a-tag v-else color="green">{{ record.run_status }}</a-tag>
    </template>

    <template #scheduleStatus="{ record }">
      <a-tag v-if="record.schedule_status === 'unscheduled'" color="blue">
        {{ record.schedule_status }}
      </a-tag>
      <a-tag v-else-if="record.run_status === 'prepare'" color="orangered">
        {{ record.schedule_status }}
      </a-tag>
      <a-tag v-else color="green">{{ record.schedule_status }}</a-tag>
    </template>

    <template #exitStatus="{ record }">
      <a-tooltip :content="record.exit_status">
        <a-tag v-if="record.exit_status === 'exit status: 0'" color="green">
          <icon-check />
        </a-tag>
        <a-tag v-else-if="record.exit_status === ''" color="orange"> -- </a-tag>
        <a-tag
          v-else
          color="red"
          style="display: block; text-overflow: ellipsis"
        >
          {{ record.exit_status }}
        </a-tag>
      </a-tooltip>
    </template>

    <template #operations="{ record }">
      <a-space direction="horizontal">
        <a-space>
          <a-button
            type="dashed"
            size="mini"
            @click="handleOpenRunDetailModal($event, record)"
          >
            {{ $t('operations.view') }}
          </a-button>
        </a-space>

        <a-space>
          <a-popconfirm
            :content="$t('job.action.confirm.startTimer')"
            @before-ok="handleAction($event, record, 'start_timer')"
          >
            <a-button type="dashed" size="mini" status="success">
              {{ $t('operations.startTimer') }}
            </a-button>
          </a-popconfirm>
        </a-space>
        <a-space>
          <a-popconfirm
            :content="$t('job.action.confirm.stopTimer')"
            @before-ok="handleAction($event, record, 'stop_timer')"
          >
            <a-button type="dashed" size="mini" status="danger">
              {{ $t('operations.stopTimer') }}
            </a-button>
          </a-popconfirm>
        </a-space>
      </a-space>
    </template>
  </a-table>

  <a-modal
    v-model:visible="runModalVisible"
    title-align="start"
    style="width: auto"
    :draggable="true"
    :ok-text="$t('job.start')"
    width="50%"
    @cancel="handleCancel"
  >
    <template #title> {{ $t('job.quickStart') }}</template>
    devlopment...
  </a-modal>

  <a-modal
    v-model:visible="runDetailModalVisible"
    title-align="start"
    :draggable="true"
    :hide-cancel="true"
    width="80%"
  >
    <template #title>
      <a-space direction="vertical" size="large">
        <a-radio-group v-model="viewType" type="button">
          <a-radio value="execHistory">{{ $t('job.runHistory') }}</a-radio>
          <a-radio value="jobDetail">{{ $t('job.detail') }}</a-radio>
        </a-radio-group>
      </a-space>
    </template>
    <JobDetail v-if="viewType == 'jobDetail'" :value="scheduleJobRecord" />
    <ExecHistory
      v-if="viewType == 'execHistory' && runDetailModalVisible"
      :schedule-type="scheduleJobRecord.schedule_type"
      :job-type="scheduleJobRecord.job_type"
      :hide-job-type-switch="true"
      :hide-schedule-type-switch="true"
      :eid="scheduleJobRecord.eid"
      :bind-ip="scheduleJobRecord.bind_ip"
      :bind-namespace="scheduleJobRecord.bind_namespace"
    />
  </a-modal>
</template>

<script lang="ts" setup>
  import {
    JobAction,
    QueryJobReq,
    QueryRunListReq,
    RunRecord,
    jobAction,
    queryRunList,
  } from '@/api/job';
  import useLoading from '@/hooks/loading';
  import { Pagination } from '@/types/global';
  import { computed, nextTick, reactive, ref, toRefs, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { Message } from '@arco-design/web-vue';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import cloneDeep from 'lodash/cloneDeep';
  import Sortable from 'sortablejs';
  import ExecHistory from './exec-list.vue';
  import JobDetail from './job-detail.vue';

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };
  const runModalVisible = ref(false);
  const viewType = ref('execHistory');
  const runDetailModalVisible = ref(false);

  const state = reactive({
    jobForm: {
      id: 0,
      name: '',
      code: 'echo hello world',
      executor_id: 1,
      args: {},
      info: '',
    },
    dispatchJobForm: {
      eid: '',
      schedule_name: '',
      namespace: 'default',
      schedule_type: 'timer',
      action: 'exec',
      is_sync: false,
      ip: '192.168.1.36',
    },
    scheduleJobRecord: {
      id: 0,
      job_type: '',
      schedule_id: '',
      bind_ip: '',
      bundle_script: [],
      dispatch_data: {},
      schedule_type: 'timer',
      name: '',
      code: '',
      eid: '',
      executor_id: 0,
      args: {},
      info: '',
      upload_file: '',
      created_user: '',
      created_time: '',
      max_parallel: 1,
      max_retry: 0,
      work_dir: '',
      work_user: '',
      timeout: 0,
      bind_namespace: 'default',
    },
  });
  const { jobForm, scheduleJobRecord } = toRefs(state);

  const generateFormModel = () => {
    return {
      schedule_name: '',
      job_type: 'default',
      schedule_type: 'timer',
      bind_ip: '',
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref<RunRecord[]>([]);
  const formModel = ref(generateFormModel());
  const cloneColumns = ref<Column[]>([]);
  const showColumns = ref<Column[]>([]);

  const size = ref<SizeProps>('medium');

  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };

  const executors: { [key: string]: string } = {
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
      fixed: 'left',
      width: 30,
    },
    {
      title: t('instance.namespace'),
      dataIndex: 'bind_namespace',
      fixed: 'left',
      width: 130,
    },
    {
      title: t('job.bindIp'),
      dataIndex: 'bind_ip',
      fixed: 'left',
      width: 130,
    },
    {
      title: t('job.scheduleName'),
      dataIndex: 'schedule_name',
      ellipsis: true,
      tooltip: true,
      fixed: 'left',
      width: 120,
    },
    {
      title: t('job.name'),
      dataIndex: 'job_name',
      slotName: 'jobName',
      tooltip: true,
      ellipsis: true,
      width: 120,
    },
    {
      title: t('executor'),
      dataIndex: 'executor_name',
      width: 120,
    },
    {
      title: t('job.timerExpr'),
      slotName: 'timerExpr',
      width: 120,
    },

    {
      title: t('job.type'),
      dataIndex: 'job_type',
      width: 120,
    },
    {
      title: t('job.scheduleStatus'),
      dataIndex: 'schedule_status',
      slotName: 'scheduleStatus',
      width: 120,
    },
    {
      title: t('job.runStatus'),
      dataIndex: 'run_status',
      slotName: 'runStatus',
      width: 120,
    },
    {
      title: t('job.lastExitStatus'),
      dataIndex: 'exit_status',
      ellipsis: true,
      slotName: 'exitStatus',
      width: 120,
    },
    {
      title: t('job.scheduleId'),
      dataIndex: 'schedule_id',
      ellipsis: true,
      tooltip: true,
      width: 120,
    },
    {
      title: t('job.startTime'),
      dataIndex: 'start_time',
      width: 170,
    },
    {
      title: t('job.endTime'),
      dataIndex: 'end_time',
      width: 170,
    },
    {
      title: t('columns.updatedUser'),
      dataIndex: 'updated_user',
      ellipsis: true,
      width: 120,
    },
    {
      title: t('job.prevTime'),
      dataIndex: 'prev_time',
      width: 170,
    },
    {
      title: t('job.nextTime'),
      dataIndex: 'next_time',
      width: 170,
    },
    {
      title: t('operations'),
      dataIndex: 'operations',
      slotName: 'operations',
      width: 250,
      fixed: 'right',
    },
  ]);

  const fetchData = async (
    params: QueryRunListReq = {
      page: 1,
      page_size: 20,
      bind_ip: '',
      job_type: formModel.value.job_type,
      schedule_type: 'timer',
    }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryRunList(params);
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
      ...basePagination,
      ...formModel.value,
      job_type: formModel.value.job_type,
      schedule_type: 'timer',
    } as unknown as QueryJobReq);
  };

  const handleOpenJobModal = (e: any, record: any) => {
    if (record) {
      console.log('record:', record);
      // jobForm.value = { ...record, args: JSON.parse(record.args) };
    } else {
      jobForm.value = {
        id: 0,
        name: '',
        code: '# type your code',
        executor_id: 1,
        args: {},
        info: '',
      };
    }
    runModalVisible.value = true;
  };

  const handleOpenRunDetailModal = (e: any, record: any) => {
    if (record) {
      scheduleJobRecord.value = record.schedule_snapshot_data || {};
      scheduleJobRecord.value.schedule_id = record.schedule_id;
      scheduleJobRecord.value.bind_ip = record.bind_ip;
      scheduleJobRecord.value.schedule_type = record.schedule_type;
      scheduleJobRecord.value.dispatch_data = record.dispatch_data || {};
      scheduleJobRecord.value.eid = record.eid;
      scheduleJobRecord.value.bind_namespace = record.bind_namespace;
    }
    runDetailModalVisible.value = true;
  };

  const handleCancel = () => {
    runModalVisible.value = false;
  };

  const handleAction = async (e: any, record: any, action: JobAction) => {
    await jobAction({
      action,
      instance_id: record.instance_id,
      schedule_id: record.schedule_id,
    });
    Message.success(t('form.submit.success'));
    search();
    return true;
  };

  fetchData();

  const onPageChange = (current: number) => {
    fetchData({
      page_size: pagination.pageSize,
      page: current,
      ...formModel.value,
    });
  };

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
