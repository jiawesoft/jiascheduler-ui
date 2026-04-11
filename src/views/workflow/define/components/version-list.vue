<template>
  <a-row>
    <a-col flex="auto">
      <a-form
        key="search-workflow-version"
        :model="formModel"
        :label-col-props="{ span: 6 }"
        :auto-label-width="true"
        :wrapper-col-props="{ span: 18 }"
        label-align="left"
        @submit="search"
      >
        <a-row :gutter="5">
          <a-col :span="20">
            <a-form-item field="version" :label="$t('workflow.version')">
              <a-input v-model="formModel.version" @press-enter="search" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-col>

    <a-col flex="auto" style="display: flex; justify-content: end">
      <a-space direction="horizontal">
        <a-button type="primary" @click="search">
          <template #icon>
            <icon-search />
          </template>
          {{ $t('form.search') }}
        </a-button>
        <a-button @click="reset">
          <template #icon>
            <icon-refresh />
          </template>
          {{ $t('form.reset') }}
        </a-button>
      </a-space>
    </a-col>
  </a-row>
  <a-divider style="margin-top: 0" />
  <a-row style="margin-bottom: 16px">
    <a-col :span="22" />
    <a-col
      :span="2"
      style="display: flex; align-items: center; justify-content: end"
    >
      <a-tooltip :content="$t('columns.actions.refresh')">
        <div class="action-icon" @click="refreshPage">
          <icon-refresh size="18" />
        </div>
      </a-tooltip>
      <a-dropdown @select="handleSelectDensity">
        <a-tooltip :content="$t('columns.actions.density')">
          <div class="action-icon"><icon-line-height size="18" /></div>
        </a-tooltip>
        <template #content>
          <a-doption
            v-for="item in densityList"
            :key="item.value"
            :value="item.value"
            :class="{ active: item.value === size }"
          >
            <span>{{ item.name }}</span>
          </a-doption>
        </template>
      </a-dropdown>
      <a-tooltip :content="$t('columns.actions.columnSetting')">
        <a-popover
          trigger="click"
          position="bl"
          @popup-visible-change="popupVisibleChange"
        >
          <div class="action-icon"><icon-settings size="18" /></div>
          <template #content>
            <div id="tableSetting">
              <div
                v-for="(item, index) in showColumns"
                :key="item.dataIndex"
                :dataIndex="item.dataIndex"
                class="setting"
              >
                <div style="margin-right: 4px; cursor: move">
                  <icon-drag-arrow />
                </div>
                <div>
                  <a-checkbox
                    v-model="item.checked"
                    @change="
                      handleChange($event, item as TableColumnData, index)
                    "
                  >
                  </a-checkbox>
                </div>
                <div class="title">
                  {{ item.title === '#' ? t('columns.sn') : item.title }}
                </div>
              </div>
            </div>
          </template>
        </a-popover>
      </a-tooltip>
    </a-col>
  </a-row>

  <a-table
    row-key="id"
    :loading="loading"
    :pagination="pagination"
    :columns="(cloneColumns as TableColumnData[])"
    :data="renderData"
    :size="size"
    :bordered="false"
    @page-change="onPageChange"
  >
    <template #index="{ rowIndex }">
      {{ rowIndex + 1 + (pagination.page - 1) * pagination.pageSize }}
    </template>

    <template #operations="{ record }">
      <a-space direction="horizontal">
        <a-space>
          <a-button
            size="mini"
            @click="
              router.push(
                'define/edit?id=' +
                  record.workflow_id +
                  '&version_id=' +
                  record.id
              )
            "
          >
            {{ $t('operations.view') }}
          </a-button>
        </a-space>
        <a-space>
          <a-button
            size="mini"
            status="normal"
            type="outline"
            @click="handleStartProcessModal($event, record)"
          >
            {{ $t('operations.start') }}
          </a-button>
        </a-space>
        <a-space>
          <a-popconfirm
            :content="$t('workflow.action.confirm.delete')"
            @before-ok="handleDeleteWorkflowVersion($event, record)"
          >
            <a-button type="dashed" size="mini" status="danger">
              {{ $t('operations.delete') }}
            </a-button>
          </a-popconfirm>
        </a-space>
      </a-space>
    </template>
  </a-table>

  <!-- start process modal -->
  <a-modal
    v-model:visible="startProcessModalVisible"
    title-align="start"
    :draggable="true"
    :ok-text="$t('job.dispatch')"
    width="60%"
    @before-ok="handleStartProcess"
    @cancel="handleCancel"
  >
    <template #title> {{ $t('workflow.startProcess') }}</template>
    <a-form
      ref="startProcessFormRef"
      :model="startProcessForm"
      layout="vertical"
      :auto-label-width="true"
    >
      <a-form-item
        field="process_name"
        validate-trigger="blur"
        :label="$t('workflow.name')"
        required
      >
        <a-input v-model="startProcessForm.process_name" />
      </a-form-item>

      <a-form-item
        v-if="
          startProcessForm.user_variables &&
          startProcessForm.user_variables.length > 0
        "
        field="user_variables"
        :label="$t('workflow.userVariables')"
        :tooltip="$t('workflow.userVariables.tips')"
      >
        <workflow-user-variables
          :key="startProcessForm.id"
          v-model:args="startProcessForm.user_variables"
        />
      </a-form-item>
      <a-collapse :bordered="false">
        <a-collapse-item
          v-if="startProcessForm.nodes"
          :header="$t('workflow.processArgs')"
          key="process_args"
          class="form-field-container"
        >
          <a-collapse
            :default-active-key="[startProcessForm.nodes.filter(
              (v: { node_type: string; }) => v.node_type === 'bpmn:serviceTask'
            )[0]?.id]"
          >
            <a-collapse-item
              v-for="(value, i) in startProcessForm.nodes.filter(
              (v: { node_type: string; }) => v.node_type === 'bpmn:serviceTask'
            )"
              :key="value.id"
              :header="`${value.name} - ${value.id}`"
            >
              <a-form-item
                v-if="
                  value.task_type === 'custom' &&
                  value.task.custom?.formal_args?.length
                "
                :field="`node[${i}].formal_args`"
                validate-trigger="blur"
                :label="$t('workflow.nodeConfig.task.args')"
              >
                <workflow-node-args
                  :args="value.task.custom.formal_args"
                  :tasks="startProcessForm.nodes.filter((v: { node_type: string; id:string}) => v.node_type === 'bpmn:serviceTask' && v.id !== value.id)"
                />
              </a-form-item>
              <a-form-item
                v-else-if="
                  value.task_type === 'standard' &&
                  value.task.standard?.formal_args?.length
                "
                :field="`node[${i}].formal_args`"
                validate-trigger="blur"
                :label="$t('workflow.nodeConfig.task.args')"
              >
                <workflow-node-args
                  :args="value.task.standard?.formal_args"
                  :tasks="startProcessForm.nodes.filter((v: { node_type: string; id:string}) => v.node_type === 'bpmn:serviceTask' && v.id !== value.id)"
                />
              </a-form-item>

              <a-form-item
                :field="`node[${i}].target`"
                :label="$t('job.endpoint')"
              >
                <a-space
                  v-if="value.task_type === 'custom'"
                  direction="vertical"
                >
                  <a-button
                    size="mini"
                    @click="
                      handleSelectNodeEndpoint(
                        $event,
                        value.task.custom?.target || [],
                        value.id
                      )
                    "
                  >
                    {{ $t('form.select') }}
                  </a-button>
                  <a-textarea
                    :key="value.task.custom?.target?.join('\n')"
                    :default-value="value.task.custom?.target?.join('\n')"
                    :placeholder="$t('job.endpoint.tips')"
                    style="width: 500px"
                    :auto-size="{ minRows: 2, maxRows: 5 }"
                    disabled
                  />
                </a-space>

                <a-space
                  v-else-if="value.task_type === 'standard'"
                  direction="vertical"
                >
                  <a-button
                    size="mini"
                    @click="
                      handleSelectNodeEndpoint(
                        $event,
                        value.task.standard?.target || [],
                        value.id
                      )
                    "
                  >
                    {{ $t('form.select') }}
                  </a-button>
                  <a-textarea
                    :key="value.task.standard?.target?.join('\n')"
                    :default-value="value.task.standard?.target?.join('\n')"
                    :placeholder="$t('job.endpoint.tips')"
                    style="width: 500px"
                    :auto-size="{
                      minRows: 2,
                      maxRows: 5,
                    }"
                    disabled
                  />
                </a-space>
              </a-form-item>
            </a-collapse-item>
          </a-collapse>
        </a-collapse-item>

        <a-collapse-item
          :header="$t('workflow.defaultExecutionEndpoint')"
          key="select-instance"
          class="form-field-container"
        >
          <a-form-item
            field="endpoints"
            validate-trigger="blur"
            :extra="$t('workflow.defaultExecutionEndpoint.tips')"
          >
            <SelectInstance
              v-if="startProcessModalVisible"
              v-model="startProcessForm.default_target"
            />
          </a-form-item>
        </a-collapse-item>
      </a-collapse>
    </a-form>
  </a-modal>

  <!-- start process modal -->
  <a-modal
    v-model:visible="selectNodeExecutionEndpointModalVisible"
    title-align="start"
    :draggable="true"
    :ok-text="$t('form.save')"
    width="61.8%"
    @before-ok="handleSaveNodeEndpoint"
    @cancel="handleCancelSaveNodeEndpointModal"
  >
    <template #title> {{ $t('job.endpoint.title') }}</template>
    <SelectInstance :key="currentEditNodeId" v-model="nodeTarget" />
  </a-modal>
</template>

<script lang="ts" setup>
  import useLoading from '@/hooks/loading';
  import { useAppStore } from '@/store';
  import { Pagination } from '@/types/global';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';

  import cloneDeep from 'lodash/cloneDeep';
  import Sortable from 'sortablejs';
  import { computed, nextTick, reactive, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';
  import { getFormatTimeVersion } from '@/utils/time';
  import { Endpoint } from '@/api/job';
  import {
    deleteWorkflowVersion,
    queryWorkflowVersionList,
    QueryWorkflowVersionListReq,
    startWorkflowProcess,
    WorkflowProcessArgs,
    WorkflowUserVariables as UserVariables,
    WorkflowVersionRecord,
    NodeConfig,
  } from '@/api/workflow';
  import SelectInstance from '@/views/respository/components/select-instance.vue';

  import WorkflowUserVariables from '@/components/workflow-user-variables/index.vue';
  import WorkflowNodeArgs from '@/components/workflow-node-args/index.vue';
  import { Message } from '@arco-design/web-vue';

  const props = defineProps<{
    workflowId: number;
    workflowName: string;
  }>();

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };
  const visible = ref(false);
  const startProcessModalVisible = ref(false);
  const startProcessForm = ref<{
    process_args: WorkflowProcessArgs;
    user_variables?: UserVariables[];
    nodes: NodeConfig[];
    default_target: Endpoint[];
    [key: string]: any;
  }>({
    workflow_id: 0,
    version_id: 0,
    process_name: '',
    nodes: [],
    default_target: [],
    process_args: {
      user_variables: [],
      default_target: [],
      nodes: [],
    },
  });

  const selectNodeExecutionEndpointModalVisible = ref(false);
  const nodeTarget = ref<Endpoint[]>([]);
  const currentEditNodeId = ref('');

  const theme = computed(() => {
    return useAppStore().theme;
  });

  const generateFormModel = () => {
    return {
      version: '',
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref<WorkflowVersionRecord[]>([]);
  const formModel = ref(generateFormModel());
  const startProcessFormRef = ref();
  const cloneColumns = ref<Column[]>([]);
  const showColumns = ref<Column[]>([]);
  const router = useRouter();

  const size = ref<SizeProps>('medium');

  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };

  const pagination = reactive({
    ...basePagination,
  });
  const densityList = computed(() => [
    {
      name: t('columns.size.mini'),
      value: 'mini',
    },
    {
      name: t('columns.size.small'),
      value: 'small',
    },
    {
      name: t('columns.size.medium'),
      value: 'medium',
    },
    {
      name: t('columns.size.large'),
      value: 'large',
    },
  ]);
  const columns = computed<TableColumnData[]>(() => [
    {
      title: t('columns.index'),
      dataIndex: 'index',
      width: 20,
      slotName: 'index',
      fixed: 'left',
    },

    {
      title: t('workflow.version'),
      dataIndex: 'version',
      ellipsis: true,
      width: 140,
      tooltip: true,
      fixed: 'left',
    },

    {
      title: t('workflow.versionInfo'),
      dataIndex: 'version_info',
      ellipsis: true,
      width: 140,
      tooltip: true,
    },

    {
      title: t('columns.createdTime'),
      dataIndex: 'created_time',
      ellipsis: true,
      width: 120,
      tooltip: true,
    },

    {
      title: t('columns.createdUser'),
      dataIndex: 'created_user',
      ellipsis: true,
      width: 60,
      tooltip: true,
    },
    {
      title: t('operations'),
      dataIndex: 'operations',
      slotName: 'operations',
      width: 140,
      fixed: 'right',
    },
  ]);

  const fetchData = async (
    params: QueryWorkflowVersionListReq = {
      page: 1,
      page_size: 20,
      workflow_id: props.workflowId,
    }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryWorkflowVersionList(params);
      renderData.value = data.list;
      pagination.page = params.page;
      pagination.total = data.total;
    } catch (err) {
      // you can report use errorHandler or other
    } finally {
      setLoading(false);
    }
  };

  const refreshPage = () => {
    fetchData();
  };

  const handleStartProcessModal = (e: any, record: any) => {
    if (record) {
      startProcessForm.value = {
        ...record,
        version_id: record.id,
        process_name: `${props.workflowName}-${getFormatTimeVersion()}`,
        process_args: {
          user_variables: {},
          default_target: [],
          nodes: [],
        },
      };
    }

    startProcessModalVisible.value = true;
  };

  const handleCancel = () => {
    visible.value = false;
  };

  const search = () => {
    fetchData({
      page: basePagination.page,
      page_size: basePagination.pageSize,
      ...formModel.value,
      workflow_id: props.workflowId,
    } as unknown as QueryWorkflowVersionListReq);
  };
  const onPageChange = (current: number) => {
    fetchData({
      page_size: pagination.pageSize,
      page: current,
      ...formModel.value,
      workflow_id: props.workflowId,
    } as unknown as QueryWorkflowVersionListReq);
  };

  fetchData();
  const reset = () => {
    formModel.value = generateFormModel();
  };

  const handleSelectDensity = (
    val: string | number | Record<string, any> | undefined,
    e: Event
  ) => {
    size.value = val as SizeProps;
  };

  const handleChange = (
    checked: boolean | (string | boolean | number)[],
    column: Column,
    index: number
  ) => {
    cloneColumns.value = showColumns.value.filter((item) => item.checked);
  };

  const handleDeleteWorkflowVersion = async (e: any, record: any) => {
    setLoading(true);
    try {
      await deleteWorkflowVersion({
        workflow_id: record.workflow_id,
        version_id: record.id,
      });
    } finally {
      setLoading(false);
    }

    search();
    return true;
  };

  const popupVisibleChange = (val: boolean) => {
    if (val) {
      nextTick(() => {
        const el = document.getElementById('tableSetting') as HTMLElement;
        const sortable = new Sortable(el, {
          onEnd(e: any) {
            const { oldIndex, newIndex } = e;
            if (oldIndex !== newIndex) {
              const newList = e.from.children;
              const newArrayList: string[] = [];
              Array.from(newList).forEach((element: any) => {
                const currentDataIndex: string =
                  element.getAttribute('dataIndex') || '';
                newArrayList.push(currentDataIndex);
              });
              const resultList: Column[] = newArrayList
                .map((v) => {
                  return showColumns.value.find((m) => m.dataIndex === v);
                })
                .filter((v) => v !== undefined);
              showColumns.value = resultList;
              cloneColumns.value = resultList.filter((v) => v?.checked);
            }
          },
        });
      });
    }
  };

  const handleSelectNodeEndpoint = async (
    e: any,
    record: string[],
    i: string
  ) => {
    selectNodeExecutionEndpointModalVisible.value = true;
    currentEditNodeId.value = i;
    nodeTarget.value = record.map((v) => {
      return { instance_id: v } as Endpoint;
    });
  };

  const handleSaveNodeEndpoint = async () => {
    const { nodes } = startProcessForm.value;

    nodes.forEach((v, i) => {
      if (v.id !== currentEditNodeId.value) {
        return;
      }
      if (v.task.custom) {
        nodes[i].task.custom!.target = nodeTarget.value.map(
          (v) => v.instance_id
        );
      } else if (v.task.standard) {
        nodes[i].task.standard!.target = nodeTarget.value.map(
          (v) => v.instance_id
        );
      }
    });

    startProcessForm.value = {
      ...startProcessForm.value,
      nodes,
    };
  };

  const handleCancelSaveNodeEndpointModal = () => {
    selectNodeExecutionEndpointModalVisible.value = false;
  };

  const handleStartProcess = async () => {
    const ret = await startProcessFormRef.value.validate();
    if (ret) {
      return false;
    }

    try {
      await startWorkflowProcess({
        workflow_id: startProcessForm.value.workflow_id,
        version_id: startProcessForm.value.version_id,
        process_name: startProcessForm.value.process_name,
        process_args: {
          user_variables: startProcessForm.value.user_variables,
          nodes: startProcessForm.value.nodes
            .filter((v) => v.node_type === 'bpmn:serviceTask')
            .map((v) => {
              if (v.task_type === 'standard') {
                return {
                  node_id: v.id,
                  target: v.task.standard?.target,
                  args: v.task.standard?.formal_args,
                };
              }
              return {
                node_id: v.id,
                target: v.task.custom?.target,
                args: v.task.custom?.formal_args,
              };
            }),
          default_target: startProcessForm.value.default_target.map((v) => {
            return v.instance_id;
          }),
        },
      });
    } catch (err) {
      return false;
    }
    Message.success(t('form.submit.success'));

    setTimeout(() => {
      router.push({
        path: '/workflow/process',
      });
    }, 200);

    return true;
  };

  watch(
    () => columns.value,
    (val) => {
      cloneColumns.value = cloneDeep(val);
      cloneColumns.value.forEach((item, index) => {
        item.checked = true;
      });
      showColumns.value = cloneDeep(cloneColumns.value);
    },
    { deep: true, immediate: true }
  );
</script>

<script lang="ts">
  export default {
    name: 'WorkflowVersionList',
  };
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 20px 20px;
  }
  :deep(.arco-table-th) {
    &:last-child {
      .arco-table-th-item-title {
        margin-left: 16px;
      }
    }
  }
  .form-field-container {
    /deep/.arco-collapse-item-content {
      padding-right: 10px;
      padding-left: 10px;
    }
  }

  .action-icon {
    margin-left: 12px;
    cursor: pointer;
  }
  .active {
    color: #0960bd;
    background-color: #e3f4fc;
  }
  .setting {
    display: flex;
    align-items: center;
    width: 200px;
    .title {
      margin-left: 12px;
      cursor: pointer;
    }
  }
</style>
