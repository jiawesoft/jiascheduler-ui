<template>
  <div class="container">
    <Breadcrumb :items="['menu.repository', 'menu.repository.jobList']" />
    <a-card class="general-card">
      <a-row>
        <a-col :flex="1">
          <a-form
            :model="formModel"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            :auto-label-width="true"
            label-align="left"
            @submit="search"
          >
            <a-row :gutter="20">
              <a-col :span="10">
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
            </a-row>
            <a-row :gutter="20">
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
        <a-divider style="height: 84px" direction="vertical" />
        <a-col :flex="'86px'" style="text-align: right">
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

        <template #operations="{ record }">
          <a-button
            type="text"
            size="small"
            @click="handleOpenJobModal($event, record)"
          >
            {{ $t('operations.view') }}
          </a-button>
          <a-button
            type="text"
            size="small"
            @click="handleOpenDispatchJobModal($event, record)"
          >
            {{ $t('operations.dispatch') }}
          </a-button>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="jobModalVisible"
      title-align="start"
      style="width: auto"
      :draggable="true"
      :ok-text="$t('form.save')"
      unmount-on-close
      width="60%"
      @before-ok="handleSubmitJob"
      @cancel="handleCancel"
    >
      <template #title> {{ $t('job.save') }}</template>

      <a-form
        ref="saveJobRef"
        :key="jobForm.id"
        :rules="jobFormValidateRules"
        :model="jobForm"
        :auto-label-width="true"
      >
        <a-form-item field="job_type" :label="$t('job.type')">
          <a-radio-group
            v-model="formModel.job_type"
            type="button"
            :disabled="jobForm.id != 0"
            @change="search"
          >
            <a-radio value="default">{{ $t('job.type.default') }}</a-radio>
            <a-radio value="bundle">{{ $t('job.type.bundle') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          field="name"
          required
          validate-trigger="blur"
          :label="$t('job.name')"
        >
          <a-input v-model="jobForm.name" />
        </a-form-item>
        <a-form-item field="info" :label="$t('job.info')">
          <a-textarea v-model="jobForm.info" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item
              field="work_user"
              validate-trigger="blur"
              :label="$t('job.workUser')"
            >
              <a-input v-model="jobForm.work_user" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item
              field="work_dir"
              validate-trigger="blur"
              :label="$t('job.workDir')"
            >
              <a-input v-model="jobForm.work_dir" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item
              field="timeout"
              :tooltip="$t('job.timeout.tips')"
              validate-trigger="blur"
              :label="$t('job.timeout')"
            >
              <a-input-number v-model="jobForm.timeout" />
            </a-form-item>
          </a-col>
        </a-row>

        <template v-if="formModel.job_type === 'bundle'">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item
                field="display_on_dashboard"
                :label="$t('job.displayOnDashboard')"
              >
                <a-switch v-model="jobForm.display_on_dashboard" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item
            v-for="(val, index) in jobForm.bundle_script"
            :key="index"
            :field="`bundle_script[${index}]`"
            :label="$t('job.task') + '-' + (index + 1)"
            validate-trigger="blur"
            :rules="bundleScriptValidateRules"
            :tooltip="$t('jobBundleScript.condExpr.tooltips')"
          >
            <a-space direction="horizontal">
              <SelectBundleScript v-model="jobForm.bundle_script![index]" />
              <a-input
                v-model="jobForm.bundle_script![index].cond_expr"
                default-value="$v > 0"
                allow-clear
              />
              <a-button
                :style="{ marginLeft: '10px' }"
                @click="handleDeleteBundleScript(index)"
                >Delete</a-button
              >
            </a-space>
          </a-form-item>

          <a-form-item>
            <a-button @click="handleAddBundleScript">
              {{ $t('form.add') }}
            </a-button>
          </a-form-item>
        </template>

        <template v-else-if="formModel.job_type === 'default'">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item field="executor_id" :label="$t('job.executor')">
                <SelectExecutor v-model="jobForm.executor_id" />
              </a-form-item>
            </a-col>

            <a-col :span="8">
              <a-form-item
                field="display_on_dashboard"
                :label="$t('job.displayOnDashboard')"
              >
                <a-switch v-model="jobForm.display_on_dashboard" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item field="code" :label="$t('job.code')">
            <v-ace-editor
              v-if="jobModalVisible"
              :key="jobForm.executor_id"
              v-model:value="jobForm.code"
              :style="{ height: '300px', width: '100%' }"
              :lang="getEditorLang"
              :print-margin="false"
              :theme="theme === 'dark' ? 'chaos' : 'chrome'"
            />
          </a-form-item>
          <a-form-item
            field="upload_file"
            :label="$t('job.upload_file')"
            :tooltip="$t('job.upload_file.tooltip')"
          >
            <a-space direction="vertical" :style="{ width: '100%' }">
              <a-upload
                action="/api/file/upload"
                :limit="1"
                :default-file-list="defaultFileList()"
                :file-list="uploadFileList"
                v-model="uploadFileList"
                @before-remove="removeUploadfile"
                @success="onUploadSuccess"
              />
            </a-space>
          </a-form-item>
        </template>
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

        <a-form-item field="eid" :disabled="true" :label="$t('job.selectJob')">
          <a-select
            v-model="dispatchJobForm.eid"
            placeholder="Please select job..."
            allow-search
            :options="jobOptions"
            @search="handleSearchJob"
          >
          </a-select>
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
</template>

<script lang="ts" setup>
  import {
    JobAction,
    JobRecord,
    QueryJobReq,
    JobBundleScriptRecord,
    ScheduleType,
    dispatchJob,
    queryJobList,
    saveJob,
    endpoint,
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
  import { VAceEditor } from 'vue3-ace-editor';
  import { useAppStore } from '@/store';
  // import 'ace-builds/src-noconflict/mode-json'; // Load the language definition file used below
  import { FileItem, Message } from '@arco-design/web-vue';
  import 'ace-builds/src-noconflict/mode-python';
  import 'ace-builds/src-noconflict/mode-sh';
  import 'ace-builds/src-noconflict/theme-chrome';
  import 'ace-builds/src-noconflict/theme-chaos';
  import { useRouter } from 'vue-router';

  import SelectBundleScript from '../components/select-bundle-script.vue';
  import SelectExecutor from '../components/select-executor.vue';
  import SelectInstance from '../components/select-instance.vue';

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };
  const jobModalVisible = ref(false);
  const dispatchJobModalVisible = ref(false);
  const saveJobRef = ref();
  const dispatchJobRef = ref();
  const router = useRouter();

  const defaultBundleScript: Partial<JobBundleScriptRecord> = {
    name: 'bundle script name',
    eid: '',
    info: '',
    cond_expr: '$v > 20',
  };

  interface JobForm {
    id: number;
    job_type: string;
    work_dir: string;
    work_user: string;
    timeout: number;
    name: string;
    code: string;
    executor_id: number;
    upload_file: '';
    display_on_dashboard: false;
    args: any;
    bundle_script?: (typeof defaultBundleScript)[];
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
      job_type: 'default',
      updated_time_range: [],
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref<JobRecord[]>([]);
  const formModel = ref(generateFormModel());
  const cloneColumns = ref<Column[]>([]);
  const showColumns = ref<Column[]>([]);
  const uploadFileList = ref<FileItem[]>([]);
  const jobOptions = ref<SelectOptionData[]>([]);

  const size = ref<SizeProps>('medium');

  const theme = computed(() => {
    return useAppStore().theme;
  });

  const state = reactive<{
    jobForm: JobForm;
    dispatchJobForm: DispatchJobForm;
  }>({
    jobForm: {
      id: 0,
      job_type: formModel.value.job_type,
      name: '',
      code: 'echo hello world',
      executor_id: 1,
      work_dir: '',
      work_user: '',
      timeout: 60,
      upload_file: '',
      display_on_dashboard: false,
      args: {},
      bundle_script: [],
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
  const { jobForm, dispatchJobForm } = toRefs(state);

  const defaultFileList = (): FileItem[] => {
    const uploadFile = jobForm.value.upload_file;
    if (uploadFile !== '') {
      return [
        {
          uid: '1',
          url: uploadFile,
          name: uploadFile,
        },
      ];
    }
    return [];
  };

  const getEditorLang = computed<string>(() => {
    const executorItem = executorOptions.value.find(
      (item) => item.id === jobForm.value.executor_id
    );
    const currentCommand = executorItem ? executorItem.command : 'bash';
    return getCommand(currentCommand);
  });

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
      title: t('job.name'),
      dataIndex: 'name',
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

  const jobFormValidateRules = {
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

  const bundleScriptValidateRules = [
    {
      validator(value: any, callback: (error?: string | undefined) => void) {
        if (!value.eid) {
          callback(t('jobBundleScript.validator.eid.required'));
          return;
        }
        if (!value.cond_expr) {
          callback(t('jobBundleScript.validator.condExpr.required'));
        }
      },
    },
  ];

  const fetchData = async (
    params: QueryJobReq = {
      page: basePagination.page,
      page_size: basePagination.pageSize,
      name: '',
      job_type: formModel.value.job_type,
    }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryJobList(params);

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

  const fetchJobOptions = async (
    params: QueryJobReq = { page: 1, page_size: 20, name: '' }
  ) => {
    try {
      const { data } = await queryJobList(params);

      jobOptions.value = data.list.map((v) => {
        return {
          label: v.name,
          value: v.eid,
        };
      });
    } catch (err) {
      // you can report use errorHandler or other
    } finally {
      // do something
    }
  };

  const handleOpenJobModal = (e: any, record: any) => {
    saveJobRef.value?.clearValidate();
    if (record) {
      jobForm.value = { ...record };
      // jobType.value = record.job_type;
    } else {
      jobForm.value = {
        id: 0,
        job_type: formModel.value.job_type,
        name: '',
        work_dir: '',
        work_user: '',
        timeout: 60,
        code: '# type your code',
        executor_id: 1,
        display_on_dashboard: false,
        upload_file: '',
        args: {},
        bundle_script: [{ ...defaultBundleScript }],
        info: '',
      };
    }
    fetchExecutorData({ default_id: jobForm.value.executor_id });
    jobModalVisible.value = true;
  };

  const removeUploadfile = async (file: FileItem) => {
    jobForm.value.upload_file = '';
    return true;
  };

  const handleSearchJob = (value: string) => {
    if (value) {
      fetchJobOptions({ page: 1, page_size: 10, name: value });
    }
  };

  const handleOpenDispatchJobModal = (e: any, record: any) => {
    dispatchJobRef.value.clearValidate();
    dispatchJobForm.value = {
      ...record,
      ip: [],
      action: 'exec',
      schedule_type: 'once',
    };
    dispatchJobModalVisible.value = true;
  };

  const handleSubmitJob = async () => {
    const ret = await saveJobRef.value.validate();
    if (ret) {
      return false;
    }
    try {
      const data = {
        ...jobForm.value,
        job_type: formModel.value.job_type,
      };
      if (formModel.value.job_type === 'default') {
        data.bundle_script = undefined;
      }

      await saveJob({
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
        namespace: 'default',
        action: dispatchJobForm.value.action as JobAction,
        is_sync: false,
        endpoints: dispatchJobForm.value.endpoints,
      });
    } catch (err) {
      return false;
    }
    Message.success(t('form.submit.success'));

    router.push('/run-status/run-list');
    return true;
  };

  const handleCancel = () => {
    jobModalVisible.value = false;
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

  const handleAddBundleScript = () => {
    (jobForm.value.bundle_script as (typeof defaultBundleScript)[]).push(
      defaultBundleScript
    );
  };

  const handleDeleteBundleScript = (index: number) => {
    (jobForm.value.bundle_script as (typeof defaultBundleScript)[]).splice(
      index,
      1
    );
  };

  const onUploadSuccess = (response: FileItem) => {
    if (response.response.code === 20000) {
      jobForm.value.upload_file = response.response.data.result;
      uploadFileList.value = [response];
      return;
    }
    uploadFileList.value = [];
    Message.error(response.response.msg);
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
