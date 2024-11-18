<template>
  <a-form
    key="job-detail"
    :model="$props.value"
    disabled
    :auto-label-width="true"
  >
    <a-form-item field="name" :label="$t('job.name')">
      <a-input v-model="$props.value.name" />
    </a-form-item>
    <a-form-item field="info" :label="$t('job.info')">
      <a-input v-model="$props.value.info" />
    </a-form-item>

    <a-row :gutter="16">
      <a-col :span="8">
        <a-form-item field="work_user" disabled :label="$t('job.workUser')">
          <a-input v-model="$props.value.work_user" />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item field="work_dir" disabled :label="$t('job.workDir')">
          <a-input v-model="$props.value.work_dir" />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item
          field="timeout"
          disabled
          :tooltip="$t('job.timeout.tips')"
          :label="$t('job.timeout')"
        >
          <a-input-number v-model="$props.value.timeout" />
        </a-form-item>
      </a-col>
    </a-row>

    <template v-if="$props.value.job_type === 'bundle'">
      <a-form-item
        v-for="(val, index) in $props.value.bundle_script"
        :key="index"
        :field="`bundle_script[${index}]`"
        :label="$t('job.task') + '-' + (index + 1)"
        validate-trigger="blur"
        :tooltip="$t('jobBundleScript.condExpr.tooltips')"
      >
        <a-space direction="horizontal">
          <SelectBundleScript v-model="$props.value.bundle_script![index]" />
          <a-input
            v-model="$props.value.bundle_script![index].cond_expr"
            default-value="$v > 0"
            allow-clear
          />
        </a-space>
      </a-form-item>
    </template>

    <template v-else-if="$props.value.job_type === 'default'">
      <a-form-item field="executor_id" :label="$t('job.executor')">
        <select-executor v-model="$props.value.executor_id" />
      </a-form-item>
      <a-form-item field="code" :label="$t('job.code')">
        <v-ace-editor
          v-model:value="$props.value.code"
          :style="{ height: '300px', width: '100%' }"
          :lang="getEditorLang"
          :print-margin="false"
          :theme="theme === 'dark' ? 'chaos' : 'chrome'"
          :readonly="true"
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
            :file-list="defaultFileList()"
          />
        </a-space>
      </a-form-item>
    </template>
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
  import { computed, ref } from 'vue';
  import { useAppStore } from '@/store';
  import { VAceEditor } from 'vue3-ace-editor';
  import 'ace-builds/src-noconflict/mode-text';
  import 'ace-builds/src-noconflict/theme-chrome';
  import 'ace-builds/src-noconflict/theme-chaos';

  import SelectBundleScript from '@/views/respository/components/select-bundle-script.vue';
  import SelectExecutor from '@/views/respository/components/select-executor.vue';
  import { FileItem } from '@arco-design/web-vue';

  export interface JobProps {
    id?: number;
    name: string;
    code: string;
    eid: string;
    executor_id: number;
    args?: { [key: string]: string };
    info?: string;
    work_user: string;
    work_dir: string;
    job_type: string;
    timeout: number;
    max_retry: number;
    max_parallel: number;
    created_time: string;
    created_user: string;
    upload_file: string;
    bundle_script: {
      id: number;
      code: string;
      eid: string;
      cond_expr: string;
      name: string;
      info: string;
    }[];
  }

  const props = defineProps<{
    value: JobProps;
  }>();

  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };

  const theme = computed(() => {
    return useAppStore().theme;
  });

  const defaultFileList = (): FileItem[] => {
    const uploadFile = props.value.upload_file;
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
