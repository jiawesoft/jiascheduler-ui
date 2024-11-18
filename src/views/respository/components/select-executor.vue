<template>
  <a-select
    v-model="id"
    :loading="loading"
    :filter-option="false"
    :fallback-option="false"
    allow-search
    @search="handleSearchExecutor"
  >
    <a-option v-for="item of executorOptions" :key="item.id" :value="item.id">{{
      item.name
    }}</a-option>
  </a-select>
</template>

<script lang="ts" setup>
  import {
    ExecutorRecord,
    queryExecutorList,
    QueryExecutorReq,
  } from '@/api/executor';
  import { Pagination } from '@/types/global';
  import { ref, watch } from 'vue';

  const props = defineProps<{
    modelValue: number;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const id = ref(props.modelValue);
  const loading = ref(false);

  const executorOptions = ref<ExecutorRecord[]>([]);
  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };

  const fetchData = async (params: { name?: string; default_id?: number }) => {
    loading.value = true;

    const { data } = await queryExecutorList({
      ...basePagination,
      ...params,
    } as unknown as QueryExecutorReq);
    executorOptions.value = data.list;

    loading.value = false;
  };

  const handleSearchExecutor = async (val: string) => {
    await fetchData({ name: val });
  };

  fetchData({ default_id: props.modelValue });

  watch(
    () => id,
    (val) => {
      emit('update:modelValue', val.value);
    },
    { deep: true, immediate: false }
  );
</script>
