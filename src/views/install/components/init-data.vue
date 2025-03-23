<template>
  <a-form
    ref="formRef"
    :model="formData"
    class="form"
    :label-col-props="{ span: 6 }"
    :wrapper-col-props="{ span: 18 }"
  >
    <a-form-item
      field="username"
      :label="$t('install.admin.username')"
      :rules="[
        {
          required: true,
        },
      ]"
    >
      <a-input v-model="formData.username" @press-enter="onNextClick" />
    </a-form-item>
    <a-form-item
      field="password"
      :label="$t('install.admin.password')"
      :rules="[
        {
          required: true,
        },
      ]"
    >
      <a-input v-model="formData.password" @press-enter="onNextClick" />
    </a-form-item>

    <a-form-item
      field="comet_secret"
      :label="$t('install.cometSecret')"
      :rules="[
        {
          required: true,
        },
      ]"
    >
      <a-input v-model="formData.comet_secret" @press-enter="onNextClick" />
      <template #help>
        {{ $t('install.cometSecret.tips') }}
      </template>
    </a-form-item>

    <a-form-item>
      <!-- <a-button type="primary" @click="onNextClick">
        {{ $t('stepForm.button.next') }}
      </a-button> -->
      <a-space>
        <a-button type="secondary" @click="goPrev">
          {{ $t('stepForm.button.prev') }}
        </a-button>
        <a-button type="primary" @click="onNextClick">
          {{ $t('stepForm.button.next') }}
        </a-button>
      </a-space>
    </a-form-item>
  </a-form>
</template>

<script lang="ts" setup>
  import { DataModel } from '@/api/migration';
  import { FormInstance } from '@arco-design/web-vue/es/form';
  import { ref } from 'vue';

  const emits = defineEmits(['changeStep']);

  const formRef = ref<FormInstance>();
  const formData = ref<DataModel>({
    username: '',
    password: '',
    comet_secret: 'rYzBYE+cXbtdMg==',
  });

  const onNextClick = async () => {
    const res = await formRef.value?.validate();
    if (!res) {
      emits('changeStep', 'submit', { ...formData.value });
    }
  };
  const goPrev = () => {
    emits('changeStep', 'backward');
  };
</script>

<style scoped lang="less">
  .container {
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
    width: 540px;
  }

  .form-content {
    padding: 8px 50px 0 30px;
  }
</style>
