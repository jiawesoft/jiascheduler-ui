<template>
  <div class="container">
    <Breadcrumb :items="['menu.runStatus', 'menu.runStatus.runList']" />
    <a-card class="general-card">
      <RunList schedule-type="once" />
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import RunList from '../components/run-list.vue';
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
