<template>
  <ul
    v-show="contextVisible"
    :style="{ left: left + 'px', top: top + 'px' }"
    class="contextmenu"
  >
    <li @click="handleCloseTerminal('current')">{{
      $t('terminal.contextmenu.closeCurrent')
    }}</li>
    <li
      :class="{ gray: listNumber === 1 }"
      @click="handleCloseTerminal('other')"
      >{{ $t('terminal.contextmenu.closeOther') }}</li
    >
    <li @click="handleCloseTerminal('all')">{{
      $t('terminal.contextmenu.closeAll')
    }}</li>
    <a-divider style="margin: 2px 0" />
    <div class="color-group">
      <div
        v-for="item in colorGroup"
        :key="item.className"
        :class="['color-box', { selected: colorTab === item.className }]"
        @click="handleSelectColor(item)"
      >
        <icon-stop
          v-if="item.className === 'normal'"
          :size="18"
          :style="{ color: '#ccc', marginTop: '-1px' }"
        />
        <div
          v-if="item.className !== 'normal'"
          class="color-box-innder"
          :style="{ background: item.color }"
        >
        </div>
        <div
          v-if="item.className !== 'normal'"
          class="color-selected"
          :style="{ border: `1px solid ${item.color}` }"
        ></div>
      </div>
    </div>
  </ul>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  defineProps({
    contextVisible: {
      type: Boolean,
      default: false,
    },
    top: {
      type: Number,
      default: 0,
    },
    left: {
      type: Number,
      default: 0,
    },
    listNumber: {
      type: Number,
      default: 1,
    },
  });
  const emit = defineEmits(['colorChange', 'closeTerminal']);

  interface colorGroupType {
    className: string;
    color: string;
  }
  const colorGroup = [
    {
      className: 'normal',
      color: '',
    },
    {
      className: 'violet',
      color: '#9e56ee',
    },
    {
      className: 'green',
      color: '#00ae5a',
    },
    {
      className: 'blue',
      color: '#2f8eff',
    },
    {
      className: 'orange',
      color: '#f09c4e',
    },
    {
      className: 'purple',
      color: '#776bff',
    },
    {
      className: 'green2',
      color: '#aabf6f',
    },
  ];
  const colorTab = ref('normal');
  function handleSelectColor(item: colorGroupType) {
    colorTab.value = item.className;
    emit('colorChange', item.color);
  }

  function handleCloseTerminal(type: string) {
    emit('closeTerminal', type);
  }
</script>

<style lang="less" scoped>
  .contextmenu {
    margin: 0;
    background: var(--color-bg-1);
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: var(--color-text-2);
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
    li {
      margin: 0;
      padding: 10px 16px;
      cursor: pointer;
      &:hover {
        background: var(--color-neutral-3);
      }
      &.gray {
        cursor: not-allowed;
        color: var(--color-neutral-5);
      }
    }
    .color-group {
      display: flex;
      margin: 0 5px;
      .color-box {
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 4px;
        position: relative;
        .color-selected {
          display: none;
        }
        &:hover {
          background: var(--color-neutral-3);
        }
        &.selected {
          .color-selected {
            display: block;
            position: absolute;
            top: 4px;
            left: 4px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: 1px solid inherit;
          }
          .color-box-innder {
            width: 12px;
            height: 12px;
          }
        }
        .color-box-innder {
          width: 16px;
          height: 16px;
          border-radius: 50%;
        }
      }
    }
  }
</style>
