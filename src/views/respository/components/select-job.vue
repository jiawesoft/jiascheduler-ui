<template>
  <a-select
    v-model="eid"
    :loading="loading"
    :style="{ width: '320px' }"
    :filter-option="false"
    :fallback-option="false"
    allow-clear
    allow-search
    @search="handleSearchJob"
  >
    <a-option v-for="item of jobOptions" :key="item.eid" :value="item.eid">{{
      item.name
    }}</a-option>
  </a-select>
</template>

<script lang="ts" setup>
  import { JobRecord, queryJobList, QueryJobReq } from '@/api/job';
  import { Pagination } from '@/types/global';
  import { ref, watch } from 'vue';

  const props = defineProps<{
    eid: string;
    jobType: string;
  }>();

  const emit = defineEmits(['update:eid']);

  const eid = ref(props.eid);
  const loading = ref(false);

  const jobOptions = ref<JobRecord[]>([]);
  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };

  const fetchData = async (params: {
    name?: string;
    default_eid?: string;
    job_type: string;
  }) => {
    loading.value = true;

    const { data } = await queryJobList({
      ...basePagination,
      ...params,
    } as unknown as QueryJobReq);
    jobOptions.value = data.list;

    loading.value = false;
  };

  const handleSearchJob = async (val: string) => {
    await fetchData({ name: val, job_type: props.jobType });
  };

  fetchData({ default_eid: props.eid, job_type: props.jobType });

  watch(
    () => eid,
    (val) => {
      emit('update:eid', val.value);
    },
    { deep: true, immediate: false }
  );

  watch(
    () => props.jobType,
    (val) => {
      fetchData({ default_eid: props.eid, job_type: val });
    },
    { deep: true, immediate: true }
  );
</script>
