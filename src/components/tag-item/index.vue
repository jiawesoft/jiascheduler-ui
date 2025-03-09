<template>
  <div class="tag-list">
    <a-tag
      v-for="(tag, index) of tagList"
      :key="index"
      :color="generateTagColor(tag.tag_name)"
      :bordered="currentTagIds?.includes(tag.tag_id)"
      @click="selectTag(tag)"
    >
      <template #icon>
        <icon-check-circle-fill v-if="currentTagIds?.includes(tag.tag_id)" />
      </template>
      {{ tag.tag_name }}{{ controlled ? `(${tag.total})` : '' }}
    </a-tag>
  </div>
</template>

<script lang="ts" setup>
  import { generateTagColor } from '@/utils';
  import { PropType, ref } from 'vue';
  import { TagRecord } from '@/api/tag';

  defineProps({
    tagList: {
      type: Array as PropType<TagRecord[]>,
      default() {
        return [];
      },
    },
    controlled: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['queryTagList']);

  const currentTagIds = ref<number[]>([]);

  const selectTag = (tag: TagRecord) => {
    if (currentTagIds.value?.includes(tag.tag_id)) {
      const index = currentTagIds.value.findIndex((v) => v === tag.tag_id);
      currentTagIds.value.splice(index, 1);
    } else {
      currentTagIds.value?.push(tag.tag_id);
    }

    emit('queryTagList', currentTagIds.value);
  };
</script>

<style scoped lang="less">
  .tag-list {
    display: flex;
    align-items: center;
    :deep(.arco-tag) {
      cursor: pointer;
      margin: 2px 6px 2px 0;
      .arco-tag-icon {
        margin-right: 0;
        svg {
          margin-right: 4px;
        }
      }
    }
    :deep(.arco-space-horizontal .arco-space-item) {
      margin-bottom: 0;
    }
  }
</style>
