<template>
  <a-input-group>
    <a-select
      v-model="workflowId"
      :loading="loading"
      :style="{ width: '200px' }"
      :filter-option="false"
      :fallback-option="false"
      allow-clear
      allow-search
      :placeholder="$t('workflow.timer.refWorkflow.workflowPlaceholder')"
      @search="handleSearchWorkflow"
      @change="changeWorkflow"
    >
      <a-option
        v-for="item of workflowOptions"
        :key="item.id"
        :value="item.id"
        >{{ item.name }}</a-option
      >
    </a-select>
    <a-select
      v-model="versionId"
      :loading="loading"
      :style="{ width: '200px' }"
      :filter-option="false"
      :fallback-option="false"
      allow-clear
      allow-search
      :placeholder="$t('workflow.timer.refWorkflow.versionPlaceholder')"
      @search="handleSearchWorkflowVersion"
      @change="changeWorkflowVersion"
    >
      <a-option
        v-for="item of workflowVersionOptions"
        :key="item.id"
        :value="item.id"
        >{{ item.version }}</a-option
      >
    </a-select>
  </a-input-group>
</template>

<script lang="ts" setup>
  import {
    queryWorkflowList,
    QueryWorkflowListReq,
    queryWorkflowVersionList,
    QueryWorkflowVersionListReq,
    WorkflowRecord,
    WorkflowVersionRecord,
  } from '@/api/workflow';

  import { ref, watch } from 'vue';

  const props = defineProps<{
    workflowId?: number;
    versionId?: number;
  }>();

  const emit = defineEmits([
    'update:workflowId',
    'update:versionId',
    'changeWorkflow',
    'changeWorkflowVersion',
  ]);

  const workflowId = ref(props.workflowId);
  const versionId = ref(props.versionId);
  const loading = ref(false);

  const workflowOptions = ref<WorkflowRecord[]>([]);
  const workflowVersionOptions = ref<WorkflowVersionRecord[]>([]);

  const fetchWorkflow = async (params: QueryWorkflowListReq) => {
    loading.value = true;
    const { data } = await queryWorkflowList(params);
    workflowOptions.value = data.list;

    loading.value = false;
  };

  const fetchWorkflowVersion = async (params: QueryWorkflowVersionListReq) => {
    loading.value = true;
    const { data } = await queryWorkflowVersionList(params);
    workflowVersionOptions.value = data.list;

    loading.value = false;
  };

  const handleSearchWorkflow = async (val: string) => {
    await fetchWorkflow({ name: val, page: 1, page_size: 1000 });
  };
  const handleSearchWorkflowVersion = async (version: string) => {
    await fetchWorkflowVersion({
      workflow_id: workflowId.value || 0,
      version,
      page: 1,
      page_size: 1000,
    });
  };

  const changeWorkflow = (val: any) => {
    const current = workflowOptions.value.find((item) => item.id === val);
    emit('changeWorkflow', current);
  };

  const changeWorkflowVersion = (val: any) => {
    const current = workflowVersionOptions.value.find(
      (item) => item.id === val
    );

    emit('changeWorkflowVersion', current);
  };

  fetchWorkflow({ id: workflowId.value || 0, page: 1, page_size: 1000 });
  fetchWorkflowVersion({
    id: versionId.value || 0,
    workflow_id: workflowId.value,
    page: 1,
    page_size: 1000,
  });

  watch(
    () => workflowId.value,
    (val) => {
      emit('update:workflowId', val || 0);
      fetchWorkflowVersion({
        workflow_id: val || 0,
        page: 1,
        page_size: 100,
      });
    },
    { deep: true, immediate: false }
  );

  watch(
    () => workflowVersionOptions.value,
    () => {
      changeWorkflowVersion(versionId.value || 0);
    },
    { deep: true, immediate: false }
  );

  watch(
    () => versionId.value,
    (val) => {
      emit('update:versionId', val || 0);
    },
    { deep: true, immediate: false }
  );
</script>
