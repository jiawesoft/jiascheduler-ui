<template>
  <div>
    <a-tabs default-active-key="basicInfo">
      <a-tab-pane key="basicInfo" :title="$t('workflow.basicInfo')">
        <a-timeline :style="{ marginRight: '40px' }">
          <a-timeline-item
            v-for="item in completedNodes"
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
            <template v-if="item.tasks.length > 0">
              <br />
              <a-space wrap>
                <a-typography-text
                  type="secondary"
                  :key="value.id"
                  v-for="value in item.tasks"
                >
                  <a-button
                    size="mini"
                    @click="handleOpenTaskResults(value.node_id)"
                  >
                    <a-space direction="horizontal" size="mini">
                      <a-badge
                        v-if="value.task_status == 'running'"
                        status="processing"
                      />
                      <a-badge
                        v-else
                        :status="value.exit_code !== 0 ? 'danger' : 'success'"
                      />

                      {{ value.bind_ip }}
                    </a-space>
                  </a-button>
                </a-typography-text>
              </a-space>
            </template>
          </a-timeline-item>
        </a-timeline>
      </a-tab-pane>
      <a-tab-pane key="processDefine" :title="$t('workflow.process.detail')">
        <div class="workflow-container" ref="container"></div>
      </a-tab-pane>
    </a-tabs>
  </div>

  <a-modal
    v-if="completedNode"
    v-model:visible="taskResultModalVisible"
    title-align="start"
    style="width: auto"
    :draggable="true"
    unmount-on-close
    width="61.8%"
  >
    <template #title> {{ $t('job.execResult') }}</template>
    <TaskResults :data="completedNode" />
  </a-modal>

  <!-- edge condition config -->
  <a-drawer
    width="61.8%"
    :visible="editEdgeModalVisible"
    placement="right"
    @cancel="editEdgeModalVisible = false"
    unmountOnClose
  >
    <template #title> {{ $t('workflow.condition') }} </template>

    <a-form
      :key="edgeConfig.id"
      :model="edgeConfig"
      :auto-label-width="true"
      disabled
    >
      <a-form-item field="name" label="名称">
        <a-input v-model="edgeConfig.name" />
      </a-form-item>
      <a-form-item
        v-for="(rule, index) of edgeConfig.condition?.rules"
        :field="`condition.rules[${index}]`"
        :label="`C${index + 1}`"
        :key="index"
      >
        <a-space direction="horizontal" size="mini">
          <a-select v-model="rule.left_val.val_type">
            <a-option value="exit_code">节点退出码</a-option>
            <a-option value="output">节点输出</a-option>
            <a-option value="user_variables">用户变量</a-option>
            <a-option value="custom">自定义</a-option>
          </a-select>
          <a-input
            v-if="
              rule.left_val.val_type == 'custom' ||
              rule.left_val.val_type == 'user_variables'
            "
            placeholder="请输入数据"
            v-model="rule.left_val.val"
          />

          <a-select
            v-else
            v-model="rule.left_val.val"
            placeholder="选择节点"
            allow-search
          >
            <a-option
              v-for="(node, index) of nodeConfigs.filter((v) => {
                return v.node_type === 'bpmn:serviceTask';
              })"
              :key="index"
              :value="node.id"
            >
              {{ node.name }}
            </a-option>
          </a-select>

          <a-select style="width: 83px" v-model="rule.op">
            <a-option value=">">{{ '>' }}</a-option>
            <a-option value=">=">{{ '>=' }}</a-option>
            <a-option value="<">{{ '<' }}</a-option>
            <a-option value="<=">{{ '<=' }}</a-option>
            <a-option value="contains">contains</a-option>
            <a-option value="!=">{{ '!=' }}</a-option>
            <a-option value="==">{{ '==' }}</a-option>
          </a-select>
          <a-select v-model="rule.right_val.val_type">
            <a-option value="exit_code">节点退出码</a-option>
            <a-option value="output">节点输出</a-option>
            <a-option value="user_variables">用户变量</a-option>
            <a-option value="custom">自定义</a-option>
          </a-select>
          <a-input
            v-if="
              rule.right_val.val_type == 'custom' ||
              rule.right_val.val_type == 'user_variables'
            "
            placeholder="请输入数据"
            v-model="rule.right_val.val"
          />

          <a-select
            v-else
            v-model="rule.right_val.val"
            placeholder="选择节点"
            allow-search
          >
            <a-option
              v-for="(node, index) of nodeConfigs.filter((v) => {
                return v.node_type === 'bpmn:serviceTask';
              })"
              :key="index"
              :value="node.id"
            >
              {{ node.name }}
            </a-option>
          </a-select>
          <a-button v-if="index > 0"> - </a-button>
          <a-button>+</a-button>
        </a-space>
      </a-form-item>
      <a-form-item label="运算">
        <a-space direction="vertical" style="width: 100%">
          <a-radio-group
            type="button"
            v-model="edgeConfig.condition!.logical_op"
          >
            <a-radio value="and">并且</a-radio>
            <a-radio value="or">或者</a-radio>
            <a-radio value="custom">自定义</a-radio>
          </a-radio-group>
          <a-input
            v-model="edgeConfig.condition!.expr"
            size="large"
            style="height: 100px"
            allow-clear
          />
        </a-space>
      </a-form-item>
    </a-form>
  </a-drawer>

  <!-- node config -->
  <a-drawer
    width="61.8%"
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
        <a-row :gutter="6">
          <a-col :span="6">
            <a-form-item field="executor_id" :label="$t('job.executor')">
              <SelectExecutor v-model="nodeConfig.task.custom!.executor_id" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item
              field="work_user"
              validate-trigger="blur"
              :label="$t('job.workUser')"
              :tooltip="$t('job.workUser.tips')"
            >
              <a-input v-model="nodeConfig.task.custom!.work_user" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item
              field="work_dir"
              validate-trigger="blur"
              :tooltip="$t('job.workDir.tips')"
              :label="$t('job.workDir')"
            >
              <a-input v-model="nodeConfig.task.custom!.work_dir" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item
              field="timeout"
              :tooltip="$t('job.timeout.tips')"
              validate-trigger="blur"
              :label="$t('job.timeout')"
            >
              <a-input-number v-model="nodeConfig.task.custom!.timeout" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item
          field="args"
          :label="$t('job.arg')"
          :tooltip="$t('job.arg.tips', { name: '{{name}}' })"
        >
          <workflow-node-args
            :args="nodeConfig.task.custom!.formal_args"
            :tasks="
              nodeConfigs.filter((v) => {
                return (
                  v.node_type === 'bpmn:serviceTask' && v.id !== nodeConfig.id
                );
              })
            "
          />
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

    <a-typography-title :heading="6">
      {{ t('job.execResult') }}</a-typography-title
    >
    <a-divider />
    <TaskResults v-if="completedNode" :data="completedNode" />
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

  import WorkflowNodeArgs from '@/components/workflow-node-args/index.vue';
  import SelectJob from '@/views/respository/components/select-job.vue';
  import SelectExecutor from '@/views/respository/components/select-executor.vue';
  import TaskResults from '../components/task-results.vue';

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
  const taskResultsContainerRef = ref();

  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };

  const minimapVisible = ref(false);
  const gridVisible = ref(false);
  const editNodeModalVisible = ref(false);
  const editEdgeModalVisible = ref(false);
  const taskResultModalVisible = ref(false);
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
    is_join_all: false,
  });
  const nodeConfigs = ref<NodeConfig[]>([]);
  const edgeConfigs = ref<EdgeConfig[]>([]);
  const edgeConfig = ref<EdgeConfig>({
    id: '',
    name: '',
    source_node_id: '',
    target_node_id: '',
    data: {},
  });

  const completedNodes = ref<CompletedNode[]>([]);
  const completedNode = ref<CompletedNode | undefined>();

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
          formal_args: [],
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

  const handleOpenTaskResults = async (nodeId: string) => {
    taskResultModalVisible.value = true;
    completedNode.value = completedNodes.value.find(
      (v) => v.base.node_id === nodeId
    );
  };

  const fetchWorkflowProcessDetail = async (processId: string) => {
    setLoading(true);
    try {
      const { data } = await getWorkflowProcessDetail({
        process_id: processId,
      });
      nodeConfigs.value = data.origin_nodes;
      edgeConfigs.value = data.origin_edges;
      completedNodes.value = data.completed_nodes;
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
        if (e.data.type !== 'bpmn:serviceTask') {
          return;
        }
        editNodeModalVisible.value = true;
        const selectNode = nodeConfigs.value.find((v) => v.id === e.data.id)!;
        nodeConfig.value = {
          ...selectNode,
        };
        completedNode.value = completedNodes.value.find(
          (v) => v.base.node_id === e.data.id
        );
      });

      lf.value?.on('edge:click', (e) => {
        const selectEdge = edgeConfigs.value.find((v) => v.id === e.data.id)!;

        if (
          lf.value?.getNodeDataById(e.data.sourceNodeId)?.type !==
          'bpmn:exclusiveGateway'
        ) {
          return;
        }

        edgeConfig.value = {
          ...selectEdge,
        };
        if (!edgeConfig.value.condition) {
          edgeConfig.value.condition = {
            rules: [
              {
                name: '',
                left_val: {
                  val: '',
                  val_type: 'exit_code',
                },
                op: '>',
                right_val: {
                  val: '',
                  val_type: 'custom',
                },
                compute_type: '',
              },
            ],
            expr: '',
            logical_op: 'and',
          };
        }

        editEdgeModalVisible.value = true;
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
