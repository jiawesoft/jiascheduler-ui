<template>
  <a-form :model="scheduleForm" :auto-label-width="true" ref="formRef">
    <a-form-item field="name" :label="$t('form.name')">
      <a-input v-model="scheduleForm.name" />
    </a-form-item>

    <a-form-item field="job_name" :label="$t('job')">
      <a-space>
        <select-job
          :key="isUpdateJob"
          v-model:eid="scheduleForm.eid"
          v-model:job-type="$props.modelValue.job_type"
          :disabled="!isUpdateJob"
          @change-job="changeJob"
        />

        <a-button @click="isUpdateJob = 1">{{ $t('form.update') }}</a-button>
      </a-space>
    </a-form-item>

    <a-form-item
      :key="scheduleForm.eid"
      v-if="scheduleForm.jobArgs.length > 0"
      field="args"
      :label="$t('job.arg')"
    >
      <job-args :args="scheduleForm.jobArgs" />
    </a-form-item>

    <a-form-item field="instances" :label="$t('job.endpoint')" required>
      <SelectInstance v-model="scheduleForm.instances" />
    </a-form-item>

    <a-form-item field="code" :label="$t('job.code')">
      <v-ace-editor
        v-model:value="scheduleForm.code"
        :style="{ height: '300px', width: '100%' }"
        :lang="getEditorLang"
        :print-margin="false"
        :readonly="true"
        :theme="theme === 'dark' ? 'chaos' : 'chrome'"
      />
    </a-form-item>
    <a-form-item>
      <a-button @click="submit" type="primary">
        {{ $t('form.submit') }}
      </a-button>
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

  import JobArgs from '@/components/job-args/index.vue';
  import SelectJob from '@/views/respository/components/select-job.vue';
  import SelectInstance from '@/views/respository/components/select-instance.vue';

  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { JobArg, JobRecord, saveSchedule } from '@/api/job';
  import { Message } from '@arco-design/web-vue';

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
    instance_ids: string[];
    actual_args: { [key: string]: any };
    created_user: string;
    updated_user: string;
    created_time: string;
    updated_time: string;
    executor_id: number;
  }

  const { t } = useI18n();
  const isUpdateJob = ref(0);
  const formRef = ref();

  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };

  const props = defineProps<{ modelValue: ScheduleDetailProps }>();

  const emit = defineEmits(['update:modelValue', 'submitForm']);

  const scheduleForm = ref({
    id: props.modelValue.id,
    name: props.modelValue.name,
    code: props.modelValue.code,
    eid: props.modelValue.eid,
    snapshot_data: {},
    jobArgs: (() => {
      if (
        Array.isArray(props.modelValue.snapshot_data.args) &&
        props.modelValue.snapshot_data.args.length > 0
      ) {
        return (props.modelValue.snapshot_data.args as JobArg[]).map((v) => {
          v.val = props.modelValue.actual_args[v.name];
          return v;
        });
      }
      return [];
    })(),
    instances: props.modelValue.instance_ids.map((v) => {
      return {
        instance_id: v,
      };
    }),
  });

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

  fetchExecutorData({ default_id: props.modelValue.executor_id });

  const getEditorLang = computed<string>(() => {
    const executorItem = executorOptions.value.find(
      (item) => item.id === props.modelValue.executor_id
    );
    const currentCommand = executorItem ? executorItem.command : 'bash';
    return getCommand(currentCommand);
  });

  const changeJob = (currentJob: JobRecord) => {
    scheduleForm.value.eid = currentJob.eid;
    scheduleForm.value.snapshot_data = currentJob;
    scheduleForm.value.jobArgs = currentJob.args || [];
    scheduleForm.value.code = currentJob.code;
  };

  const submit = async () => {
    if (!formRef.value.validate()) {
      return;
    }
    try {
      await saveSchedule({
        id: scheduleForm.value.id!,
        name: scheduleForm.value.name,
        endpoints: scheduleForm.value.instances as any,
        eid: scheduleForm.value.eid,
        args: Object.fromEntries(
          new Map(scheduleForm.value.jobArgs.map((v) => [v.name, v.val]))
        ),
      });
    } catch (err) {
      return;
    }

    emit('submitForm');
    Message.success(t('form.submit.success'));
  };

  defineExpose({
    submit,
  });

  watch(
    () => scheduleForm.value,
    (val) => {
      emit('update:modelValue', {
        ...props.modelValue,
        ...val,
        actual_args: new Map(
          scheduleForm.value.jobArgs.map((v) => [v.name, v.val])
        ) as { [key: string]: any },
        instance_ids: scheduleForm.value.instances.map((v) => v.instance_id),
      });
    },
    { deep: true, immediate: true }
  );
</script>
