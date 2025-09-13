<template>
  <a-table size="small" :columns="columns" :data="$props.data.tasks">
    <template #dispathResult="{ record }">
      <a-tag color="red" v-if="record.dispatch_result.has_err">
        {{ record.dispatch_result.err }}
      </a-tag>
      <a-tag
        color="green"
        v-else-if="record.dispatch_result.response.code === 20000"
        >{{ record.dispatch_result.response.msg }}</a-tag
      >
      <a-tag v-else color="read">failed</a-tag>
    </template>

    <template #elapsed="{ record }">
      {{ getSecondDiffNow(record.created_time, record.updated_time) }}s
    </template>

    <template #operations="{ record }">
      <a-button
        type="dashed"
        size="mini"
        @click="handleTaskOutputModal($event, record)"
      >
        {{ $t('job.output') }}
      </a-button>
    </template>
  </a-table>

  <a-modal
    v-model:visible="outputVisible"
    title-align="start"
    style="width: auto"
    :draggable="true"
    width="50%"
    hide-cancel
    @cancel="handleCancel"
  >
    <template #title>{{ $t('job.runDetail') }}</template>
    <output-area v-if="outputVisible" :output="output" />
  </a-modal>
</template>

<script lang="ts" setup>
  import { CompletedNode } from '@/api/workflow';
  import { getSecondDiffNow } from '@/utils/time';
  import { TableColumnData } from '@arco-design/web-vue';
  import { computed, reactive, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import OutputArea from '@/components/output-area/index.vue';

  const props = defineProps<{
    data: CompletedNode;
  }>();

  const outputVisible = ref(false);
  const output = ref('');

  const { t } = useI18n();

  const columns = computed<TableColumnData[]>(() => [
    {
      title: t('job.bindIp'),
      dataIndex: 'bind_ip',
    },
    {
      title: t('job.startTime'),
      dataIndex: 'created_time',
    },
    {
      title: t('job.elapsed'),
      dataIndex: 'elapsed',
      slotName: 'elapsed',
    },
    {
      title: t('job.schedule.dispatchResult'),
      dataIndex: 'dispatch_result',
      slotName: 'dispathResult',
    },
    {
      title: t('job.exitStatus'),
      dataIndex: 'exit_status',
    },

    {
      title: t('operations'),
      dataIndex: 'operations',
      slotName: 'operations',
      width: 50,
      fixed: 'right',
    },
  ]);

  const handleTaskOutputModal = (e: any, record: any) => {
    output.value = record.output;
    outputVisible.value = true;
  };

  const handleCancel = () => {
    outputVisible.value = false;
  };
</script>
