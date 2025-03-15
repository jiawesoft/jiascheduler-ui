<template>
  <div class="container">
    <Breadcrumb :items="['menu.runStatus', 'menu.runStatus.runList']" />
    <a-card class="general-card">
      <RunList :schedule-type="scheduleType" :job-type="jobType" />
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import RunList from '../components/run-list.vue';

  const route = useRoute();
  const scheduleType = ref<any>('once');
  const jobType = ref('');

  const scheduleTypeList = ['flow', 'timer', 'once', 'daemon'];
  const jobTypeList = ['default', 'bundle'];
  if (route.query) {
    const currentScheduleType = route.query?.scheduleType || 'once';
    const currentJobType = route.query?.jobType || 'default';
    if (typeof currentScheduleType === 'string') {
      scheduleType.value = scheduleTypeList.includes(currentScheduleType)
        ? currentScheduleType
        : 'once';
    }
    if (typeof currentJobType === 'string') {
      jobType.value = jobTypeList.includes(currentJobType)
        ? currentJobType
        : 'default';
    }
  }
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 20px 20px;
  }
  :deep(.arco-table-th) {
    &:last-child {
      .arco-table-th-item-title {
        margin-left: 16px;
      }
    }
  }
  .action-icon {
    margin-left: 12px;
    cursor: pointer;
  }
  .active {
    color: #0960bd;
    background-color: #e3f4fc;
  }
  .setting {
    display: flex;
    align-items: center;
    width: 200px;
    .title {
      margin-left: 12px;
      cursor: pointer;
    }
  }
</style>
