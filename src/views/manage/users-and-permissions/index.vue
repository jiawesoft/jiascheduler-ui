<template>
  <div class="container">
    <Breadcrumb :items="['menu.manage', 'menu.manage.usersAndPermissions']" />
    <a-row class="wrapper">
      <a-col :span="24">
        <a-tabs default-active-key="user" type="line">
          <a-tab-pane key="user" title="用户">
            <UserList />
          </a-tab-pane>
          <a-tab-pane key="role" title="角色">
            <RoleList />
          </a-tab-pane>
        </a-tabs>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import UserList from './components/user-list.vue';
  import RoleList from './components/role-list.vue';
</script>

<script lang="ts">
  export default {
    name: 'UserList',
  };
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

  :deep(.section-title) {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 14px;
  }
</style>
