<template>
  <div
    ref="fieldRef"
    class="ssh-secret-field"
    :class="{ 'is-full': fullWidth }"
    @focusout="handleFocusOut"
  >
    <!-- 冻结态：只显示状态，点击后才允许编辑（可关闭） -->
    <div
      v-if="frozen"
      class="ssh-secret-frozen"
      :class="{ 'is-empty': !hasStored }"
      @click="beginEdit"
    >
      <icon-lock v-if="hasStored" />
      <icon-edit v-else />
      <span>
        {{
          hasStored
            ? $t('instance.sshUser.storedPlaceholder')
            : $t('instance.sshUser.inputPlaceholder')
        }}
      </span>
    </div>

    <!-- 编辑态 -->
    <template v-else>
      <a-textarea
        v-if="type === 'key_content'"
        ref="inputRef"
        :model-value="modelValue"
        :auto-size="{ minRows: 3, maxRows: 8 }"
        :placeholder="$t('instance.sshUser.keyContent.placeholder')"
        @update:model-value="emit('update:modelValue', $event)"
      />
      <a-input-password
        v-else
        ref="inputRef"
        :model-value="modelValue"
        :placeholder="$t('instance.sshUser.password.placeholder')"
        @update:model-value="emit('update:modelValue', $event)"
      />
      <a-button
        v-if="type === 'key_content'"
        type="text"
        size="mini"
        :title="$t('instance.sshUser.importKeyFile')"
        @click="handleImportClick"
      >
        <template #icon><icon-upload /></template>
      </a-button>
      <a-tooltip
        v-if="collapsible"
        :content="$t('instance.sshUser.resetField')"
      >
        <a-button type="text" size="mini" @click="reset">
          <template #icon><icon-refresh /></template>
        </a-button>
      </a-tooltip>
    </template>

    <!-- 导入文件: 不限文件类型, 单文件最大 512KB -->
    <input
      ref="fileInputRef"
      type="file"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<script lang="ts" setup>
  import { computed, nextTick, ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';

  /** 单个文件最大读取 512KB */
  const MAX_FILE_SIZE = 512 * 1024;

  const props = defineProps({
    /** password | key_content */
    type: {
      type: String,
      default: 'password',
    },
    /** 明文内容, 由父组件持有 */
    modelValue: {
      type: String,
      default: '',
    },
    /** 服务端是否已存有该凭证(密码或密钥内容) */
    hasStored: {
      type: Boolean,
      default: false,
    },
    /** 占满一行(默认在 flex 行内自适应) */
    fullWidth: {
      type: Boolean,
      default: false,
    },
    /**
     * 是否启用「冻结/点击展开」交互。
     * 关闭后始终是普通可编辑输入框（用于弹窗内切换认证方式的场景）。
     */
    collapsible: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits(['update:modelValue', 'activated']);

  const { t } = useI18n();

  const editing = ref(false);
  const inputRef = ref();
  const fieldRef = ref<HTMLElement>();
  const fileInputRef = ref<HTMLInputElement>();

  /** 只有本次输入了内容, 或服务端已存有凭证时才算"已填写" */
  const hasStored = computed(() => props.hasStored || !!props.modelValue);
  /** 关闭折叠交互时永远不会处于冻结态 */
  const frozen = computed(
    () => props.collapsible && !editing.value && !props.modelValue
  );

  function beginEdit() {
    editing.value = true;
    emit('activated');
    nextTick(() => {
      inputRef.value?.focus?.();
    });
  }

  /**
   * 焦点移出本字段且没有内容时, 才退回冻结态。
   *
   * 不能在输入框的 blur 里直接收起：点击「导入密钥文件」时 blur 先于 click
   * 触发，按钮会被先卸载掉，click 便永远不会派发，文件选择框也就打不开。
   * 因此这里把判断推迟到当前事件循环之后（click 已派发）再执行。
   */
  function handleFocusOut(e: FocusEvent) {
    const next = e.relatedTarget as Node | null;
    if (
      next &&
      e.currentTarget instanceof HTMLElement &&
      e.currentTarget.contains(next)
    ) {
      // 焦点仍在本字段内部的其它控件上（例如上传/收起按钮）
      return;
    }
    setTimeout(() => {
      if (
        !props.modelValue &&
        !fieldRef.value?.contains(document.activeElement)
      ) {
        editing.value = false;
      }
    }, 0);
  }

  /** 清空并退回冻结态 */
  function reset() {
    emit('update:modelValue', '');
    editing.value = false;
  }

  function handleImportClick() {
    const input = fileInputRef.value;
    if (input) {
      input.value = '';
      input.click();
    }
  }

  async function handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    try {
      if (file.size > MAX_FILE_SIZE) {
        Message.error(t('instance.sshUser.fileTooLarge', { max: '512KB' }));
        return;
      }
      emit('update:modelValue', await file.text());
      // 导入后保持编辑态, 方便继续手工修改
      editing.value = true;
      Message.success(
        t('instance.sshUser.importKeyFileSuccess', { name: file.name })
      );
    } catch (err) {
      Message.error(`${err}`);
    } finally {
      if (input) {
        input.value = '';
      }
    }
  }

  defineExpose({ beginEdit });
</script>

<style lang="less" scoped>
  .ssh-secret-field {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    flex: 1;
    min-width: 150px;

    &.is-full {
      width: 100%;
    }

    .ssh-secret-frozen {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      min-height: 32px;
      padding: 0 12px;
      border: 1px dashed var(--color-neutral-4);
      border-radius: var(--border-radius-small);
      background-color: var(--color-fill-1);
      color: var(--color-text-2);
      font-size: 13px;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s;

      &:hover {
        border-color: rgb(var(--primary-6));
        color: rgb(var(--primary-6));
      }

      &.is-empty {
        color: var(--color-text-3);
      }
    }
  }
</style>
