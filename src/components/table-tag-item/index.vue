<template>
  <div class="table-tag-list">
    <a-tag
      v-for="(tag, index) of tagList"
      :key="index"
      :color="generateTagColor(tag.tag_name)"
      :closable="controlled"
      @close="handleRemoveTag(tag)"
    >
      {{ tag.tag_name }}
    </a-tag>

    <a-input
      v-if="showTagInput"
      ref="inputRef"
      v-model.trim="inputTagVal"
      :loading="addLoading"
      :style="{ width: '90px' }"
      size="mini"
      @keyup.enter="handleAddTag"
      @blur="handleInputBlur"
    />

    <a-tag
      v-if="!showTagInput && controlled"
      :style="{
        backgroundColor: 'var(--color-fill-2)',
        border: '1px dashed var(--color-fill-3)',
        cursor: 'pointer',
      }"
      @click="handleShowInputTag"
    >
      <template #icon>
        <icon-plus />
      </template>
    </a-tag>
    <!-- <div class="table-tag-add" @click="handleAddTag">
      <icon-plus :style="{ color: 'rgb(var(--primary-6))' }" />
    </div> -->
  </div>
</template>

<script lang="ts" setup>
  import { generateTagColor } from '@/utils';
  import { nextTick, PropType, ref } from 'vue';
  import { bindTag, unBindTag, TagItem } from '@/api/tag';

  const props = defineProps({
    tagList: {
      type: Array as PropType<TagItem[]>,
      default() {
        return [];
      },
    },
    resourceType: {
      type: String,
      default: 'job',
    },
    resourceId: {
      type: Number,
      default: -99,
    },
    controlled: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['refreshPage']);

  const showTagInput = ref<boolean>(false);
  const inputTagVal = ref<string>('');
  const inputRef = ref<HTMLInputElement | null>(null);
  const addLoading = ref<boolean>(false);

  const focusInput = () => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  };

  const handleRemoveTag = async (tag: TagItem) => {
    try {
      await unBindTag({
        resource_id: props.resourceId,
        resource_type: props.resourceType,
        tag_id: tag.id,
      });
      emit('refreshPage');
    } catch (error) {
      // you can report use errorHandler or other
    }
  };

  const handleShowInputTag = () => {
    showTagInput.value = true;
    nextTick(() => {
      focusInput();
    });
  };
  const handleAddTag = async () => {
    if (inputTagVal.value.trim()) {
      try {
        addLoading.value = true;
        await bindTag({
          resource_id: props.resourceId,
          resource_type: props.resourceType,
          tag_name: inputTagVal.value.trim(),
        });
        addLoading.value = false;
        showTagInput.value = false;
        inputTagVal.value = '';
        emit('refreshPage');
      } catch (error) {
        addLoading.value = false;
      }
    }
  };
  const handleInputBlur = () => {
    showTagInput.value = false;
    inputTagVal.value = '';
  };
</script>

<style scoped lang="less">
  .table-tag-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    .table-tag-add {
      cursor: pointer;
      border: 1px solid rgb(var(--primary-6));
      color: #fff;
      width: 14px;
      height: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 3px;
      border-radius: 50%;
      margin-left: 3px;
    }
    :deep(.arco-tag) {
      margin: 2px 3px 2px 0;
    }
  }
</style>
