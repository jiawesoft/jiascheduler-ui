<template>
  <div class="container">
    <Breadcrumb :items="['menu.user', 'menu.user.team']" />
    <div class="team-wrapper">
      <a-card class="general-card team-card">
        <team-list></team-list>
      </a-card>
      <a-card class="general-card team-list-user-card">
        <member-list></member-list>
      </a-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import teamList from './components/team-list.vue';
  import memberList from './components/member-list.vue';
</script>

<script lang="ts">
  export default {
    name: 'ExecutorList',
  };
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 10px 20px;
    height: 100%;
  }
  .team-wrapper {
    display: flex;
    height: calc(100% - 56px);
  }
  .team-card {
    min-width: 300px;
    :deep(& > .arco-card-body) {
      padding: 0;
      height: 100%;
      overflow-y: auto;
    }
  }
  .team-list-user-card {
    flex: 1;
    margin-left: 10px;
  }
</style>
