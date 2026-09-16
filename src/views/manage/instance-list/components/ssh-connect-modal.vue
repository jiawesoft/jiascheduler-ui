<template>
  <a-modal
    :visible="visible"
    title-align="start"
    :draggable="true"
    width="620px"
    :unmount-on-close="true"
    @before-ok="handleBeforeOk"
    @cancel="handleCancel"
  >
    <template #title> {{ $t('terminal.sshConnect') }} </template>
    <a-radio-group v-model="mode" type="button" style="margin-bottom: 16px">
      <a-tooltip
        :content="$t('terminal.sshConnect.defaultDisabledTip')"
        :disabled="!!defaultUser"
      >
        <a-radio value="default" :disabled="!defaultUser">
          {{ $t('terminal.sshConnect.default') }}
        </a-radio>
      </a-tooltip>
      <a-radio value="agent" :disabled="!record?.ssh_user">
        {{ $t('terminal.sshConnect.agent') }}
      </a-radio>
      <a-tooltip
        :content="$t('terminal.sshConnect.otherDisabledTip')"
        :disabled="otherUsers.length > 0"
      >
        <a-radio value="other" :disabled="otherUsers.length === 0">
          {{ $t('terminal.sshConnect.other') }}
        </a-radio>
      </a-tooltip>
      <a-radio value="manual">
        {{ $t('terminal.sshConnect.manual') }}
      </a-radio>
    </a-radio-group>
    <!-- 实例默认登录用户 -->
    <div v-if="mode === 'default'" class="account-info">
      <a-descriptions :column="1" size="small" bordered>
        <a-descriptions-item :label="$t('terminal.sshConnect.user')">
          {{ defaultUser?.username || '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('terminal.sshConnect.authType')">
          {{ authTypeLabel(defaultUser?.auth_type) }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('terminal.sshConnect.sshPort')">
          {{ record?.ssh_port || 22 }}
        </a-descriptions-item>
      </a-descriptions>
      <a-alert style="margin-top: 12px">
        {{ $t('terminal.sshConnect.defaultTip') }}
      </a-alert>
    </div>

    <!-- agent 上报账号 -->
    <div v-else-if="mode === 'agent'" class="account-info">
      <a-descriptions :column="1" size="small" bordered>
        <a-descriptions-item :label="$t('terminal.sshConnect.user')">
          {{ record?.ssh_user || record?.sys_user || '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('terminal.sshConnect.authType')">
          {{ authTypeLabel(record?.ssh_auth_type) }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('terminal.sshConnect.sshPort')">
          {{ record?.ssh_port || 22 }}
        </a-descriptions-item>
      </a-descriptions>
      <a-alert style="margin-top: 12px">
        {{ $t('terminal.sshConnect.agentTip') }}
      </a-alert>
    </div>

    <!-- 实例上配置的其他登录用户 -->
    <div v-else-if="mode === 'other'" class="account-info">
      <a-radio-group v-model="selectedUser" direction="vertical">
        <a-radio
          v-for="item in otherUsers"
          :key="item.username"
          :value="item.username"
        >
          {{ item.username }}
          <span class="account-auth-type">
            ({{ authTypeLabel(item.auth_type) }})
          </span>
        </a-radio>
      </a-radio-group>
      <a-alert style="margin-top: 12px">
        {{ $t('terminal.sshConnect.otherTip') }}
      </a-alert>
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
        <a-select v-model="manualForm.auth_type" @change="handleAuthTypeChange">
          <a-option value="password">
            {{ $t('terminal.sshConnect.auth.password') }}
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
            validator: validatePassword,
            message: $t('terminal.sshConnect.passwordRequired'),
          },
        ]"
      >
        <ssh-secret-field
          v-model="manualForm.password"
          type="password"
          :has-stored="false"
          :collapsible="false"
          full-width
        />
      </a-form-item>
      <a-form-item
        v-else
        field="key_content"
        :label="$t('terminal.sshConnect.keyContent')"
        :rules="[
          {
            validator: validateKeyContent,
            message: $t('terminal.sshConnect.keyContentRequired'),
          },
        ]"
      >
        <ssh-secret-field
          v-model="manualForm.key_content"
          type="key_content"
          :has-stored="false"
          :collapsible="false"
          full-width
        />
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
  import { computed, ref, reactive, watch, PropType } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';
  import { Message } from '@arco-design/web-vue';
  import { InstanceRecord, SysUser, UserServerRecord } from '@/api/instance';
  import SshSecretField from '@/components/ssh-secret-field.vue';

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

  type ConnectMode = 'default' | 'agent' | 'other' | 'manual';

  const mode = ref<ConnectMode>('manual');
  const selectedUser = ref('');
  const manualFormRef = ref();

  const manualForm = reactive({
    user: '',
    auth_type: 'password',
    password: '',
    key_content: '',
    port: 22,
  });

  /** 切换认证方式: 清空另一侧的凭证与校验残留 */
  function handleAuthTypeChange() {
    manualForm.password = '';
    manualForm.key_content = '';
    manualFormRef.value?.clearValidate();
  }

  /**
   * 自定义组件不是原生输入框, form-item 取不到它的值,
   * 因此显式校验对应的表单字段。
   */
  function validatePassword(_value: any, callback: (error?: string) => void) {
    callback(manualForm.password ? undefined : '');
  }

  function validateKeyContent(_value: any, callback: (error?: string) => void) {
    callback(manualForm.key_content ? undefined : '');
  }

  /** 实例上配置的登录用户 */
  const sysUsers = computed<SysUser[]>(() => props.record?.sys_users || []);

  /** 默认登录用户: 由 is_default 标记, 兜底使用 sys_user 列 */
  const defaultUser = computed<SysUser | undefined>(
    () =>
      sysUsers.value.find((item) => item.is_default) ||
      sysUsers.value.find((item) => item.username === props.record?.sys_user)
  );

  /** 除默认用户以外的其他登录用户 */
  const otherUsers = computed<SysUser[]>(() =>
    sysUsers.value.filter(
      (item) => item.username !== defaultUser.value?.username
    )
  );

  watch(
    () => props.visible,
    (val) => {
      if (!val) {
        return;
      }
      // 优先使用实例默认登录用户, 其次 agent 上报账号, 再其次其他用户
      if (defaultUser.value) {
        mode.value = 'default';
      } else if (props.record?.ssh_user) {
        mode.value = 'agent';
      } else if (otherUsers.value.length > 0) {
        mode.value = 'other';
      } else {
        mode.value = 'manual';
      }
      selectedUser.value = otherUsers.value[0]?.username || '';
      manualForm.user = props.record?.ssh_user || props.record?.sys_user || '';
      manualForm.port = props.record?.ssh_port || 22;
      manualForm.password = '';
      manualForm.key_content = '';
    },
    { immediate: true }
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

    if (mode.value === 'default') {
      if (!defaultUser.value?.username) {
        Message.error(t('terminal.sshConnect.userRequired'));
        return false;
      }
      // 只传用户名, 由服务端从实例的 sys_users 中取出对应的认证信息
      query.sys_user = defaultUser.value.username;
    } else if (mode.value === 'agent') {
      // 不传账号, 由服务端回退到 agent 上报的认证信息
    } else if (mode.value === 'other') {
      if (!selectedUser.value) {
        Message.error(t('terminal.create.notSelected'));
        return false;
      }
      query.sys_user = selectedUser.value;
    } else {
      const ret = await manualFormRef.value.validate();
      if (ret) {
        return false;
      }
      query.user = manualForm.user;
      query.auth_type = manualForm.auth_type;
      query.port = String(manualForm.port);
      // 保持终端与 sftp 文件管理器使用同一个登录用户
      query.sys_user = manualForm.user;
      if (manualForm.auth_type === 'password') {
        query.password = manualForm.password;
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
  .account-info {
    margin-top: 8px;
  }

  .account-auth-type {
    color: var(--color-text-3);
    font-size: 12px;
  }
</style>
