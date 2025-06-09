<template>
  <div class="container">
    <Breadcrumb :items="['menu.repository', 'menu.repository.jobList']" />
    <a-card class="general-card">
      <div class="workflow-container" ref="container"></div>
    </a-card>
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

      <template v-if="nodeConfig.task_type == 'standard'">
        <a-form-item
          field="eid"
          validate-trigger="blur"
          :label="$t('job')"
          v-if="nodeConfig.task_type == 'standard'"
        >
          <SelectJob v-model:eid="nodeConfig.eid" job-type="default" />
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
              @before-remove="removeUploadfile"
              @success="onUploadSuccess"
            />
          </a-space>
        </a-form-item>
      </template>
    </a-form>
  </a-drawer>

  <a-modal
    v-model:visible="workflowVersionModalVisible"
    title-align="start"
    style="width: auto"
    :draggable="true"
    :ok-text="$t('form.save')"
    unmount-on-close
    width="500px"
    @before-ok="handleSaveWorkflowVersion"
    @cancel="handleCancel"
  >
    <template #title> {{ $t('workflow.save_version') }}</template>
    <a-form
      ref="saveWorkflowVersionRef"
      :key="workflowVersionForm.id"
      :rules="workflowVersionFormValidateRules"
      :model="workflowVersionForm"
      :auto-label-width="true"
    >
      <a-form-item
        field="version"
        required
        validate-trigger="blur"
        :label="$t('workflow.version')"
      >
        <a-input v-model="workflowVersionForm.version" />
      </a-form-item>
      <a-form-item
        field="name"
        required
        validate-trigger="blur"
        :label="$t('workflow.version_name')"
      >
        <a-input v-model="workflowVersionForm.name" />
      </a-form-item>
      <a-form-item field="info" :label="$t('workflow.info')">
        <a-textarea v-model="workflowVersionForm.info" />
      </a-form-item>
    </a-form>
  </a-modal>
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
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';

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
  import { saveWorkflowVersion } from '@/api/workflow';
  import SelectJob from '../components/select-job.vue';
  import SelectExecutor from '../components/select-executor.vue';

  const { t } = useI18n();
  const route = useRoute();

  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };

  const saveWorkflowVersionRef = ref();
  const minimapVisible = ref(false);
  const gridVisible = ref(false);
  const editNodeModalVisible = ref(false);
  const workflowVersionModalVisible = ref(false);
  const saveNodeConfigRef = ref();
  const lf = ref<LogicFlow>();
  const uploadFileList = ref<FileItem[]>([]);
  const workflowVersionForm = ref({
    id: Number(route.query.id) || 0,
    version: '',
    name: '',
    info: '',
    nodes: [],
    edges: [],
  });

  const workflowVersionFormValidateRules = {
    version: { required: true },
    name: {
      required: true,
    },
  };

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

  interface NodeConfig {
    id: string;
    name: string;
    node_type: string;
    task_type: string;
    task: {
      custom?: {
        work_dir: string;
        work_user: string;
        timeout: number;
        upload_file: string;
        code: string;
        executor_id: number;
      };
      standard?: {
        eid: string;
      };
    };

    eid?: string;
    data: {
      [key: string]: any;
    };
  }

  interface EdgeConfig {
    id: string;
    name: string;
    condition: string;
    source_node_id: string;
    target_node_id: string;
    data: {
      [key: string]: any;
    };
  }

  interface GraphConfig {
    nodes: NodeConfig[];
    edges: EdgeConfig[];
  }

  const nodeConfig = ref<NodeConfig>({
    id: '',
    name: '',
    node_type: '',
    task_type: '',
    task: {},
    data: {},
  });
  const nodeConfigs = ref<NodeConfig[]>([]);
  const edgeConfigs = ref<EdgeConfig[]>([]);

  const colorfulTheme = {
    baseNode: {
      fill: '#fefaec',
      stroke: '#625772',
      strokeWidth: 2,
    },
    baseEdge: {
      stroke: '#625772',
      strokeWidth: 2,
    },
    rect: {
      fill: '#fefaec',
      stroke: '#f38181',
      strokeWidth: 2,
    },
    circle: {
      fill: '#fefaec',
      stroke: '#a9eee6',
      properties: {
        r: 20,
      },
      strokeWidth: 2,
    },
    diamond: {
      fill: '#fefaec',
      stroke: '#fce38a',
      strokeWidth: 2,
    },
    ellipse: {
      fill: '#eaffd0',
      stroke: '#95e1d3',
      strokeWidth: 2,
    },
    polygon: {
      fill: '#fce38a',
      stroke: '#f38181',
      strokeWidth: 2,
    },
    line: {
      stroke: '#2d4059',
      strokeWidth: 2,
    },
    polyline: {
      stroke: '#ff7e67',
      strokeWidth: 2,
    },
    bezier: {
      stroke: '#c86b85',
      strokeWidth: 2,
      // strokeDasharray: '10,10',
    },
    anchorLine: {
      stroke: '#ffc93c',
      strokeWidth: 2,
      // strokeDasharray: '15,15',
    },
    text: {
      color: '#ff6f3c',
      fontSize: 14,
    },
    nodeText: {
      color: '#7e6bc4',
      fontSize: 14,
      fontWeight: 800,
    },
    edgeText: {
      color: '#ffaa64',
      fontSize: 14,
    },
    inputText: {
      color: '#ffaa64',
      background: 'transparent',
      fontSize: 14,
    },
    anchor: {
      fill: '#ffaa64',
      stroke: '#fff5a5',
    },
    arrow: {
      stroke: '#f8b595',
      strokeWidth: 1,
    },
    snapline: {
      stroke: '#f67280',
      strokeWidth: 1,
    },
    rotateControl: {
      fill: '#f8b595',
      stroke: '#6c5b7c',
    },
    resizeControl: {
      fill: '#a4e5d9',
      stroke: '#649dad',
    },
    resizeOutline: {
      stroke: '#a4e5d9',
    },
    edgeAdjust: {
      fill: '#fb929e',
      stroke: '#fff6f6',
    },
    outline: {
      hover: {
        stroke: '#7098da',
      },
      stroke: '#a393eb',
      strokeWidth: 2,
    },
    edgeAnimation: {},
  };

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

  const onUploadSuccess = (response: FileItem) => {
    if (response.response.code === 20000) {
      if (nodeConfig.value.task.custom) {
        nodeConfig.value.task.custom.upload_file =
          response.response.data.result;
      }
      uploadFileList.value = [response];
      Message.success(t('form.submit.success'));
      return;
    }
    uploadFileList.value = [];
    Message.error(response.response.msg);
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

  const removeUploadfile = async (file: FileItem) => {
    nodeConfig.value.task.custom!.upload_file = '';
    return true;
  };

  const handleSaveWorkflowVersion = async () => {
    const ret = await saveWorkflowVersionRef.value.validate();
    if (ret) {
      return false;
    }
    try {
      const data = {
        ...workflowVersionForm.value,
      };
      await saveWorkflowVersion({
        ...data,
        status: 'draft',
      });
    } catch (err) {
      return false;
    }

    Message.success(t('form.submit.success'));
    return true;
  };

  const handleCancel = () => {
    workflowVersionModalVisible.value = false;
  };

  onMounted(() => {
    lf.value = new LogicFlow({
      isSilentMode: false,
      stopScrollGraph: true,
      stopZoomGraph: true,
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
      // idGenerator(type) {
      //   return `${type}_${Math.random()}`;
      // },
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

    lf.value?.setTheme(colorfulTheme as any);

    (lf.value?.extension.menu as any).addMenuConfig({
      nodeMenu: [
        {
          text: '分享',
          callback() {
            alert('分享成功！');
          },
        },
        {
          text: '属性',
          callback(node: any) {
            alert(`
                节点id：${node.id}
                节点类型：${node.type}
                节点坐标：(x: ${node.x}, y: ${node.y})
              `);
          },
        },
      ],
      edgeMenu: [
        {
          text: '属性',
          callback(edge: any) {
            const {
              id,
              type,
              startPoint,
              endPoint,
              sourceNodeId,
              targetNodeId,
            } = edge;
            alert(`
                边id：${id}
                边类型：${type}
                边起点坐标：(startPoint: [${startPoint.x}, ${startPoint.y}])
                边终点坐标：(endPoint: [${endPoint.x}, ${endPoint.y}])
                源节点id：${sourceNodeId}
                目标节点id：${targetNodeId}
              `);
          },
        },
      ],
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
    (lf.value?.extension.control as Control).addItem({
      key: 'save-workflow',
      iconClass: 'save-workflow',
      title: '',
      text: '保存',
      onClick: (lf, ev) => {
        const data = lf.getGraphData();
        workflowVersionForm.value.nodes = (data as any).nodes;
        workflowVersionForm.value.edges = (data as any).edges;
        workflowVersionModalVisible.value = true;
      },
    });

    (lf.value?.extension.control as Control).addItem({
      key: 'release',
      iconClass: 'release-workflow',
      title: '',
      text: '发布',
      onClick: (lf, ev) => {
        console.log(lf.getGraphRawData());
        alert(lf.getGraphData());
      },
    });

    lf.value?.setPatternItems([
      {
        label: '选区',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAAOVJREFUOBGtVMENwzAIjKP++2026ETdpv10iy7WFbqFyyW6GBywLCv5gI+Dw2Bluj1znuSjhb99Gkn6QILDY2imo60p8nsnc9bEo3+QJ+AKHfMdZHnl78wyTnyHZD53Zzx73MRSgYvnqgCUHj6gwdck7Zsp1VOrz0Uz8NbKunzAW+Gu4fYW28bUYutYlzSa7B84Fh7d1kjLwhcSdYAYrdkMQVpsBr5XgDGuXwQfQr0y9zwLda+DUYXLaGKdd2ZTtvbolaO87pdo24hP7ov16N0zArH1ur3iwJpXxm+v7oAJNR4JEP8DoAuSFEkYH7cAAAAASUVORK5CYII=',
        callback: () => {
          lf.value?.openSelectionSelect();
          lf.value?.once('selection:selected', () => {
            lf.value?.closeSelectionSelect();
          });
        },
      },
      {
        type: 'bpmn:startEvent',
        label: '开始',
        text: '开始',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAAnBJREFUOBGdVL1rU1EcPfdGBddmaZLiEhdx1MHZQXApraCzQ7GKLgoRBxMfcRELuihWKcXFRcEWF8HBf0DdDCKYRZpnl7p0svLe9Zzbd29eQhTbC8nv+9zf130AT63jvooOGS8Vf9Nt5zxba7sXQwODfkWpkbjTQfCGUd9gIp3uuPP8bZ946g56dYQvnBg+b1HB8VIQmMFrazKcKSvFW2dQTxJnJdQ77urmXWOMBCmXM2Rke4S7UAW+/8ywwFoewmBps2tu7mbTdp8VMOkIRAkKfrVawalJTtIliclFbaOBqa0M2xImHeVIfd/nKAfVq/LGnPss5Kh00VEdSzfwnBXPUpmykNss4lUI9C1ga+8PNrBD5YeqRY2Zz8PhjooIbfJXjowvQJBqkmEkVnktWhwu2SM7SMx7Cj0N9IC0oQXRo8xwAGzQms+xrB/nNSUWVveI48ayrFGyC2+E2C+aWrZHXvOuz+CiV6iycWe1Rd1Q6+QUG07nb5SbPrL4426d+9E1axKjY3AoRrlEeSQo2Eu0T6BWAAr6COhTcWjRaYfKG5csnvytvUr/WY4rrPMB53Uo7jZRjXaG6/CFfNMaXEu75nG47X+oepU7PKJvvzGDY1YLSKHJrK7vFUwXKkaxwhCW3u+sDFMVrIju54RYYbFKpALZAo7sB6wcKyyrd+aBMryMT2gPyD6GsQoRFkGHr14TthZni9ck0z+Pnmee460mHXbRAypKNy3nuMdrWgVKj8YVV8E7PSzp1BZ9SJnJAsXdryw/h5ctboUVi4AFiCd+lQaYMw5z3LGTBKjLQOeUF35k89f58Vv/tGh+l+PE/wG0rgfIUbZK5AAAAABJRU5ErkJggg==',
      },
      // {
      //   type: 'bpmn:userTask',
      //   label: '用户任务',
      //   text: '用户任务',
      //   icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAEFVwZaAAAABGdBTUEAALGPC/xhBQAAAqlJREFUOBF9VM9rE0EUfrMJNUKLihGbpLGtaCOIR8VjQMGDePCgCCIiCNqzCAp2MyYUCXhUtF5E0D+g1t48qAd7CCLqQUQKEWkStcEfVGlLdp/fm3aW2QQdyLzf33zz5m2IsAZ9XhDpyaaIZkTS4ASzK41TFao88GuJ3hsr2pAbipHxuSYyKRugagICGANkfFnNh3HeE2N0b3nN2cgnpcictw5veJIzxmDamSlxxQZicq/mflxhbaH8BLRbuRwNtZp0JAhoplVRUdzmCe/vO27wFuuA3S5qXruGdboy5/PRGFsbFGKo/haRtQHIrM83bVeTrOgNhZReWaYGnE4aUQgTJNvijJFF4jQ8BxJE5xfKatZWmZcTQ+BVgh7s8SgPlCkcec4mGTmieTP4xd7PcpIEg1TX6gdeLW8rTVMVLVvb7ctXoH0Cydl2QOPJBG21STE5OsnbweVYzAnD3A7PVILuY0yiiyDwSm2g441r6rMSgp6iK42yqroI2QoXeJVeA+YeZSa47gZdXaZWQKTrG93rukk/l2Al6Kzh5AZEl7dDQy+JjgFahQjRopSxPbrbvK7GRe9ePWBo1wcU7sYrFZtavXALwGw/7Dnc50urrHJuTPSoO2IMV3gUQGNg87IbSOIY9BpiT9HV7FCZ94nPXb3MSnwHn/FFFE1vG6DTby+r31KAkUktB3Qf6ikUPWxW1BkXSPQeMHHiW0+HAd2GelJsZz1OJegCxqzl+CLVHa/IibuHeJ1HAKzhuDR+ymNaRFM+4jU6UWKXorRmbyqkq/D76FffevwdCp+jN3UAN/C9JRVTDuOxC/oh+EdMnqIOrlYteKSfadVRGLJFJPSB/ti/6K8f0CNymg/iH2gO/f0DwE0yjAFO6l8JaR5j0VPwPwfaYHqOqrCI319WzwhwzNW/aQAAAABJRU5ErkJggg==',
      // },
      {
        type: 'bpmn:serviceTask',
        label: '系统任务',
        text: '任务',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAEFVwZaAAAABGdBTUEAALGPC/xhBQAAAqlJREFUOBF9VM9rE0EUfrMJNUKLihGbpLGtaCOIR8VjQMGDePCgCCIiCNqzCAp2MyYUCXhUtF5E0D+g1t48qAd7CCLqQUQKEWkStcEfVGlLdp/fm3aW2QQdyLzf33zz5m2IsAZ9XhDpyaaIZkTS4ASzK41TFao88GuJ3hsr2pAbipHxuSYyKRugagICGANkfFnNh3HeE2N0b3nN2cgnpcictw5veJIzxmDamSlxxQZicq/mflxhbaH8BLRbuRwNtZp0JAhoplVRUdzmCe/vO27wFuuA3S5qXruGdboy5/PRGFsbFGKo/haRtQHIrM83bVeTrOgNhZReWaYGnE4aUQgTJNvijJFF4jQ8BxJE5xfKatZWmZcTQ+BVgh7s8SgPlCkcec4mGTmieTP4xd7PcpIEg1TX6gdeLW8rTVMVLVvb7ctXoH0Cydl2QOPJBG21STE5OsnbweVYzAnD3A7PVILuY0yiiyDwSm2g441r6rMSgp6iK42yqroI2QoXeJVeA+YeZSa47gZdXaZWQKTrG93rukk/l2Al6Kzh5AZEl7dDQy+JjgFahQjRopSxPbrbvK7GRe9ePWBo1wcU7sYrFZtavXALwGw/7Dnc50urrHJuTPSoO2IMV3gUQGNg87IbSOIY9BpiT9HV7FCZ94nPXb3MSnwHn/FFFE1vG6DTby+r31KAkUktB3Qf6ikUPWxW1BkXSPQeMHHiW0+HAd2GelJsZz1OJegCxqzl+CLVHa/IibuHeJ1HAKzhuDR+ymNaRFM+4jU6UWKXorRmbyqkq/D76FffevwdCp+jN3UAN/C9JRVTDuOxC/oh+EdMnqIOrlYteKSfadVRGLJFJPSB/ti/6K8f0CNymg/iH2gO/f0DwE0yjAFO6l8JaR5j0VPwPwfaYHqOqrCI319WzwhwzNW/aQAAAABJRU5ErkJggg==',
      },
      {
        type: 'bpmn:exclusiveGateway',
        label: '条件',
        text: '条件判断',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAAHeEJUAAAAABGdBTUEAALGPC/xhBQAAAvVJREFUOBGNVEFrE0EU/mY3bQoiFlOkaUJrQUQoWMGePLX24EH0IIoHKQiCV0G8iE1covgLiqA/QTzVm1JPogc9tIJYFaQtlhQxqYjSpunu+L7JvmUTU3AgmTfvffPNN++9WSA1DO182f6xwILzD5btfAoQmwL5KJEwiQyVbSVZ0IgRyV6PTpIJ81E5ZvqfHQR0HUOBHW4L5Et2kQ6Zf7iAOhTFAA8s0pEP7AXO1uAA52SbqGk6h/6J45LaLhO64ByfcUzM39V7ZiAdS2yCePPEIQYvTUHqM/n7dgQNfBKWPjpF4ISk8q3J4nB11qw6X8l+FsF3EhlkEMfrjIer3wJTLwS2aCNcj4DbGxXTw00JmAuO+Ni6bBxVUCvS5d9aa04+so4pHW5jLTywuXAL7jJ+D06sl82Sgl2JuVBQn498zkc2bGKxULHjCnSMadBKYDYYHAtsby1EQ5lNGrQd4Y3v4Zo0XdGEmDno46yCM9Tk+RiJmUYHS/aXHPNTcjxcbTFna000PFJHIVZ5lFRqRpJWk9/+QtlOUYJj9HG5pVFEU7zqIYDVsw2s+AJaD8wTd2umgSCCyUxgGsS1Y6TBwXQQTFuZaHcd8gAGioE90hlsY+wMcs30RduYtxanjMGal8H5dMW67dmT1JFtYUEe8LiQLRsPZ6IIc7A4J5tqco3T0pnv/4u0kyzrYUq7gASuEyI8VXKvB9Odytv6jS/PNaZBln0nioJG/AVQRZvApOdhjj3Jt8QC8Im09SafwdBdvIpztpxWxpeKCC+EsFdS8DCyuCn2munFpL7ctHKp+Xc5cMybeIyMAN33SPL3ZR9QV1XVwLyzHm6Iv0/yeUuUb7PPlZC4D4HZkeu6dpF4v9j9MreGtMbxMMRLIcjJic9yHi7WQ3yVKzZVWUr5UrViJvn1FfUlwe/KYVfYyWRLSGNu16hR01U9IacajXPei0wx/5BqgInvJN+MMNtNme7ReU9SBbgntovn0kKHpFg7UogZvaZiOue/q1SBo9ktHzQAAAAASUVORK5CYII=',
      },
      {
        type: 'bpmn:endEvent',
        label: '结束',
        text: '结束',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAA1BJREFUOBFtVE1IVUEYPXOf+tq40Y3vPcmFIdSjIorWoRG0ERWUgnb5FwVhYQSl72oUoZAboxKNFtWiwKRN0M+jpfSzqJAQclHo001tKkjl3emc8V69igP3znzfnO/M9zcDcKT67azmjYWTwl9Vn7Vumeqzj1DVb6cleQY4oAVnIOPb+mKAGxQmKI5CWNJ2aLPatxWa3aB9K7/fB+/Z0jUF6TmMlFLQqrkECWQzOZxYGjTlOl8eeKaIY5yHnFn486xBustDjWT6dG7pmjHOJd+33t0iitTPkK6tEvjxq4h2MozQ6WFSX/LkDUGfFwfhEZj1Auz/U4pyAi5Sznd7uKzznXeVHlI/Aywmk6j7fsUsEuCGADrWARXXwjxWQsUbIupDHJI7kF5dRktg0eN81IbiZXiTESic50iwS+t1oJgL83jAiBupLDCQqwziaWSoAFSeIR3P5Xv5az00wyIn35QRYTwdSYbz8pH8fxUUAtxnFvYmEmgI0wYXUXcCCSpeEVpXlsRhBnCEATxWylL9+EKCAYhe1NGstUa6356kS9NVvt3DU2fd+Wtbm/+lSbylJqsqkSm9CRhvoJVlvKPvF1RKY/FcPn5j4UfIMLn8D4UYb54BNsilTDXKnF4CfTobA0FpoW/LSp306wkXM+XaOJhZaFkcNM82ASNAWMrhrUbRfmyeI1FvRBTpN06WKxa9BK0o2E4Pd3zfBBEwPsv9sQBnmLVbLEIZ/Xe9LYwJu/Er17W6HYVBc7vmuk0xUQ+pqxdom5Fnp55SiytXLPYoMXNM4u4SNSCFWnrVIzKG3EGyMXo6n/BQOe+bX3FClY4PwydVhthOZ9NnS+ntiLh0fxtlUJHAuGaFoVmttpVMeum0p3WEXbcll94l1wM/gZ0Ccczop77VvN2I7TlsZCsuXf1WHvWEhjO8DPtyOVg2/mvK9QqboEth+7pD6NUQC1HN/TwvydGBARi9MZSzLE4b8Ru3XhX2PBxf8E1er2A6516o0w4sIA+lwURhAON82Kwe2iDAC1Watq4XHaGQ7skLcFOtI5lDxuM2gZe6WFIotPAhbaeYlU4to5cuarF1QrcZ/lwrLaCJl66JBocYZnrNlvm2+MBCTmUymPrYZVbjdlr/BxlMjmNmNI3SAAAAAElFTkSuQmCC',
      },
    ]);

    lf.value.adapterOut = (data) => {
      console.log('adapterOut', data);
      const convertData: GraphConfig = {
        nodes: data.nodes.map((data1) => {
          const v = nodeConfigs.value.find((data2) => data1.id === data2.id);
          return v!;
        }),
        edges: data.edges.map((data1) => {
          const v = edgeConfigs.value.find((data2) => data1.id === data2.id);
          return v!;
        }),
      };
      return convertData;
    };

    lf.value.adapterIn = (data) => {
      console.log('adapterIn', data);
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

    lf.value?.on('node:dnd-add', (e) => {
      console.log('node:dnd-add', e.data);
      nodeConfigs.value.push({
        id: e.data.id,
        name: e.data.text?.value || '',
        node_type: e.data.type,
        task_type: 'standard',
        task: {},
        data: e.data,
      });
    });

    lf.value?.on('node:delete', (e) => {
      console.log('node:delete', e.data);
      nodeConfigs.value = nodeConfigs.value.filter((data) => {
        return data.id !== e.data.id;
      });
    });

    lf.value?.on('edge:click', (e) => {
      console.log('edge:click', e.data);
      // editNodeModalVisible.value = true;
    });

    lf.value?.on('edge:add', (e) => {
      console.log('edge:add', e.data);
      edgeConfigs.value.push({
        id: e.data.id,
        name: e.data.text?.value || '',
        source_node_id: e.data.sourceNodeId,
        target_node_id: e.data.targetNodeId,
        condition: '',
        data: e.data,
      });
    });

    lf.value?.on('edge:delete', (e) => {
      console.log('edge:delete', e.data);
      edgeConfigs.value = edgeConfigs.value.filter((data) => {
        return data.id !== e.data.id;
      });
    });

    lf.value?.render({});
  });
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 20px 20px;
  }
  .workflow-container {
    width: 100%;
    height: 680px;
  }
</style>
