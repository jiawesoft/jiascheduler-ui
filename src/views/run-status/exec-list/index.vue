<template>
  <div class="container">
    <Breadcrumb :items="['menu.runStatus', 'menu.runStatus.execList']" />

    <a-card class="general-card">
      <ExecHistory :title="$t('menu.runStatus.execList')" />
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import ExecHistory from '../components/exec-list.vue';
</script>

<script lang="ts">
  export default {
    name: 'ExecList',
  };
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
