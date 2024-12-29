<template>
  <a-tabs size="small" v-model:active-key="currentTab">
    <a-tab-pane key="once" :title="$t('job.scheduleType.once')">
      <once-run-list v-if="currentTab == 'once'" />
    </a-tab-pane>
    <a-tab-pane key="timer" :title="$t('job.scheduleType.timer')">
      <timer-run-list v-if="currentTab == 'timer'" />
    </a-tab-pane>
    <a-tab-pane key="daemon" :title="$t('job.scheduleType.daemon')">
      <daemon-run-list v-if="currentTab == 'daemon'" />
    </a-tab-pane>
  </a-tabs>
</template>

<script lang="ts" setup>
  import { useI18n } from 'vue-i18n';
  import { defineProps, ref } from 'vue';
  import OnceRunList from './once-run-list.vue';
  import TimerRunList from './timer-run-list.vue';
  import DaemonRunList from './daemon-run-list.vue';

  const currentTab = ref('once');
  const { t } = useI18n();

  const props = defineProps<{
    scheduleType?: 'flow' | 'timer' | 'once' | 'daemon';
  }>();
</script>
