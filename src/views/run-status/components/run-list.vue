<template>
  <a-tabs size="small" v-model:active-key="currentTab" @change="changeTab">
    <a-tab-pane key="once" :title="$t('job.scheduleType.once')">
      <once-run-list v-if="currentTab == 'once'" :jobType="jobType" />
    </a-tab-pane>
    <a-tab-pane key="timer" :title="$t('job.scheduleType.timer')">
      <timer-run-list v-if="currentTab == 'timer'" :jobType="jobType" />
    </a-tab-pane>
    <a-tab-pane key="daemon" :title="$t('job.scheduleType.daemon')">
      <daemon-run-list v-if="currentTab == 'daemon'" />
    </a-tab-pane>
  </a-tabs>
</template>

<script lang="ts" setup>
  import { useI18n } from 'vue-i18n';
  import { defineProps, ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import OnceRunList from './once-run-list.vue';
  import TimerRunList from './timer-run-list.vue';
  import DaemonRunList from './daemon-run-list.vue';

  const router = useRouter();
  const route = useRoute();
  const { t } = useI18n();

  const props = defineProps<{
    scheduleType?: 'flow' | 'timer' | 'once' | 'daemon';
    jobType?: string;
  }>();

  const currentTab = ref(props.scheduleType);

  const changeTab = (tab: string | number) => {
    router.replace({
      path: route.path,
      query: {
        scheduleType: tab,
      },
    });
  };
</script>
