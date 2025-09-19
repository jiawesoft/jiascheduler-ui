<template>
  <div style="width: 100%">
    <a-row v-if="props.controlled">
      <a-button type="secondary" @click="addJobArg" size="mini">
        {{ $t('form.add') }}
      </a-button>
    </a-row>

    <a-row v-if="args.length > 0">
      <a-table
        :data="args"
        :columns="columns"
        style="margin-top: 5px"
        size="small"
        :pagination="false"
      >
        <template #name="{ rowIndex }">
          <a-input
            v-model="args[rowIndex].name"
            @change="changeValue"
            :disabled="!props.controlled"
          />
        </template>
        <template #val="{ rowIndex }">
          <a-input v-model="args[rowIndex].val" @change="changeValue" />
        </template>
        <template #info="{ rowIndex }">
          <a-input
            v-model="args[rowIndex].info"
            @change="changeValue"
            :disabled="!props.controlled"
          />
        </template>
        <template #operations="{ rowIndex }">
          <a-button size="mini" @click="deleteJobArg(rowIndex)">
            {{ $t('operations.delete') }}
          </a-button>
        </template>
      </a-table>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
  import { useI18n } from 'vue-i18n';
  import { JobArg } from '@/api/job';
  import { PropType, ref } from 'vue';

  const props = defineProps({
    args: {
      type: Array as PropType<JobArg[]>,
      default() {
        return [];
      },
    },
    controlled: {
      type: Boolean,
      default: false,
    },
  });

  const { t } = useI18n();
  const emit = defineEmits(['update:args']);
  const args = ref(props.args);

  const columns = [
    {
      title: t('job.arg.name'),
      dataIndex: 'name',
      slotName: 'name',
    },
    {
      title: t('job.arg.defaultVal'),
      dataIndex: 'val',
      slotName: 'val',
    },
    {
      title: t('job.arg.info'),
      dataIndex: 'info',
      slotName: 'info',
    },
    {
      title: t('operations'),
      dataIndex: 'operations',
      slotName: 'operations',
    },
  ];

  const changeValue = () => {
    emit('update:args', args.value);
  };

  const addJobArg = () => {
    args.value.push({ name: '', val: '', info: '' });
    emit('update:args', args.value);
  };

  const deleteJobArg = (i: number) => {
    args.value.splice(i, 1);
    emit('update:args', args.value);
  };
</script>
