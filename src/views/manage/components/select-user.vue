<template>
  <a-select
    v-model="userId"
    :default-value="userId"
    :loading="loading"
    :style="{ width: '320px' }"
    :filter-option="false"
    :fallback-option="false"
    allow-clear
    allow-search
    :multiple="$props.multiple"
    @search="handleSearchUser"
  >
    <a-option
      v-for="item of userOptions"
      :key="item.user_id"
      :value="item.user_id"
      >{{ item.nickname }}</a-option
    >
  </a-select>
</template>

<script lang="ts" setup>
  import { queryUserList, QueryUserListReq, UserInfo } from '@/api/user';
  import { Pagination } from '@/types/global';
  import { ref, watch } from 'vue';

  const props = defineProps<{
    userId: string | string[];
    multiple: boolean;
  }>();

  const emit = defineEmits(['update:userId']);

  const userId = ref(props.userId);
  const loading = ref(false);

  const userOptions = ref<UserInfo[]>([]);
  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };

  const fetchData = async (params: { keyword?: string; user_id?: string }) => {
    loading.value = true;

    const { data } = await queryUserList({
      ...basePagination,
      ...params,
    } as unknown as QueryUserListReq);
    userOptions.value = data.list;

    loading.value = false;
  };

  const handleSearchUser = async (val: string) => {
    await fetchData({ keyword: val });
  };

  fetchData({});

  watch(
    () => userId,
    (val) => {
      emit('update:userId', val.value);
    },
    { deep: true, immediate: true }
  );
</script>
