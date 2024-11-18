<template>
  <a-form ref="formRef" :model="formData" class="form">
    <a-form-item
      field="email"
      :label="$t('userSetting.basicInfo.form.label.email')"
      :rules="[
        {
          required: true,
          type: 'email',
          message: $t('userSetting.form.error.email.required'),
        },
      ]"
    >
      <a-input
        v-model="formData.email"
        :placeholder="$t('userSetting.basicInfo.placeholder.email')"
      />
    </a-form-item>
    <a-form-item
      field="nickname"
      :label="$t('userSetting.basicInfo.form.label.nickname')"
      :rules="[
        {
          required: true,
          message: $t('userSetting.form.error.nickname.required'),
        },
      ]"
    >
      <a-input
        v-model="formData.nickname"
        :placeholder="$t('userSetting.basicInfo.placeholder.nickname')"
      />
    </a-form-item>

    <a-form-item
      field="gender"
      :rules="[{ required: true }]"
      :label="$t('userSetting.basicInfo.form.label.gender')"
    >
      <a-radio-group v-model="formData.gender" type="button">
        <a-radio value="male">
          {{ $t('userSetting.basicInfo.form.label.male') }}
        </a-radio>
        <a-radio value="female">
          {{ $t('userSetting.basicInfo.form.label.female') }}
        </a-radio>
      </a-radio-group>
    </a-form-item>

    <a-form-item
      field="phone"
      :label="$t('userSetting.basicInfo.form.label.phone')"
      :rules="[
        {
          // required: true,
        },
      ]"
    >
      <a-input
        v-model="formData.phone"
        :placeholder="$t('userSetting.basicInfo.placeholder.phone')"
      />
    </a-form-item>

    <a-form-item
      field="profile"
      :label="$t('userSetting.basicInfo.form.label.profile')"
      :rules="[
        {
          maxLength: 200,
          message: $t('userSetting.form.error.profile.maxLength'),
        },
      ]"
      row-class="keep-margin"
    >
      <a-textarea
        v-model="formData.introduction"
        :placeholder="$t('userSetting.basicInfo.placeholder.profile')"
      />
    </a-form-item>
    <a-form-item>
      <a-space>
        <a-button type="primary" @click="validate">
          {{ $t('userSetting.save') }}
        </a-button>
        <a-button type="secondary" @click="reset">
          {{ $t('userSetting.reset') }}
        </a-button>
      </a-space>
    </a-form-item>
  </a-form>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { FormInstance } from '@arco-design/web-vue/es/form';
  import { useUserStore } from '@/store';
  import { UserInfo, updateUserInfo } from '@/api/user';
  import { Message } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';

  const userStore = useUserStore();
  const { t } = useI18n();

  const formRef = ref<FormInstance>();
  const formData = ref<Partial<UserInfo>>({
    email: userStore.email,
    nickname: userStore.nickname,
    username: userStore.username,
    avatar: userStore.avatar,
    user_id: userStore.user_id,
    gender: userStore.gender,
    phone: userStore.phone,
    introduction: userStore.introduction!,
  });
  const validate = async () => {
    const res = await formRef.value?.validate();
    if (!res) {
      await updateUserInfo({
        ...formData.value,
      });

      Message.success({
        content: t('userSetting.basicInfo.form.updateSuccess'),
        onClose: () => {
          window.location.reload();
        },
      });
    }
  };
  const reset = async () => {
    formRef.value?.resetFields();
  };
</script>

<style scoped lang="less">
  .form {
    width: 540px;
    margin: 0 auto;
  }
</style>
