<template>
  <div v-if="tasks.length" class="transfer-list">
    <div v-for="task in tasks" :key="task.id" class="transfer-list__item">
      <div class="transfer-list__head">
        <a-space :size="6">
          <icon-upload v-if="task.direction === 'upload'" />
          <icon-download v-else />
          <span class="transfer-list__name">{{ task.name }}</span>
          <a-tag size="small" :color="statusColor(task.status)">
            {{ statusText(task.status, task.direction) }}
          </a-tag>
        </a-space>
        <a-space :size="8">
          <span class="transfer-list__meta">
            {{
              task.total
                ? `${bytesToSize(task.loaded)} / ${bytesToSize(task.total)}`
                : bytesToSize(task.loaded)
            }}
          </span>
          <a-button
            v-if="task.status === 'running' || task.status === 'pending'"
            type="text"
            size="mini"
            @click="emit('cancel', task.id)"
          >
            {{ $t('terminal.transfer.cancel') }}
          </a-button>
          <a-button
            v-else
            type="text"
            size="mini"
            @click="emit('dismiss', task.id)"
          >
            <template #icon><icon-close /></template>
          </a-button>
        </a-space>
      </div>
      <a-progress
        :percent="toFraction(task.percent)"
        :status="progressStatus(task.status)"
        :show-text="true"
        size="small"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { PropType } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { TransferTask } from '@/components/transfer-types';

  defineProps({
    tasks: {
      type: Array as PropType<TransferTask[]>,
      default: () => [],
    },
  });

  const emit = defineEmits(['cancel', 'dismiss']);

  const { t } = useI18n();

  /**
   * Arco's `percent` is a fraction: the component renders `percent * 100` both as
   * the width and as the text, so passing 4 would show 400%.
   */
  const toFraction = (percent: number) =>
    Math.min(1, Math.max(0, (percent || 0) / 100));

  const progressStatus = (status: TransferTask['status']) => {
    if (status === 'success') return 'success';
    if (status === 'failed') return 'danger';
    if (status === 'cancelled') return 'warning';
    return 'normal';
  };

  const statusColor = (status: TransferTask['status']) => {
    if (status === 'success') return 'green';
    if (status === 'failed') return 'red';
    if (status === 'cancelled') return 'orange';
    if (status === 'pending') return 'gray';
    return 'arcoblue';
  };

  const statusText = (
    status: TransferTask['status'],
    direction: TransferTask['direction']
  ) => {
    if (status === 'success') {
      return direction === 'upload'
        ? t('terminal.transfer.uploadSuccess')
        : t('terminal.transfer.downloadSuccess');
    }
    if (status === 'cancelled') return t('terminal.transfer.cancelled');
    if (status === 'failed') return t('terminal.transfer.failed');
    if (status === 'pending') return t('terminal.transfer.pending');
    return direction === 'upload'
      ? t('terminal.transfer.uploading')
      : t('terminal.transfer.downloading');
  };

  const bytesToSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (!bytes) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  };
</script>

<style lang="less" scoped>
  .transfer-list {
    margin-bottom: 8px;

    &__item {
      margin-bottom: 6px;
      padding: 8px 12px;
      border: 1px solid var(--color-neutral-3);
      border-radius: var(--border-radius-small);
      background-color: var(--color-fill-1);
    }

    &__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    &__name {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
    }

    &__meta {
      color: var(--color-text-3);
      font-size: 12px;
      font-variant-numeric: tabular-nums;
    }
  }
</style>
