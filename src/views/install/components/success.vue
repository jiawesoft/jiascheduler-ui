<template>
  <div class="success-wrap">
    <a-result
      status="success"
      :title="$t('install.success.title')"
      :subtitle="$t('install.success.subTitle')"
    />
    <a-space :size="16">
      <!-- <a-button key="view" type="primary">
        {{ $t('install.button.view') }}
      </a-button> -->
      <a-button key="login" type="primary" @click="login">
        {{ $t('install.button.login') }}
      </a-button>
      <!-- <a-button key="again" type="secondary" @click="oneMore">
        {{ $t('install.button.again') }}
      </a-button> -->
    </a-space>
    <div class="details-wrapper">
      <a-typography-title :heading="6" style="margin-top: 0">
        {{ $t('install.description.title') }}
      </a-typography-title>
      <a-typography-paragraph style="margin-bottom: 0">
        {{ desc }}
      </a-typography-paragraph>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/store';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const appStore = useAppStore();
  const { t } = useI18n();

  const desc = t('install.description.text').replace(
    '<config>',
    appStore.$state.configFile
  );

  const emits = defineEmits(['changeStep']);
  const oneMore = () => {
    emits('changeStep', 1);
  };
  const login = () => {
    window.location.reload();
  };
</script>

<style scoped lang="less">
  .success-wrap {
    text-align: center;
  }
  :deep(.arco-result) {
    padding-top: 0;
  }
  .details-wrapper {
    width: 895px;
    margin-top: 54px;
    padding: 20px;
    text-align: left;
    background-color: var(--color-fill-2);
  }
</style>
