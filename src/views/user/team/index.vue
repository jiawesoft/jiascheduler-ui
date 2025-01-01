<template>
  <div class="container">
    <Breadcrumb :items="['menu.user', 'menu.user.team']" />
    <a-card class="general-card team-card">
      <a-split
        v-model:size="splitSize"
        :style="{
          height: '100%',
          width: '100%',
          minWidth: '500px',
        }"
        :min="300"
      >
        <template #first>
          <a-typography-paragraph>
            <team-list></team-list>
          </a-typography-paragraph>
        </template>
        <template #second>
          <a-typography-paragraph>
            <member-list></member-list>
          </a-typography-paragraph>
        </template>
      </a-split>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import teamList from './components/team-list.vue';
  import memberList from './components/member-list.vue';

  const splitSize = ref(300);
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
  .team-card {
    height: calc(100% - 56px);
    :deep(& > .arco-card-body) {
      padding: 0;
      height: 100%;
    }
  }
</style>
