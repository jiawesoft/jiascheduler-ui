<template>
  <a-layout-footer class="footer">
    Copyright © {{ 2023 }}-{{ new Date().getFullYear() }}
    <a-typography-text code> Jiascheduler {{ version }} </a-typography-text>
    Powered by Iwannay
  </a-layout-footer>
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/store';
  import { ref } from 'vue';

  const appStore = useAppStore();
  const version = ref(appStore.$state.appVersion);
</script>

<style lang="less" scoped>
  .footer {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    color: var(--color-text-2);
    text-align: center;
  }
</style>
