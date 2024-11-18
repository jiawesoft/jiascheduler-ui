<template>
  <a-tabs
    default-active-key="user"
    v-model:active-key="tabType"
    type="card-gutter"
    :style="{ width: '100%' }"
    :lazy-load="true"
  >
    <a-tab-pane key="user" :title="$t('user')">
      <role-user-list :role-id="roleId" />
    </a-tab-pane>
    <a-tab-pane key="instance" :title="$t('instance')">
      <role-instance-list v-if="tabType == 'instance'" v-model="roleId" />
    </a-tab-pane>
    <a-tab-pane key="group" :title="$t('group')">
      <role-instance-group-list v-if="tabType == 'group'" v-model="roleId" />
    </a-tab-pane>
  </a-tabs>
</template>

<script lang="ts" setup>
  import { ref, toRef } from 'vue';
  import { useI18n } from 'vue-i18n';
  //  'line' | 'card' | 'card-gutter' | 'text' | 'rounded' | 'capsule';
  import roleUserList from './role-user-list.vue';
  import roleInstanceList from './role-instance-list.vue';
  import roleInstanceGroupList from './role-instance-group-list.vue';

  const { t } = useI18n();

  const tabType = ref();

  const props = defineProps<{ modelValue: number }>();
  const roleId = toRef(props.modelValue);
</script>

<style scoped lang="less"></style>
