<template>
  <a-spin style="width: 100%">
    <a-card
      class="customer-card"
      :header-style="{ paddingBottom: '0' }"
      :body-style="{ padding: '10px' }"
    >
      <a-card-meta>
        <template #title>
          <div class="header-title">
            <div class="header-avatar">
              <a-avatar
                :size="32"
                :style="{
                  marginRight: '8px',
                  backgroundColor: stringColor(title),
                }"
              >
                <span>{{ title[0] }}</span>
              </a-avatar>
            </div>
            <div class="header-info">
              <div class="card-header text-overflow">{{ title }}</div>
              <div class="card-desc text-overflow">{{ description }}</div>
            </div>
          </div>
        </template>
      </a-card-meta>
      <a-space class="module-item-wrapper">
        <template #split>
          <a-divider direction="vertical" />
        </template>
        <a-statistic
          :title="$t('workplace.successText')"
          :value="successNum"
          :value-style="{ color: '#0fbf60' }"
          animation
        >
        </a-statistic>
        <a-statistic
          :title="$t('workplace.failedText')"
          :value="failNum"
          :value-style="{ color: '#bf0f0f' }"
          animation
        >
        </a-statistic>
      </a-space>
      <div class="last-time">{{ $t('workplace.lastStarTime') }}{{ time }}</div>
    </a-card>
  </a-spin>
</template>

<script lang="ts" setup>
  import { stringColor } from '@/utils';

  defineProps({
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    successNum: {
      type: Number,
      default: 0,
    },
    failNum: {
      type: Number,
      default: 0,
    },
    time: {
      type: String,
      default: '',
    },
  });
</script>

<style scoped lang="less">
  .customer-card {
    height: 148px;
    border: 1px solid var(--color-neutral-3);
    border-radius: 6px;
    box-shadow: 0 0 10px 0 rgba(203, 208, 219, 0.302);
    :deep(.arco-statistic-title) {
      margin-bottom: 2px;
      font-size: 13px;
    }
    :deep(.arco-statistic-content .arco-statistic-value) {
      font-size: 14px;
    }
  }
  .module-item-wrapper {
    margin: 5px 0 10px;
    background: linear-gradient(to top, #98cef138 0%, var(--color-bg-2) 100%);
    min-height: 63px;
    border-radius: 0 0 5px 5px;
    width: 100%;
    padding: 0 5px;
    justify-content: space-around;
    :deep(.arco-space-item) {
      text-align: center;
      margin-right: 0 !important;
      width: calc(50% - 12px);
      justify-content: center;
    }
    :deep(.arco-space-item-split) {
      margin-right: 0 !important;
    }
    :deep(.arco-space-item-split .arco-divider-vertical) {
      height: 32px;
    }
  }
  :deep(.arco-table-tr) {
    height: 44px;
    .arco-typography {
      margin-bottom: 0;
    }
  }
  .increases-cell {
    display: flex;
    align-items: center;
    span {
      margin-right: 4px;
    }
  }
  .header-title {
    display: flex;
    align-items: center;
    :deep(.arco-avatar-text) {
      font-size: 12px;
    }
  }
  .header-info {
    flex: 1;
    min-width: 0;
    .card-header {
      font-size: 14px;
    }
    .card-desc {
      color: var(--color-text-3);
      margin-top: 4px;
      font-size: 12px;
    }
  }
  .text-overflow {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  .last-time {
    font-size: 11px;
    color: var(--color-neutral-6);
  }
</style>
