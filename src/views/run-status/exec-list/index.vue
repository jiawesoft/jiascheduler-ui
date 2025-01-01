<template>
  <div class="container">
    <Breadcrumb :items="['menu.runStatus', 'menu.runStatus.execList']" />

    <a-card class="general-card">
      <!-- <ExecHistory :title="$t('menu.runStatus.execList')" /> -->

      <a-tabs size="small" v-model:active-key="currentTab">
        <a-tab-pane key="once" :title="$t('job.scheduleType.once')">
          <once-exec-list v-if="currentTab == 'once'" />
        </a-tab-pane>
        <a-tab-pane key="timer" :title="$t('job.scheduleType.timer')">
          <timer-exec-list v-if="currentTab == 'timer'" />
        </a-tab-pane>
        <a-tab-pane key="daemon" :title="$t('job.scheduleType.daemon')">
          <daemon-exec-list v-if="currentTab == 'daemon'" />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  // import ExecHistory from '../components/exec-list.vue';
  import onceExecList from '../components/once-exec-list.vue';
  import timerExecList from '../components/timer-exec-list.vue';
  import daemonExecList from '../components/daemon-exec-list.vue';

  const currentTab = ref('once');
  const { t } = useI18n();
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
