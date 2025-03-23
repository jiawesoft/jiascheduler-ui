<template>
  <a-form
    ref="formRef"
    :model="formData"
    class="form"
    :auto-label-width="true"
    :label-col-props="{ span: 6 }"
    :wrapper-col-props="{ span: 18 }"
  >
    <a-form-item
      field="database_type"
      :label="$t('install.database.type')"
      :rules="[
        {
          required: true,
        },
      ]"
    >
      <a-select v-model="formData.database_type" disabled>
        <a-option value="mysql">mysql</a-option>
        <a-option value="postgresql">postgresql</a-option>
      </a-select>
    </a-form-item>
    <a-form-item
      field="database_url"
      :label="$t('install.database.address')"
      :tooltip="$t('install.database.tips.address') + mysqlExample"
      :rules="[
        {
          required: true,
        },
      ]"
    >
      <a-input v-model="formData.database_url" />
      <template #help>
        {{ $t('install.defaultDockerAddr') }}:
        {{ defaultDockerDatabaseUrl }}
      </template>
    </a-form-item>

    <a-form-item
      field="redis_url"
      :label="$t('install.redis.address')"
      :tooltip="$t('install.redis.tips.address') + redisExample"
      :rules="[
        {
          required: true,
        },
      ]"
    >
      <a-input v-model="formData.redis_url" />
      <template #help>
        {{ $t('install.defaultDockerAddr') }}:
        {{ defaultDockerRedisUrl }}
      </template>
    </a-form-item>

    <a-form-item
      field="bind_addr"
      :label="$t('install.httpServer.bindAddr')"
      :rules="[
        {
          required: true,
        },
      ]"
    >
      <a-input
        v-model="formData.bind_addr"
        :default-value="formData.bind_addr"
      />
      <template #help>
        <span>{{ $t('install.httpServer.tips.bindAddr') }}</span>
      </template>
    </a-form-item>

    <a-form-item>
      <a-button type="primary" @click="onNextClick">
        {{ $t('operations.next') }}
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script lang="ts" setup>
  import { FormInstance } from '@arco-design/web-vue/es/form';
  import { ref } from 'vue';

  const emits = defineEmits(['changeStep']);
  const formRef = ref<FormInstance>();
  const formData = ref({
    redis_url: '',
    database_url: '',
    database_type: 'mysql',
    bind_addr: '0.0.0.0:9090',
  });

  const defaultDockerRedisUrl = 'redis://default:3DGiuazc7wkAppV3@redis:6379';
  const defaultDockerDatabaseUrl =
    'mysql://root:kytHmeBR4Vg@mysql:3306/jiascheduler';

  const mysqlExample =
    '"mysql://<user>:<password>@localhost:3306/jiascheduler"';
  const redisExample = '"redis://<user>:<password>@127.0.0.1"';

  const onNextClick = async () => {
    const res = await formRef.value?.validate();
    if (!res) {
      emits('changeStep', 'forward', { ...formData.value });
    }
  };
</script>

<style scoped lang="less">
  .container {
    padding: 20px;
    .keep-margin {
      margin-bottom: 20px;
    }
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 64px 0;
    background-color: var(--color-bg-2);
  }

  .steps {
    margin-bottom: 36px;
  }

  .form {
    width: 500px;
  }

  .form-content {
    padding: 8px 50px 0 30px;
  }
</style>
