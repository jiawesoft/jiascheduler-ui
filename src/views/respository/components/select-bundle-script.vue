<template>
  <a-select
    v-model="eid"
    :loading="loading"
    :style="{ width: '320px' }"
    :filter-option="false"
    :fallback-option="false"
    allow-clear
    allow-search
    @search="handleSearchBundleScript"
  >
    <a-option
      v-for="item of bundleScriptOptions"
      :key="item.eid"
      :value="item.eid"
      >{{ item.name }}</a-option
    >
  </a-select>
</template>

<script lang="ts" setup>
  import {
    JobBundleScriptRecord,
    queryJobBundleScriptList,
    JobBundleScriptReq,
  } from '@/api/job';
  import { Pagination } from '@/types/global';
  import { ref, watch } from 'vue';

  const props = defineProps<{
    modelValue: Partial<JobBundleScriptRecord>;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const eid = ref(props.modelValue.eid);
  const loading = ref(false);
  const ready = ref(false);

  const bundleScriptOptions = ref<JobBundleScriptRecord[]>([]);
  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };

  const fetchData = async (params: { name?: string; default_eid?: string }) => {
    loading.value = true;
    const { data } = await queryJobBundleScriptList({
      page: basePagination.page,
      page_size: basePagination.pageSize,
      ...params,
    } as unknown as JobBundleScriptReq);
    bundleScriptOptions.value = data.list;
    loading.value = false;
    ready.value = true;
  };

  const handleSearchBundleScript = async (val: string) => {
    await fetchData({ name: val });
  };

  fetchData({ default_eid: eid.value! });

  watch(
    () => eid,
    (val) => {
      bundleScriptOptions.value.forEach((v) => {
        if (v.eid === val.value) {
          emit('update:modelValue', v);
        }
      });
    },
    { deep: true, immediate: true }
  );

  watch(
    () => ready,
    (val) => {
      console.log(val);
      bundleScriptOptions.value.forEach((v) => {
        if (v.eid === eid.value) {
          emit('update:modelValue', { ...props.modelValue, ...v });
        }
      });
    },
    { deep: true, immediate: true }
  );
</script>
