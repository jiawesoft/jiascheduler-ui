<template>
  <a-form :model="$props.value" :auto-label-width="true">
    <a-form-item field="name" :label="$t('form.name')">
      {{ $props.value.name }}
    </a-form-item>
    <a-form-item field="action" :label="$t('job.action')">
      {{ $props.value.action }}
    </a-form-item>
    <a-form-item field="job_name" :label="$t('job')">
      <a-space>
        <select-job
          :key="isUpdateJob"
          v-model:eid="$props.value.eid"
          v-model:job-type="$props.value.job_type"
          :disabled="!isUpdateJob"
          @change-job="changeJob"
        />

        <a-button @click="isUpdateJob = 1">{{ $t('form.update') }}</a-button>
      </a-space>
    </a-form-item>

    <a-form-item field="args" :label="$t('job.arg')">
      <job-args :args="jobArgs" />
    </a-form-item>

    <a-form-item field="code" :label="$t('job.code')">
      <v-ace-editor
        v-model:value="$props.value.code"
        :style="{ height: '300px', width: '100%' }"
        :lang="getEditorLang"
        :print-margin="false"
        :readonly="true"
        :theme="theme === 'dark' ? 'chaos' : 'chrome'"
      />
    </a-form-item>
  </a-form>
</template>

<script lang="ts" setup>
  import {
    ExecutorRecord,
    queryExecutorList,
    QueryExecutorReq,
  } from '@/api/executor';
  import { Pagination } from '@/types/global';
  import { getCommand } from '@/utils';
  import { useAppStore } from '@/store';
  import { VAceEditor } from 'vue3-ace-editor';
  // import 'ace-builds/src-noconflict/mode-json'; // Load the language definition file used below
  import 'ace-builds/src-noconflict/theme-chrome';
  import 'ace-builds/src-noconflict/mode-python';
  import 'ace-builds/src-noconflict/mode-sh';
  import 'ace-builds/src-noconflict/mode-powershell';
  import 'ace-builds/src-noconflict/theme-chaos';
  import { TableColumnData } from '@arco-design/web-vue';

  import JobArgs from '@/components/job-args/index.vue';
  import SelectJob from '@/views/respository/components/select-job.vue';

  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { JobArg, JobRecord } from '@/api/job';

  const theme = computed(() => {
    return useAppStore().theme;
  });

  export interface ScheduleDetailProps {
    id?: number;
    schedule_id: string;
    name: string;
    eid: string;
    job_type: string;
    schedule_type: string;
    action: string;
    code: string;
    job_name: string;
    snapshot_data: any;
    actual_args: { [key: string]: any };
    created_user: string;
    updated_user: string;
    created_time: string;
    updated_time: string;
    executor_id: number;
  }

  const { t } = useI18n();
  const isUpdateJob = ref(0);

  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };

  const scheduleForm = ref({
    id: 0,
    code: '',
    eid: '',
    job_args: [],
  });

  const props = defineProps<{ value: ScheduleDetailProps }>();
  const jobArgs = computed(() => {
    if (
      Array.isArray(props.value.snapshot_data.args) &&
      props.value.snapshot_data.args.length > 0
    ) {
      return (props.value.snapshot_data.args as JobArg[]).map((v) => {
        v.val = props.value.actual_args[v.name];
        return v;
      });
    }
    return [];
  });

  const dispatchResultColumns = computed<TableColumnData[]>(() => [
    {
      title: t('columns.index'),
      dataIndex: 'index',
      slotName: 'index',
    },
    {
      title: t('job.bindIp'),
      dataIndex: 'bind_ip',
    },
    {
      title: t('instance.status'),
      dataIndex: 'response',
      slotName: 'response',
    },
  ]);

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

  fetchExecutorData({ default_id: props.value.executor_id });

  const getEditorLang = computed<string>(() => {
    const executorItem = executorOptions.value.find(
      (item) => item.id === props.value.executor_id
    );
    const currentCommand = executorItem ? executorItem.command : 'bash';
    return getCommand(currentCommand);
  });

  const changeJob = (currentJob: JobRecord) => {};
</script>
