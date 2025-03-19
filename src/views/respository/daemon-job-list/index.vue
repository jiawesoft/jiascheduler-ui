<template>
  <div class="container">
    <Breadcrumb :items="['menu.repository', 'menu.repository.daemonJob']" />
    <a-card class="general-card">
      <a-row>
        <a-col flex="auto">
          <a-form
            :model="formModel"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="left"
            :auto-label-width="true"
            @submit="search"
          >
            <a-row :gutter="5">
              <a-col :span="10">
                <a-form-item field="name" :label="$t('job.daemon.name')">
                  <a-input
                    v-model="formModel.name"
                    :placeholder="$t('job.daemon.name.placeholder')"
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
              @click="handleOpenDeamonJobModal($event, null)"
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
          <a-button
            type="text"
            size="small"
            @click="handleOpenDeamonJobModal($event, record)"
          >
            {{ $t('operations.view') }}
          </a-button>
          <a-button
            type="text"
            size="small"
            @click="handleOpenDispatchJobSupervisorModal($event, record)"
          >
            {{ $t('operations.dispatch') }}
          </a-button>
        </template>
      </a-table>
    </a-card>
    <a-modal
      v-model:visible="jobSupervisorModalVisible"
      title-align="start"
      :draggable="true"
      :ok-text="$t('form.save')"
      @before-ok="handleSubmitJobSupervisor"
      @cancel="handleCancel"
    >
      <template #title> {{ $t('job.saveDaemon') }}</template>
      <a-form
        ref="saveJobSupervisorRef"
        :rules="jobSupervisorFormValidateRules"
        :model="jobSupervisorForm"
        :auto-label-width="true"
      >
        <a-form-item
          field="name"
          required
          validate-trigger="blur"
          :label="$t('job.daemon.name')"
        >
          <a-input v-model="jobSupervisorForm.name" />
        </a-form-item>
        <a-form-item field="info" :label="$t('job.daemon.info')">
          <a-textarea v-model="jobSupervisorForm.info" />
        </a-form-item>

        <a-form-item
          field="restart_interval"
          :label="$t('job.daemon.restartInterval')"
          :tooltip="$t('job.daemon.restartInterval.tips')"
        >
          <a-input-number
            v-model="jobSupervisorForm.restart_interval"
            placeholder="Please Enter"
            mode="button"
            size="large"
          />
        </a-form-item>
        <a-form-item field="eid" validate-trigger="blur" :label="$t('job')">
          <select-job
            v-if="jobSupervisorModalVisible"
            v-model:eid="jobSupervisorForm.eid"
            job-type="default"
            @change-job="changeJob"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal
      v-model:visible="dispatchJobSupervisorModalVisible"
      title-align="start"
      :draggable="true"
      :ok-text="$t('job.dispatch')"
      width="60%"
      @before-ok="handleDispatchJobSupervisor"
      @cancel="handleCancel"
    >
      <template #title> {{ $t('job.schedule') }}</template>
      <a-form
        ref="dispatchJobSupervisorRef"
        :model="dispatchJobSupervisorForm"
        :rules="dispatchJobSupervisorFormValidateRules"
        :auto-label-width="true"
      >
        <a-form-item
          field="schedule_name"
          validate-trigger="blur"
          :label="$t('job.schedule.name')"
        >
          <a-input v-model="dispatchJobSupervisorForm.schedule_name" />
        </a-form-item>

        <a-form-item field="eid" :disabled="true" :label="$t('job.daemon')">
          <SelectJobSupervisor
            v-if="dispatchJobSupervisorModalVisible"
            v-model:eid="dispatchJobSupervisorForm.eid"
            v-model:job-type="dispatchJobSupervisorForm.job_type"
          />
        </a-form-item>
        <a-form-item
          field="endpoints"
          validate-trigger="blur"
          :label="$t('job.endpoint')"
        >
          <SelectInstance
            v-if="dispatchJobSupervisorModalVisible"
            v-model="dispatchJobSupervisorForm.endpoints"
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
    JobSupervisorRecord,
    QueryJobReq,
    queryJobSupervisorList,
    QueryJobSupervisorReq,
    saveJobSupervisor,
    ScheduleType,
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

  import { useRouter } from 'vue-router';

  import TableTagItem from '@/components/table-tag-item/index.vue';
  import TagItem from '@/components/tag-item/index.vue';
  import { genVersionFromTime } from '@/utils/time';
  import SelectInstance from '../components/select-instance.vue';
  import SelectJobSupervisor from '../components/select-job-supervisor.vue';
  import SelectJob from '../components/select-job.vue';

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };
  const jobSupervisorModalVisible = ref(false);
  const dispatchJobSupervisorModalVisible = ref(false);
  const saveJobSupervisorRef = ref();
  const dispatchJobSupervisorRef = ref();
  const router = useRouter();

  interface JobSupervisorForm {
    id: number;
    name: string;
    eid: string;
    executor_id: number;
    info: string;
    restart_interval: number;
  }

  interface DispatchJobSupervisorForm {
    eid: string;
    job_type: string;
    schedule_name: string;
    namespace: string;
    restat_interval: number;
    schedule_type: string;
    action: string;
    endpoints: endpoint[];
  }

  const generateFormModel = () => {
    return {
      name: '',
      updated_time_range: [],
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref<JobSupervisorRecord[]>([]);
  const formModel = ref(generateFormModel());
  const cloneColumns = ref<Column[]>([]);
  const showColumns = ref<Column[]>([]);
  const jobOptions = ref<SelectOptionData[]>([]);

  const state = reactive<{
    jobSupervisorForm: JobSupervisorForm;
    dispatchJobSupervisorForm: DispatchJobSupervisorForm;
  }>({
    jobSupervisorForm: {
      id: 0,
      name: '',
      executor_id: 0,
      eid: '',
      restart_interval: 1,
      info: '',
    },
    dispatchJobSupervisorForm: {
      eid: '',
      schedule_name: '',
      namespace: 'default',
      job_type: 'default',
      schedule_type: 'daemon',
      action: 'exec',
      endpoints: [],
      restat_interval: 0,
    },
  });
  const { jobSupervisorForm, dispatchJobSupervisorForm } = toRefs(state);

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
      title: t('job.daemon.name'),
      dataIndex: 'name',
    },
    {
      title: t('job'),
      dataIndex: 'job_name',
    },
    {
      title: t('job.daemon.info'),
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

  const jobSupervisorFormValidateRules = {
    name: {
      required: true,
    },
    eid: {
      required: true,
    },
  };
  const dispatchJobSupervisorFormValidateRules = {
    schedule_name: {
      required: true,
    },
    endpoints: {
      required: true,
    },
  };

  const tagList = ref<TagRecord[]>([]);
  const resourceType = ref('job');

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
    params: QueryJobSupervisorReq = {
      page: basePagination.page,
      page_size: basePagination.pageSize,
      tag_ids: tagIds.value,
    }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryJobSupervisorList(params);

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

  // 刷新
  const refreshPage = () => {
    initTagList();
    fetchData();
  };

  const changeJob = (str: string) => {
    if (str && !jobSupervisorForm.value.name) {
      jobSupervisorForm.value.name = str;
    }
  };

  const handleOpenDeamonJobModal = (e: any, record: any) => {
    saveJobSupervisorRef.value.clearValidate();
    if (record) {
      jobSupervisorForm.value = { ...record };
    } else {
      jobSupervisorForm.value = {
        id: 0,
        name: '',
        eid: '',
        executor_id: 1,
        restart_interval: 1,
        info: '',
      };
    }
    jobSupervisorModalVisible.value = true;
  };

  const handleOpenDispatchJobSupervisorModal = (e: any, record: any) => {
    dispatchJobSupervisorRef.value.clearValidate();
    dispatchJobSupervisorForm.value = {
      ...record,
      ip: [],
      job_type: 'default',
      schedule_name: `${record.name}-${genVersionFromTime()}`,
      action: 'start_supervising',
      schedule_type: 'daemon',
    };
    dispatchJobSupervisorModalVisible.value = true;
  };

  const handleSubmitJobSupervisor = async () => {
    const ret = await saveJobSupervisorRef.value.validate();
    if (ret) {
      return false;
    }
    try {
      const data = { ...jobSupervisorForm.value };
      await saveJobSupervisor({
        ...data,
      });
      Message.success(t('form.submit.success'));
    } catch (err) {
      return false;
    }

    search();
    return true;
  };

  const handleDispatchJobSupervisor = async () => {
    const ret = await dispatchJobSupervisorRef.value.validate();
    if (ret) {
      return false;
    }
    try {
      await dispatchJob({
        schedule_type: dispatchJobSupervisorForm.value
          .schedule_type as ScheduleType,
        eid: dispatchJobSupervisorForm.value.eid,
        schedule_name: dispatchJobSupervisorForm.value.schedule_name,
        action: dispatchJobSupervisorForm.value.action as JobAction,
        is_sync: false,
        endpoints: dispatchJobSupervisorForm.value.endpoints,
      });
    } catch (err) {
      return false;
    }

    Message.success(t('form.submit.success'));

    setTimeout(() => {
      router.push({
        path: '/run-status/run-list',
        query: {
          scheduleType: 'daemon',
        },
      });
    }, 200);

    return true;
  };

  const handleCancel = () => {
    jobSupervisorModalVisible.value = false;
  };

  const search = () => {
    fetchData({
      page: basePagination.page,
      page_size: basePagination.pageSize,
      ...formModel.value,
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
