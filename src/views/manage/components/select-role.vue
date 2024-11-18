<template>
  <a-select
    v-model="roleId"
    :default-value="roleId"
    :loading="loading"
    :style="{ width: '320px' }"
    :filter-option="false"
    :fallback-option="false"
    allow-clear
    allow-search
    @search="handleSearchRole"
  >
    <a-option v-for="item of roleOptions" :key="item.id" :value="item.id">{{
      item.name
    }}</a-option>
  </a-select>
</template>

<script lang="ts" setup>
  import { queryRoleList, QueryRoleListReq, RoleRecord } from '@/api/role';
  import { ref, watch } from 'vue';

  const props = defineProps<{
    roleId: number;
  }>();

  const emit = defineEmits(['update:roleId']);

  const roleId = ref(props.roleId);
  const loading = ref(false);

  const roleOptions = ref<RoleRecord[]>([]);
  const basePagination = {
    page: 1,
    page_size: 20,
  };

  const fetchData = async (params: { default_id?: number; name?: string }) => {
    loading.value = true;

    const { data } = await queryRoleList({
      ...basePagination,
      ...params,
    } as unknown as QueryRoleListReq);
    roleOptions.value = data.list;

    loading.value = false;
  };

  const handleSearchRole = async (val: string) => {
    await fetchData({ name: val });
  };

  fetchData({ default_id: props.roleId });

  watch(
    () => roleId,
    (val) => {
      emit('update:roleId', Number(val.value));
    },
    { deep: true, immediate: true }
  );
</script>
