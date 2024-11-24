<template>
  <a-form :model="$props.value" :disabled="true" :auto-label-width="true">
    <a-form-item field="name" :label="$t('job.name')">
      {{ $props.value.name }}
    </a-form-item>
    <a-form-item field="action" :label="$t('job.action')">
      {{ $props.value.action }}
    </a-form-item>
    <a-form-item field="job_name" :label="$t('job')">
      {{ $props.value.job_name }}
    </a-form-item>
    <!-- <a-form-item
          field="executor_id"
          :label="$t('job.executor')"
        >
          <a-select v-model="form.executor_id">
            <a-option :value="1">bash</a-option>
            <a-option :value="2">python</a-option>
          </a-select>
        </a-form-item> -->
    <a-form-item
      field="dispatch_result"
      :label="$t('job.schedule.dispatchResult')"
    >
      <a-table
        row-key="id"
        :columns="dispatchResultColumns"
        :data="$props.value.dispatch_result"
        :pagination="false"
      >
        <template #index="{ rowIndex }">
          {{ rowIndex + 1 }}
        </template>
        <template #response="{ record }">
          <a-tag v-if="record.response?.code === 20000" color="green">
            {{ record.response.msg }}
          </a-tag>
          <a-tag v-else color="red"> {{ record.err }}</a-tag>
        </template>
      </a-table>
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
  import 'ace-builds/src-noconflict/theme-chaos';
  import { TableColumnData } from '@arco-design/web-vue';
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';

  const theme = computed(() => {
    return useAppStore().theme;
  });

  export interface ScheduleDetailProps {
    id?: number;
    schedule_id: string;
    name: string;
    eid: string;
    dispatch_result: { [key: string]: string }[];
    schedule_type: string;
    action: string;
    code: string;
    job_name: string;
    dispatch_data: string;
    snapshot_data: string;
    created_user: string;
    updated_user: string;
    created_time: string;
    updated_time: string;
    executor_id: number;
  }

  const { t } = useI18n();

  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };

  const props = defineProps<{ value: ScheduleDetailProps }>();

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
</script>
