<template>
  <a-modal
    :visible="visible"
    title-align="start"
    :draggable="true"
    width="520px"
    :unmount-on-close="true"
    @before-ok="handleBeforeOk"
    @cancel="handleCancel"
  >
    <template #title> {{ $t('terminal.sshConnect') }} </template>
    <a-radio-group v-model="mode" type="button" style="margin-bottom: 16px">
      <a-radio value="agent" :disabled="!record?.ssh_user">
        {{ $t('terminal.sshConnect.agent') }}
      </a-radio>
      <a-radio value="manual">
        {{ $t('terminal.sshConnect.manual') }}
      </a-radio>
    </a-radio-group>

    <!-- agent 上报账号 -->
    <div v-if="mode === 'agent'" class="agent-info">
      <a-descriptions :column="1" size="small" bordered>
        <a-descriptions-item :label="$t('instance.sysUser')">
          {{ record?.ssh_user || record?.sys_user || '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('terminal.sshConnect.authType')">
          {{ authTypeLabel(record?.ssh_auth_type) }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('terminal.sshConnect.sshPort')">
          {{ record?.ssh_port || 22 }}
        </a-descriptions-item>
      </a-descriptions>
      <a-alert
        style="margin-top: 12px"
        type="info"
        :content="$t('terminal.sshConnect.agentTip')"
      />
    </div>

    <!-- 手动指定账号 -->
    <a-form
      v-else
      ref="manualFormRef"
      :model="manualForm"
      :auto-label-width="true"
    >
      <a-form-item
        field="user"
        :label="$t('terminal.sshConnect.user')"
        :rules="[
          { required: true, message: $t('terminal.sshConnect.userRequired') },
        ]"
      >
        <a-input v-model="manualForm.user" :placeholder="'root'" />
      </a-form-item>
      <a-form-item
        field="auth_type"
        :label="$t('terminal.sshConnect.authType')"
        :rules="[{ required: true }]"
      >
        <a-select v-model="manualForm.auth_type">
          <a-option value="password">
            {{ $t('terminal.sshConnect.auth.password') }}
          </a-option>
          <a-option value="key_path">
            {{ $t('terminal.sshConnect.auth.keyPath') }}
          </a-option>
          <a-option value="key_content">
            {{ $t('terminal.sshConnect.auth.keyContent') }}
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item
        v-if="manualForm.auth_type === 'password'"
        field="password"
        :label="$t('terminal.sshConnect.password')"
        :rules="[
          {
            required: true,
            message: $t('terminal.sshConnect.passwordRequired'),
          },
        ]"
      >
        <a-input-password v-model="manualForm.password" allow-clear />
      </a-form-item>
      <a-form-item
        v-else-if="manualForm.auth_type === 'key_path'"
        field="key_path"
        :label="$t('terminal.sshConnect.keyPath')"
        :rules="[
          {
            required: true,
            message: $t('terminal.sshConnect.keyPathRequired'),
          },
        ]"
      >
        <a-input
          v-model="manualForm.key_path"
          placeholder="/home/user/.ssh/id_rsa"
        />
      </a-form-item>
      <a-form-item
        v-else
        field="key_content"
        :label="$t('terminal.sshConnect.keyContent')"
        :rules="[
          {
            required: true,
            message: $t('terminal.sshConnect.keyContentRequired'),
          },
        ]"
      >
        <a-textarea v-model="manualForm.key_content" :rows="5" />
      </a-form-item>
      <a-form-item
        field="port"
        :label="$t('terminal.sshConnect.sshPort')"
        :rules="[{ required: true, type: 'number' }]"
      >
        <a-input-number v-model="manualForm.port" :min="1" :max="65535" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, reactive, watch, PropType } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';
  import { Message } from '@arco-design/web-vue';
  import { InstanceRecord, UserServerRecord } from '@/api/instance';

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false,
    },
    record: {
      type: Object as PropType<InstanceRecord | UserServerRecord>,
      default: null,
    },
  });

  const emit = defineEmits(['update:visible', 'cancel']);

  const router = useRouter();
  const { t } = useI18n();

  const mode = ref<'agent' | 'manual'>('manual');
  const manualFormRef = ref();

  const manualForm = reactive({
    user: '',
    auth_type: 'password',
    password: '',
    key_path: '',
    key_content: '',
    port: 22,
  });

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        // 有 agent 上报账号时默认使用，否则手动输入
        mode.value = props.record?.ssh_user ? 'agent' : 'manual';
        manualForm.user =
          props.record?.ssh_user || props.record?.sys_user || '';
        manualForm.port = props.record?.ssh_port || 22;
        manualForm.password = '';
        manualForm.key_path = '';
        manualForm.key_content = '';
      }
    }
  );

  function authTypeLabel(authType?: string) {
    if (authType === 'password') return t('terminal.sshConnect.auth.password');
    if (authType === 'key_path') return t('terminal.sshConnect.auth.keyPath');
    if (authType === 'key_content')
      return t('terminal.sshConnect.auth.keyContent');
    return '-';
  }

  function handleCancel() {
    emit('update:visible', false);
    emit('cancel');
  }

  async function handleBeforeOk() {
    if (!props.record) {
      Message.error(t('terminal.create.notSelected'));
      return false;
    }

    const query: Record<string, string> = {
      instance_id: props.record.instance_id,
    };

    if (mode.value === 'manual') {
      const ret = await manualFormRef.value.validate();
      if (ret) {
        return false;
      }
      query.user = manualForm.user;
      query.auth_type = manualForm.auth_type;
      query.port = String(manualForm.port);
      if (manualForm.auth_type === 'password') {
        query.password = manualForm.password;
      } else if (manualForm.auth_type === 'key_path') {
        query.key_path = manualForm.key_path;
      } else {
        query.key_content = manualForm.key_content;
      }
    }

    const url = router.resolve({
      name: 'terminal',
      query,
    });
    window.open(url.href, '_blank');

    emit('update:visible', false);
    return true;
  }
</script>

<style lang="less" scoped>
  .agent-info {
    margin-top: 8px;
  }
</style>
