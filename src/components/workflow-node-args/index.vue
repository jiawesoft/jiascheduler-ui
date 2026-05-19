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
          <a-input-group>
            <a-select
              v-model="args[rowIndex].val_type"
              @change="args[rowIndex].val = ''"
              :options="[
                { label: t('workflow.nodeConfig.static'), value: 'default' },
                { label: t('workflow.nodeConfig.dynamic'), value: 'dynamic' },
              ]"
            />
            <a-input
              v-if="args[rowIndex].val_type == 'default'"
              v-model="args[rowIndex].val"
              @change="changeValue"
            />
            <a-select
              v-else
              :placeholder="t('workflow.nodeConfig.selectTasks.tips')"
              v-model="args[rowIndex].val"
              allow-search
            >
              <a-option
                v-for="(node, index) of tasks.filter((v) => {
                  return v.node_type === 'bpmn:serviceTask';
                })"
                :key="index"
                :value="node.id"
              >
                {{ node.name }}
              </a-option>
            </a-select>
          </a-input-group>
        </template>
        <template #info="{ rowIndex }">
          <a-input
            v-model="args[rowIndex].info"
            @change="changeValue"
            :disabled="!props.controlled"
          />
        </template>
        <template v-if="props.controlled" #operations="{ rowIndex }">
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
  import { computed, PropType, ref } from 'vue';
  import { NodeConfig, WorkflowJobArgs } from '@/api/workflow';

  const props = defineProps({
    args: {
      type: Array as PropType<WorkflowJobArgs[]>,
      default() {
        return [];
      },
    },

    tasks: {
      type: Array as PropType<NodeConfig[]>,
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
  const tasks = ref(props.tasks);

  const columns = computed(() => {
    const cols = [
      {
        title: t('job.arg.name'),
        dataIndex: 'name',
        slotName: 'name',
      },
      {
        title: t('job.arg.val'),
        dataIndex: 'val',
        slotName: 'val',
      },
      {
        title: t('job.arg.info'),
        dataIndex: 'info',
        slotName: 'info',
      },
    ];
    if (props.controlled) {
      cols.push({
        title: t('operations'),
        dataIndex: 'operations',
        slotName: 'operations',
      });
    }

    return cols;
  });

  const changeValue = () => {
    emit('update:args', args.value);
  };

  const addJobArg = () => {
    args.value.push({ name: '', val: '', info: '', val_type: 'default' });
    emit('update:args', args.value);
  };

  const deleteJobArg = (i: number) => {
    args.value.splice(i, 1);
    emit('update:args', args.value);
  };
</script>
