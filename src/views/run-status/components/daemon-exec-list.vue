<template>
  <a-row v-if="!$props.disableSearch">
    <a-col flex="auto">
      <a-form
        key="search-daemon-exec-list"
        :model="formModel"
        :label-col-props="{ span: 6 }"
        :auto-label-width="true"
        :wrapper-col-props="{ span: 18 }"
        label-align="left"
        @submit="search"
      >
        <a-row :gutter="5">
          <a-col :span="10">
            <a-form-item field="schedule_name" :label="$t('job.scheduleName')">
              <a-input
                v-model="formModel.schedule_name"
                @press-enter="search"
                :placeholder="$t('job.scheduleName.placeholder')"
              />
            </a-form-item>
          </a-col>

          <a-col :span="10">
            <a-form-item field="start_time" :label="$t('job.startTime')">
              <a-range-picker
                v-model="formModel.start_time_range"
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
  <a-divider v-if="!$props.disableSearch" style="margin-top: 0" />
  <a-row style="margin-bottom: 16px">
    <a-col :span="20">
      <tag-item :tag-list="tagList" @query-tag-list="queryTagList"></tag-item>
    </a-col>

    <a-col
      :span="2"
      style="display: flex; align-items: center; justify-content: end"
    >
      <a-popconfirm
        :content="$t('job.action.confirm.clear.records')"
        @before-ok="handleClearExecHistory($event)"
      >
        <a-button type="primary" size="mini" plain>
          {{ $t('job.clear.records') }}
        </a-button>
      </a-popconfirm>
    </a-col>
    <a-col
      :span="2"
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
    v-if="jobType == 'bundle' && scheduleId"
    row-key="id"
    :loading="loading"
    :pagination="pagination"
    :columns="(cloneColumns as TableColumnData[])"
    :data="renderData"
    :size="size"
    :scrollbar="true"
    :scroll="scroll"
    :bordered="false"
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

    <template #validate="{ column, record }">
      <a-tag
        v-if="
          record.bundle_script_result[getBundleScriptIndex(column.dataIndex)]
            .result === true
        "
        color="green"
        ><icon-check
      /></a-tag>
      <a-tag v-else color="red"><icon-close /></a-tag>
    </template>

    <template #operations="{ record }">
      <a-button
        type="text"
        size="small"
        @click="handleViewExecDetailModal($event, record)"
      >
        {{ $t('operations.view') }}
      </a-button>
    </template>
  </a-table>

  <a-table
    v-else
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

    <template #tags="{ record }">
      <table-tag-item
        :tag-list="record.tags"
        :resource-id="record.id"
        :resource-type="resourceType"
        @refresh-page="refreshPage"
      ></table-tag-item>
    </template>

    <template #operations="{ record }">
      <a-button
        type="text"
        size="small"
        @click="handleViewExecDetailModal($event, record)"
      >
        {{ $t('operations.view') }}
      </a-button>
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
  </a-table>

  <a-modal
    v-model:visible="visible"
    title-align="start"
    style="width: auto"
    :draggable="true"
    width="60%"
    hide-cancel
    @cancel="handleCancel"
  >
    <template #title>{{ $t('job.runDetail') }}</template>
    <a-form :model="form" :auto-label-width="true">
      <a-form-item field="schedule_name" :label="$t('job.scheduleName')">
        {{ form.schedule_name }}
      </a-form-item>
      <a-form-item field="bind_ip" :label="$t('job.bindIp')">
        {{ form.bind_ip }}
      </a-form-item>
      <a-form-item field="start_time" :label="$t('job.startTime')">
        {{ form.start_time }}
      </a-form-item>
      <a-form-item field="end_time" :label="$t('job.endTime')">
        {{ form.end_time }}
      </a-form-item>
      <a-form-item field="exit_status" :label="$t('job.exitStatus')">
        {{ form.exit_status }}
      </a-form-item>
      <a-form-item field="output" :label="$t('job.output')">
        <output-area :output="form.output" v-if="visible" />
        <!-- <v-ace-editor
          v-if="visible"
          v-model:value="form.output"
          :style="{ height: '300px', width: '100%' }"
          lang="text"
          :print-margin="false"
          :theme="theme === 'dark' ? 'chaos' : 'chrome'"
        /> -->
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
  import {
    deleteExeHistory,
    ExecRecord,
    queryExecList,
    QueryExecListReq,
  } from '@/api/job';
  import { queryCountResource, TagRecord } from '@/api/tag';
  import TableTagItem from '@/components/table-tag-item/index.vue';
  import TagItem from '@/components/tag-item/index.vue';
  import OutputArea from '@/components/output-area/index.vue';
  import useLoading from '@/hooks/loading';
  import { useAppStore } from '@/store';
  import { Pagination } from '@/types/global';
  import { Message } from '@arco-design/web-vue';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';

  import cloneDeep from 'lodash/cloneDeep';
  import Sortable from 'sortablejs';
  import { computed, nextTick, reactive, ref, toRefs, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  // import { VAceEditor } from 'vue3-ace-editor';
  // import 'ace-builds/src-noconflict/mode-text';
  // import 'ace-builds/src-noconflict/theme-chaos';
  // import 'ace-builds/src-noconflict/theme-chrome';

  const props = defineProps<{
    scheduleId?: string;
    bindIp?: string;
    title?: string;
    eid?: string;
    disableSearch?: boolean;
    jobType?: string;
    bindNamespace?: string;
  }>();

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };
  const visible = ref(false);

  const scroll = ref({
    x: 2000,
    y: 200,
  });

  const theme = computed(() => {
    return useAppStore().theme;
  });

  const state = reactive({
    form: {
      bind_ip: '',
      created_time: '',
      created_user: '',
      end_time: '',
      exit_code: 0,
      bundle_script_result: [],
      exit_status: '',
      id: 0,
      output: '',
      schedule_id: '',
      schedule_name: '',
      start_time: '',
      updated_time: '',
    },
  });
  const { form } = toRefs(state);

  const generateFormModel = () => {
    return {
      schedule_name: '',
      job_type: 'default',
      schedule_type: 'daemon',
      start_time_range: [],
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref<ExecRecord[]>([]);
  const formModel = ref(generateFormModel());
  const cloneColumns = ref<Column[]>([]);
  const showColumns = ref<Column[]>([]);

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
      width: 30,
      slotName: 'index',
      fixed: 'left',
    },

    {
      title: t('job.name'),
      dataIndex: 'job_name',
      // ellipsis: true,
      width: 150,
      // tooltip: true,
      fixed: 'left',
    },
    {
      title: t('job.exitStatus'),
      dataIndex: 'exit_status',
      // ellipsis: true,
      slotName: 'exitStatus',
      width: 120,
      // tooltip: true,
      fixed: 'left',
    },
    {
      title: t('job.scheduleName'),
      dataIndex: 'schedule_name',
      // ellipsis: true,
      width: 150,
      // tooltip: true,
    },
    {
      title: t('job.bindIp'),
      dataIndex: 'bind_ip',
      width: 150,
    },
    // {
    //   title: t('job.scheduleId'),
    //   dataIndex: 'schedule_id',
    // },
    // {
    //   title: t('job.type'),
    //   dataIndex: 'job_type',
    // },

    {
      title: t('tag.name'),
      dataIndex: 'tags',
      slotName: 'tags',
      width: 180,
    },
    {
      title: t('job.startTime'),
      dataIndex: 'start_time',
      ellipsis: true,
      width: 170,
      tooltip: true,
    },
    {
      title: t('job.endTime'),
      dataIndex: 'end_time',
      ellipsis: true,
      width: 170,
      tooltip: true,
    },
    {
      title: t('team.name'),
      dataIndex: 'team_name',
      ellipsis: true,
      width: 120,
    },
    {
      title: t('columns.createdUser'),
      dataIndex: 'created_user',
      width: 120,
    },
    {
      title: t('operations'),
      dataIndex: 'operations',
      slotName: 'operations',
      width: 120,
      fixed: 'right',
    },
  ]);

  const getBundleScriptIndex = (dataIndex: string): number => {
    return Number(
      dataIndex.replace('bundle_script_result[', '').replace('].result', '')
    );
  };

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
    params: QueryExecListReq = {
      page: 1,
      page_size: 20,
      schedule_id: props.scheduleId,
      schedule_type: formModel.value.schedule_type,
      eid: props.eid,
      job_type: formModel.value.job_type,
      tag_ids: tagIds.value,
      bind_ip: props.bindIp,
      bind_namespace: props.bindNamespace,
    }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryExecList(params);
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

  const handleViewExecDetailModal = (e: any, record: any) => {
    if (record) {
      form.value = { ...record };
    }

    visible.value = true;
  };

  const handleCancel = () => {
    visible.value = false;
  };

  const search = () => {
    fetchData({
      page: basePagination.page,
      page_size: basePagination.pageSize,
      ...formModel.value,
      schedule_id: props.scheduleId,
      schedule_type: formModel.value.schedule_type,
      job_type: formModel.value.job_type,
      eid: props.eid,
      bind_ip: props.bindIp,
      tag_ids: tagIds.value,
    } as unknown as QueryExecListReq);
  };
  const onPageChange = (current: number) => {
    fetchData({
      page_size: pagination.pageSize,
      page: current,
      ...formModel.value,
      schedule_id: props.scheduleId,
      schedule_type: formModel.value.schedule_type,
      eid: props.eid,
      job_type: formModel.value.job_type,
      bind_ip: props.bindIp,
      tag_ids: tagIds.value,
    } as unknown as QueryExecListReq);
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

  const handleClearExecHistory = async (e: any) => {
    try {
      await deleteExeHistory({
        schedule_id: props.scheduleId,
        schedule_type: 'daemon',
        eid: props.eid,
        bind_ip: props.bindIp,
      });
    } catch (err) {
      return false;
    }

    Message.success(t('form.submit.success'));
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
    name: 'ExecList',
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
