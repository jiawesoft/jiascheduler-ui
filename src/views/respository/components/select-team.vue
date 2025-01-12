<template>
  <a-select
    v-model="teamId"
    :loading="loading"
    :style="{ width: '320px' }"
    :filter-option="false"
    :fallback-option="false"
    allow-clear
    allow-search
    @search="handleSearchTeam"
  >
    <a-option v-for="item of teamOptions" :key="item.id" :value="item.id">{{
      item.name
    }}</a-option>
  </a-select>
</template>

<script lang="ts" setup>
  import { queryTeamList, QueryTeamListReq, TeamRecord } from '@/api/team';
  import { Pagination } from '@/types/global';
  import { ref, watch } from 'vue';

  const props = defineProps<{
    teamId: number;
  }>();

  const emit = defineEmits(['update:teamId']);

  const teamId = ref(props.teamId);
  const loading = ref(false);

  const teamOptions = ref<TeamRecord[]>([]);
  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };

  const fetchData = async (params: { name?: string; default_id?: number }) => {
    loading.value = true;

    const { data } = await queryTeamList({
      ...basePagination,
      ...params,
    } as unknown as QueryTeamListReq);
    teamOptions.value = data.list;

    loading.value = false;
  };

  const handleSearchTeam = async (val: string) => {
    await fetchData({ name: val });
  };

  fetchData({ default_id: props.teamId });

  watch(
    () => teamId,
    (val) => {
      emit('update:teamId', val.value);
    },
    { deep: true, immediate: false }
  );
</script>
