<template>
  <a-row>
    <a-col flex="auto">
      <a-form
        :model="formModel"
        :label-col-props="{ span: 6 }"
        :auto-label-width="true"
        :wrapper-col-props="{ span: 18 }"
        label-align="left"
        @submit="search"
      >
        <a-row :gutter="5">
          <a-col :span="10">
            <a-form-item field="name" :label="$t('job.name')">
              <a-input
                v-model="formModel.name"
                :placeholder="$t('job.name.placeholder')"
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
    <a-col :span="22">
      <tag-item :tag-list="tagList" @query-tag-list="queryTagList"></tag-item>
    </a-col>
    <a-col
      :span="2"
      style="display: flex; align-items: center; justify-content: right"
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

    <template #jobName="{ record }">
      {{ record.snapshot_data?.name }}
    </template>

    <template #operations="{ record }">
      <a-space>
        <a-dropdown-button
          :hide-on-select="false"
          @click="handleViewScheduleDetailModal($event, record)"
        >
          {{ $t('operations.view') }}
          <template #icon>
            <icon-down />
          </template>
          <template #content>
            <a-doption>
              <a-popconfirm
                :content="$t('job.action.confirm.startSupervising')"
                @before-ok="handleAction($event, record, 'start_supervising')"
              >
                <a-button type="dashed" size="mini" status="success">
                  {{ $t('operations.startSupervising') }}
                </a-button>
              </a-popconfirm>
            </a-doption>
            <a-doption>
              <a-popconfirm
                :content="$t('job.action.confirm.stopSupervising')"
                @before-ok="handleAction($event, record, 'stop_supervising')"
              >
                <a-button type="dashed" size="mini" status="warning">
                  {{ $t('operations.stopSupervising') }}
                </a-button>
              </a-popconfirm>
            </a-doption>
          </template>
        </a-dropdown-button>
      </a-space>
    </template>
  </a-table>

  <a-modal
    v-model:visible="scheduleDetailVisible"
    title-align="start"
    :draggable="true"
    width="70%"
    hide-cancel
    @cancel="handleCancel"
  >
    <template #title>
      <a-space direction="vertical" size="large">
        <a-radio-group v-model="viewType" type="button">
          <a-radio value="execHistory">{{ $t('job.runHistory') }}</a-radio>
          <a-radio value="scheduleDetail">{{
            $t('job.schedule.detail')
          }}</a-radio>
        </a-radio-group>
      </a-space>
    </template>
    <ExecHistory
      v-if="viewType == 'execHistory' && scheduleDetailVisible"
      :eid="form.eid"
      :schedule-id="form.schedule_id"
      :disable-search="true"
    />
    <ScheduleDetail
      v-if="viewType == 'scheduleDetail' && scheduleDetailVisible"
      :value="form"
    />
  </a-modal>
</template>

<script lang="ts" setup>
  import {
    JobRecord,
    QueryJobReq,
    QueryScheduleListReq,
    ScheduleType,
    queryScheduleList,
    redispatchJob,
  } from '@/api/job';
  import { queryCountResource, TagRecord } from '@/api/tag';
  import useLoading from '@/hooks/loading';
  import { Pagination } from '@/types/global';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import cloneDeep from 'lodash/cloneDeep';
  import Sortable from 'sortablejs';
  import TagItem from '@/components/tag-item/index.vue';
  import TableTagItem from '@/components/table-tag-item/index.vue';
  import { computed, nextTick, reactive, ref, toRefs, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import ExecHistory from '@/views/run-status/components/daemon-exec-list.vue';
  import ScheduleDetail from '@/views/run-status/schedule-list/components/schedule-detail.vue';

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };
  const scheduleDetailVisible = ref(false);
  const viewType = ref('execHistory');

  const state = reactive({
    form: {
      id: 0,
      schedule_id: 'string',
      name: 'string',
      eid: 'string',
      dispatch_result: [],
      schedule_type: 'string',
      action: 'string',
      code: '',
      job_name: '',
      dispatch_data: 'string',
      snapshot_data: 'string',
      created_user: 'string',
      updated_user: 'string',
      created_time: 'string',
      updated_time: 'string',
      executor_id: 1,
    },
  });
  const { form } = toRefs(state);

  const generateFormModel = (): {
    name: string;
    job_type: string;
    schedule_type: ScheduleType;
    updated_time_range: any[];
  } => {
    return {
      name: '',
      job_type: 'default',
      schedule_type: 'daemon',
      updated_time_range: [],
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref<JobRecord[]>([]);
  const formModel = ref(generateFormModel());
  const cloneColumns = ref<Column[]>([]);
  const showColumns = ref<Column[]>([]);
  // const jobActionPopupVisible = ref(true);

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
      title: t('job.scheduleId'),
      dataIndex: 'schedule_id',
    },
    {
      title: t('job.scheduleName'),
      dataIndex: 'name',
    },
    {
      title: t('job.type'),
      dataIndex: 'job_type',
    },
    {
      title: t('tag.name'),
      dataIndex: 'tags',
      slotName: 'tags',
      width: 150,
    },
    {
      title: t('job.name'),
      dataIndex: 'snapshot_data',
      slotName: 'jobName',
    },
    {
      title: t('job.action'),
      dataIndex: 'action',
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

  const tagList = ref<TagRecord[]>([]);
  const resourceType = ref('job');
  const tagIds = ref<number[]>([]);

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

  const fetchData = async (
    params: QueryScheduleListReq = {
      page: 1,
      page_size: 20,
      job_type: formModel.value.job_type,
      tag_ids: tagIds.value,
      schedule_type: formModel.value.schedule_type as ScheduleType,
    }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryScheduleList(params);
      renderData.value = data.list;
      pagination.page = params.page;
      pagination.total = data.total;
    } catch (err) {
      // you can report use errorHandler or other
    } finally {
      setLoading(false);
    }
  };

  const queryTagList = (tag: number[]) => {
    tagIds.value = tag;
    fetchData();
  };

  // 刷新
  const refreshPage = () => {
    initTagList();
    fetchData();
  };

  const handleViewScheduleDetailModal = (e: any, record: any) => {
    if (record) {
      const job = record.snapshot_data;
      form.value = {
        ...record,
        dispatch_result: (record.dispatch_result as any[]).map((v, i) => {
          v.id = i;
          return v;
        }),
        code: job?.code,
        job_name: job?.name,
        executor_id: job?.executor_id,
      };
    }

    scheduleDetailVisible.value = true;
  };

  const handleCancel = () => {
    scheduleDetailVisible.value = false;
  };

  const search = () => {
    fetchData({
      page: basePagination.page,
      page_zie: basePagination.pageSize,
      ...formModel.value,
      scheduleType: formModel.value.schedule_type,
      job_type: formModel.value.job_type,
      tag_ids: tagIds.value,
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

  const handleAction = async (e: any, record: any, action: string) => {
    await redispatchJob({
      schedule_id: record.schedule_id,
      action,
    });

    search();
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
    name: 'ScheduleList',
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
