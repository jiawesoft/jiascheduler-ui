<template>
  <div
    ref="fieldRef"
    class="ssh-secret-field"
    :class="{ 'is-full': fullWidth }"
    @focusout="handleFocusOut"
  >
    <!-- Frozen state: status only, editing starts on click (can be disabled). -->
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

    <!-- Editing state -->
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

    <!-- Import a file: any file type, at most 512KB per file -->
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

  /** Maximum file size that may be imported: 512KB. */
  const MAX_FILE_SIZE = 512 * 1024;

  const props = defineProps({
    /** password | key_content */
    type: {
      type: String,
      default: 'password',
    },
    /** Plaintext content, owned by the parent component. */
    modelValue: {
      type: String,
      default: '',
    },
    /** Whether the server already stores the credential (password or key). */
    hasStored: {
      type: Boolean,
      default: false,
    },
    /** Take a full row, instead of flexing inside a row. */
    fullWidth: {
      type: Boolean,
      default: false,
    },
    /**
     * Enable the "frozen until clicked" interaction. When disabled the field is
     * always a plain editable input, which is what the connection dialog needs
     * because it switches auth type back and forth.
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

  /** Considered filled when typed now, or already stored on the server. */
  const hasStored = computed(() => props.hasStored || !!props.modelValue);
  /** Never frozen when the collapsing interaction is disabled. */
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
   * Collapse back to the frozen state only when focus leaves the whole field and
   * nothing was typed.
   *
   * This cannot live on the input `blur`: clicking "import key file" fires blur
   * before click, so the button would be unmounted before the click is
   * dispatched and the file picker would never open. The check is therefore
   * deferred until after the current task, when the click has been dispatched.
   */
  function handleFocusOut(e: FocusEvent) {
    const next = e.relatedTarget as Node | null;
    if (
      next &&
      e.currentTarget instanceof HTMLElement &&
      e.currentTarget.contains(next)
    ) {
      // Focus is still on another control of this field (import/collapse button).
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

  /** Clear the value and collapse back to the frozen state. */
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
      // Stay editable after importing so the content can be tweaked by hand.
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
