<template>
  <div class="container">
    <Breadcrumb :items="['menu.runStatus', 'menu.runStatus.scheduleList']" />
    <a-card class="general-card">
      <a-tabs size="small" v-model:active-key="currentTab">
        <a-tab-pane key="once" :title="$t('job.scheduleType.once')">
          <once-schedule-list v-if="currentTab == 'once'" />
        </a-tab-pane>
        <a-tab-pane key="timer" :title="$t('job.scheduleType.timer')">
          <timer-schedule-list v-if="currentTab == 'timer'" />
        </a-tab-pane>
        <a-tab-pane key="daemon" :title="$t('job.scheduleType.daemon')">
          <daemon-schedule-list v-if="currentTab == 'daemon'" />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import onceScheduleList from './components/once-schedule-list.vue';
  import timerScheduleList from './components/timer-schedule-list.vue';
  import daemonScheduleList from './components/daemon-schedule-list.vue';

  const currentTab = ref('once');
  const { t } = useI18n();
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 20px 20px;
  }
</style>
