<template>
  <a-select
    v-model="instanceGroupId"
    :default-value="instanceGroupId"
    :loading="loading"
    :style="{ width: '320px' }"
    :filter-option="false"
    :fallback-option="false"
    allow-clear
    allow-search
    @search="handleSearchRole"
  >
    <a-option
      v-for="item of instanceGroupOptions"
      :key="item.id"
      :value="item.id"
      >{{ item.name }}</a-option
    >
  </a-select>
</template>

<script lang="ts" setup>
  import {
    InstanceGroupRecord,
    queryInstanceGroupList,
    QueryInstanceGroupListReq,
  } from '@/api/instance';
  import { queryRoleList, QueryRoleListReq, RoleRecord } from '@/api/role';

  import { Pagination } from '@/types/global';
  import { ref, watch } from 'vue';

  const props = defineProps<{
    instanceGroupId: number;
  }>();

  const emit = defineEmits(['update:instanceGroupId']);

  const instanceGroupId = ref(props.instanceGroupId);
  const loading = ref(false);

  const instanceGroupOptions = ref<InstanceGroupRecord[]>([]);
  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };

  const fetchData = async (params: { id?: number; name?: string }) => {
    loading.value = true;

    const { data } = await queryInstanceGroupList({
      ...basePagination,
      ...params,
    } as unknown as QueryInstanceGroupListReq);
    instanceGroupOptions.value = data.list;

    loading.value = false;
  };

  const handleSearchRole = async (val: string) => {
    await fetchData({ name: val });
  };

  fetchData({ id: props.instanceGroupId });

  watch(
    () => instanceGroupId,
    (val) => {
      emit('update:instanceGroupId', val.value);
    },
    { deep: true, immediate: true }
  );
</script>
