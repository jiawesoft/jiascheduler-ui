<template>
  <div class="container">
    <Breadcrumb :items="['menu.manage', 'menu.manage.instanceList']" />
    <a-row class="wrapper">
      <a-col :span="24">
        <a-tabs default-active-key="user" type="line">
          <a-tab-pane key="user" title="实例">
            <instance-list />
          </a-tab-pane>
          <a-tab-pane key="role" title="分组">
            <instance-group-list />
          </a-tab-pane>
        </a-tabs>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import InstanceList from './components/instance-list.vue';
  import InstanceGroupList from './components/group-list.vue';
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 20px 20px;
  }
  .wrapper {
    padding: 20px 0 0 20px;
    min-height: 580px;
    background-color: var(--color-bg-2);
    border-radius: 4px;
  }
</style>
