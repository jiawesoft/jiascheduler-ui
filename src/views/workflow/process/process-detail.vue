<template>
  <div>
    <a-tabs default-active-key="basicInfo">
      <a-tab-pane key="basicInfo" :title="$t('workflow.basicInfo')">
        <a-timeline :style="{ marginRight: '40px' }">
          <a-timeline-item
            v-for="item in completedNode"
            :key="item.base.node_id"
            :label="item.base.created_time"
          >
            <template #dot v-if="item.base.node_status === 'end'">
              <IconCheck
                :style="{
                  fontSize: '12px',
                  padding: '2px',
                  boxSizing: 'border-box',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light-1)',
                }"
              />
            </template>
            <template #dot v-else-if="item.base.node_status !== 'end'">
              <IconClockCircle
                :style="{ fontSize: '12px', color: '#00B42A' }"
              />
            </template>
            {{ getNode(nodeConfigs, item.base.node_id)?.name }}
          </a-timeline-item>
        </a-timeline>
      </a-tab-pane>
      <a-tab-pane key="processDefine" :title="$t('workflow.process.detail')">
        <div class="workflow-container" ref="container"></div>
      </a-tab-pane>
    </a-tabs>
  </div>

  <a-drawer
    width="40%"
    :visible="editNodeModalVisible"
    placement="right"
    @before-ok="saveNodeConfig"
    @cancel="editNodeModalVisible = false"
    unmountOnClose
  >
    <template #title> {{ $t('workflow.nodeConfig') }} </template>

    <a-form
      ref="saveNodeConfigRef"
      :rules="nodeConfigCheckRules"
      :model="nodeConfig"
      :auto-label-width="true"
      disabled
      @submit="saveNodeConfig"
    >
      <a-form-item
        field="name"
        validate-trigger="blur"
        :label="$t('workflow.nodeConfig.name')"
      >
        <a-input v-model="nodeConfig.name" @press-enter="saveNodeConfig" />
      </a-form-item>
      <a-form-item
        field="name"
        validate-trigger="blur"
        :tooltip="$t('workflow.nodeConfig.id.tips')"
        :label="$t('workflow.nodeConfig.id')"
      >
        <a-input v-model="nodeConfig.id" />
      </a-form-item>

      <a-form-item field="taskType" :label="$t('workflow.nodeConfig.TaskType')">
        <a-radio-group
          v-model="nodeConfig.task_type"
          @change="changeNodeTaskType"
        >
          <a-radio value="standard">
            {{ $t('workflow.nodeConfig.TaskType.job') }}
          </a-radio>
          <a-radio value="custom">
            {{ $t('workflow.nodeConfig.TaskType.custom') }}
          </a-radio>
        </a-radio-group>
      </a-form-item>

      <template v-if="nodeConfig.task_type === 'standard'">
        <a-form-item
          field="eid"
          validate-trigger="blur"
          :label="$t('job')"
          v-if="nodeConfig.task_type == 'standard'"
        >
          <SelectJob
            v-model:eid="nodeConfig.task.standard!.eid"
            job-type="default"
          />
        </a-form-item>
      </template>

      <template v-else>
        <a-form-item field="executor_id" :label="$t('job.executor')">
          <SelectExecutor v-model="nodeConfig.task.custom!.executor_id" />
        </a-form-item>

        <a-form-item field="code" :label="$t('job.code')">
          <v-ace-editor
            :key="nodeConfig.task.custom?.executor_id"
            v-model:value="nodeConfig.task.custom!.code"
            :style="{ height: '300px', width: '100%' }"
            :lang="getEditorLang"
            :print-margin="false"
            :theme="theme === 'dark' ? 'chaos' : 'chrome'"
          />
        </a-form-item>
        <a-form-item
          field="upload_file"
          :label="$t('job.upload_file')"
          :tooltip="$t('job.upload_file.tooltip')"
        >
          <a-space direction="vertical" :style="{ width: '100%' }">
            <a-upload
              v-model="uploadFileList"
              action="/api/file/upload"
              :limit="1"
              :default-file-list="defaultFileList()"
              :file-list="uploadFileList"
            />
          </a-space>
        </a-form-item>
      </template>
    </a-form>
  </a-drawer>
</template>

<script lang="ts" setup>
  import { useAppStore } from '@/store';
  import LogicFlow from '@logicflow/core';
  import '@logicflow/core/lib/style/index.css';
  import {
    Menu,
    Control,
    MiniMap,
    DndPanel,
    SelectionSelect,
    BpmnElement,
    Snapshot,
    CurvedEdge,
    CurvedEdgeModel,
  } from '@logicflow/extension';
  import '@logicflow/extension/lib/style/index.css';
  import { computed, nextTick, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import { useI18n } from 'vue-i18n';
  import { VAceEditor } from 'vue3-ace-editor';

  import 'ace-builds/src-noconflict/mode-powershell';
  import 'ace-builds/src-noconflict/mode-python';
  import 'ace-builds/src-noconflict/mode-sh';
  import 'ace-builds/src-noconflict/theme-chaos';
  import 'ace-builds/src-noconflict/theme-chrome';

  import {
    ExecutorRecord,
    queryExecutorList,
    QueryExecutorReq,
  } from '@/api/executor';
  import { Pagination } from '@/types/global';
  import { getCommand } from '@/utils';
  import { FileItem, Message } from '@arco-design/web-vue';
  import useLoading from '@/hooks/loading';
  import {
    CompletedNode,
    EdgeConfig,
    getWorkflowProcessDetail,
    NodeConfig,
    Task,
  } from '@/api/workflow';

  import SelectJob from '@/views/respository/components/select-job.vue';
  import SelectExecutor from '@/views/respository/components/select-executor.vue';

  const props = defineProps({
    processId: {
      type: String,
      required: true,
    },
  });

  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();
  const { loading, setLoading } = useLoading(true);

  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };

  const minimapVisible = ref(false);
  const gridVisible = ref(false);
  const editNodeModalVisible = ref(false);
  const saveNodeConfigRef = ref();
  const lf = ref<LogicFlow>();
  const uploadFileList = ref<FileItem[]>([]);

  const CustomCurved = {
    type: 'curvedEdge',
    model: class CustomCurvedEdgeModel extends CurvedEdgeModel {
      initEdgeData(data: LogicFlow.EdgeData) {
        super.initEdgeData(data);
        this.radius = 10;
      }

      getEdgeStyle() {
        const style = super.getEdgeStyle();
        style.strokeWidth = 2;
        return style;
      }
    },
    view: CurvedEdge,
  };

  const nodeConfig = ref<NodeConfig>({
    id: '',
    name: '',
    node_type: '',
    task_type: 'standard',
    task: {
      standard: {
        eid: '',
        formal_args: [],
      },
    },
    data: {},
  });
  const nodeConfigs = ref<NodeConfig[]>([]);
  const edgeConfigs = ref<EdgeConfig[]>([]);
  const completedNode = ref<CompletedNode[]>([]);

  const theme = computed(() => {
    return useAppStore().theme;
  });

  const container: any = ref(null);

  const nodeConfigCheckRules = {
    name: {
      required: true,
    },
  };

  const executorOptions = ref<ExecutorRecord[]>([]);

  const fetchExecutorData = async (params: {
    name?: string;
    default_id?: number;
  }) => {
    const { data } = await queryExecutorList({
      ...basePagination,
      ...params,
    } as unknown as QueryExecutorReq);
    executorOptions.value = data.list;
  };

  const getEditorLang = computed<string>(() => {
    const executorItem = executorOptions.value.find(
      (item) => item.id === nodeConfig.value.task.custom?.executor_id
    );
    const currentCommand = executorItem ? executorItem.command : 'bash';
    return getCommand(currentCommand);
  });

  const saveNodeConfig = async () => {
    const ret = await saveNodeConfigRef.value.validate();
    if (ret) {
      return false;
    }

    const originNodeId: string = nodeConfig.value.data.id;

    lf.value
      ?.getNodeModelById(nodeConfig.value.id)
      ?.updateText(nodeConfig.value.name);

    if (originNodeId !== nodeConfig.value.id) {
      lf.value?.changeNodeId(originNodeId, nodeConfig.value.id);
    }

    const nodeData = lf.value?.getNodeDataById(nodeConfig.value.id);

    nodeConfigs.value = nodeConfigs.value.filter((v) => v.id !== originNodeId);
    nodeConfigs.value.push({
      ...nodeConfig.value,
      data: { ...nodeData },
    });
    console.log('val:', nodeConfig.value);
    editNodeModalVisible.value = false;
    return true;
  };

  const defaultFileList = (): FileItem[] => {
    const uploadFile = nodeConfig.value.task.custom?.upload_file;
    if (uploadFile !== '') {
      return [
        {
          uid: '1',
          url: uploadFile,
          name: uploadFile,
        },
      ];
    }
    return [];
  };

  const changeNodeTaskType = (val: any) => {
    if (val === 'custom') {
      if (!nodeConfig.value.task.custom) {
        nodeConfig.value.task.custom = {
          work_dir: '',
          work_user: '',
          timeout: 5,
          upload_file: '',
          code: '',
          executor_id: 0,
        };
      }
      fetchExecutorData({
        default_id: nodeConfig.value.task.custom.executor_id,
      });
    }
  };

  const getNode = (
    nodes: NodeConfig[],
    nodeId: string
  ): NodeConfig | undefined => {
    return nodes.find((v) => v.id === nodeId);
  };

  const fetchWorkflowProcessDetail = async (processId: string) => {
    setLoading(true);
    try {
      const { data } = await getWorkflowProcessDetail({
        process_id: processId,
      });
      nodeConfigs.value = data.origin_nodes;
      edgeConfigs.value = data.origin_edges;
      completedNode.value = data.completed_nodes;
      const graphData = {
        nodes: nodeConfigs.value.map((v) => {
          return v.data;
        }) as any,
        edges: edgeConfigs.value.map((v) => v.data) as any,
      };

      lf.value?.render(graphData);

      data.completed_nodes.forEach((node) => {
        const hasErr = node.tasks.some((task) => task.exit_code !== 0);
        lf.value?.setProperties(node.base.node_id, {
          style: {
            stroke: hasErr ? 'red' : 'green',
          },
        });
      });
      data.completed_edges.forEach((edge) => {
        lf.value?.setProperties(edge.base.edge_id, {
          style: {
            stroke: 'green',
          },
        });
      });
    } catch (err) {
      // you can report use errorHandler or other
    } finally {
      setLoading(false);
    }
  };

  onMounted(() => {
    nextTick(() => {
      lf.value = new LogicFlow({
        isSilentMode: true,
        stopScrollGraph: true,
        stopZoomGraph: true,
        snapToGrid: true,
        container: container.value,
        grid: false,
        multipleSelectKey: 'shift',
        // disabledTools: ['multipleSelect'],
        autoExpand: true,
        adjustEdgeStartAndEnd: true,
        allowRotate: true,
        edgeTextEdit: true,
        keyboard: {
          enabled: true,
        },
        animation: true,
        partial: true,
        background: {
          background: theme.value === 'dark' ? '#29292c' : '#fff',
        },
        edgeType: 'curvedEdge',
        edgeTextDraggable: true,

        edgeGenerator: (sourceNode) => {
          return 'curvedEdge';
        },
        plugins: [
          BpmnElement,
          DndPanel,
          SelectionSelect,
          Control,
          MiniMap,
          Menu,
          Snapshot,
        ],
      });

      lf.value.register(CustomCurved);

      (lf.value?.extension.menu as any).addMenuConfig({
        graphMenu: [
          {
            text: '网格',
            callback() {
              if (gridVisible.value) {
                gridVisible.value = false;
                lf.value?.graphModel.updateGridOptions({ visible: false });
              } else {
                gridVisible.value = true;
                lf.value?.graphModel.updateGridOptions({ visible: true });
              }
            },
          },
        ],
      });

      (lf.value?.extension.control as Control).addItem({
        key: 'mini-map',
        iconClass: 'custom-minimap',
        title: '导航',
        text: '导航',

        onClick: (lf, ev) => {
          if (!minimapVisible.value) {
            minimapVisible.value = true;
            (lf.extension.miniMap as MiniMap).show();
          } else {
            minimapVisible.value = false;
            (lf.extension.miniMap as MiniMap).hide();
          }
        },
      });

      (lf.value?.extension.control as Control).addItem({
        key: 'reset-translate',
        iconClass: 'reset-translate',
        title: '',
        text: '居中',
        onClick: (lf, ev) => {
          // lf.resetTranslate();
          lf.translateCenter();
        },
      });

      lf.value.adapterIn = (data) => {
        return data as LogicFlow.GraphData;
      };

      lf.value?.on('node:click', (e) => {
        console.log('node:click', e.data);
        editNodeModalVisible.value = true;
        const selectNode = nodeConfigs.value.find((v) => v.id === e.data.id)!;
        nodeConfig.value = {
          ...selectNode,
        };
      });

      lf.value?.on('edge:click', (e) => {
        console.log('edge:click', e.data);
      });

      fetchWorkflowProcessDetail(props.processId);
    });
  });
</script>

<style scoped lang="less">
  .workflow-container {
    width: 100%;
    height: 680px;
  }
</style>
