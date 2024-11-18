<template>
  <div class="footer-command">
    <div class="quick-command-wrapper">
      <div class="command-header">
        <div class="command-btn delete" @click="clearCommand">
          <icon-delete
            :size="16"
            :stroke-width="3"
            :style="{ color: 'rgb(var(--red-6))', marginRight: '3px' }"
            class="delete-icon"
          />
          {{ $t('terminal.footer.clearCommand') }}
        </div>
        <a-divider direction="vertical" />
        <div class="command-btn">
          <a-switch v-model="checkAllChat" size="small" />
          <span class="all-session-chat">{{
            $t('terminal.footer.sendAllChat')
          }}</span>
          <a-tag color="orangered"
            >{{ connectChat }} {{ $t('terminal.footer.connectChat') }}</a-tag
          >
        </div>
      </div>
      <div class="command-body">
        <a-textarea
          v-model="commandContent"
          :placeholder="$t('terminal.footer.areaPlaceholder')"
          auto-size
          :style="{ height: '110px', overflowY: 'auto' }"
          @keydown.ctrl.enter="sendCommand"
        />
      </div>
      <div class="command-send">
        <a-button type="primary" shape="round" @click="sendCommand">
          <template #icon>
            <icon-send />
          </template>
          {{ $t('terminal.footer.send') }}
        </a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  defineProps({
    connectChat: {
      type: Number,
      default: 0,
    },
  });
  const emit = defineEmits(['sendCommand']);
  const checkAllChat = ref<boolean>(false);

  const commandContent = ref<string>('');
  const clearCommand = () => {
    commandContent.value = '';
  };

  const sendCommand = () => {
    emit('sendCommand', {
      checkAllChat: checkAllChat.value,
      command: commandContent.value,
    });
    clearCommand();
  };
</script>

<style lang="less" scoped>
  .footer-command {
    height: 150px;
    // border: 1px solid red;
    .quick-command-wrapper {
      padding: 0 10px;
      position: relative;
    }
    .command-header {
      display: flex;
      height: 40px;
      align-items: center;
      padding: 5px 0;

      .command-btn {
        display: flex;
        align-items: center;
        color: var(--color-neutral-8);
        .all-session-chat {
          margin: 0 10px;
        }
        &.delete {
          cursor: pointer;
        }
      }
      .delete-icon {
        display: block;
        margin-top: 1px;
      }
    }
    .command-body {
      height: 110px;
      // background: var(--color-neutral-2);
      border-radius: 4px;
      // padding: 8px 10px;
    }
    .command-send {
      position: absolute;
      bottom: 4px;
      right: 14px;
      z-index: 10;
    }
    // background-color: rgba(255, 0, 0, 0.4);
  }
</style>
