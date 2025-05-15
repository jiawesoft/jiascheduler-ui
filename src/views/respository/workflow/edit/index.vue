<template>
  <div class="container">
    <Breadcrumb :items="['menu.repository', 'menu.repository.jobList']" />
    <a-card class="general-card">
      <div id="workflow-container"></div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  alert('haha');
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 20px 20px;
  }
</style>
