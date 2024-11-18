<template>
  <a-card class="general-card">
    <a-row>
      <a-col :flex="1">
        <a-form
          :model="formModel"
          :label-col-props="{ span: 6 }"
          :wrapper-col-props="{ span: 18 }"
          label-align="left"
          :auto-label-width="true"
          @submit="search"
        >
          <a-row :gutter="16">
            <a-col :span="16">
              <a-form-item field="name" :label="$t('instanceGroup.name')">
                <a-input
                  v-model="formModel.name"
                  :placeholder="$t('instanceGroup.name.placeholder')"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-col>
      <a-divider style="height: 35px" direction="vertical" />
      <a-col :flex="'86px'" style="text-align: right">
        <a-space direction="horizontal" :size="18">
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
      <a-col :span="12">
        <a-button
          type="primary"
          size="small"
          @click="handleCreateRoleInstanceModal($event, null)"
        >
          <template #icon>
            <icon-plus />
          </template>
          {{ $t('operations.create') }}
        </a-button>
      </a-col>
    </a-row>
    <a-table
      v-model:selectedKeys="selectedKeys"
      row-key="id"
      :loading="loading"
      :columns="columns"
      :data="instanceGroupList"
      :row-selection="rowSelection"
      :pagination="pagination"
      @page-change="onPageChange"
    >
      <template #index="{ rowIndex }">
        {{ rowIndex + 1 + (pagination.page - 1) * pagination.pageSize }}
      </template>

      <template #operations="{ record }">
        <a-space direction="horizontal">
          <a-space>
            <a-popconfirm
              :content="$t('operations.delete.confirm')"
              @before-ok="handleUnbindRoleInstanceGroup($event, record)"
            >
              <a-button v-permission="['admin']" size="mini" status="danger">
                {{ $t('operations.delete') }}
              </a-button>
            </a-popconfirm>
          </a-space>
        </a-space>
      </template>
    </a-table>
  </a-card>

  <a-modal
    v-model:visible="bindRoleInstanceGroupModalVisible"
    title-align="start"
    style="width: auto"
    :draggable="true"
    width="60%"
    hide-cancel
    :ok-text="$t('form.save')"
    @before-ok="handleSubmitCreateRoleInstanceGroupForm"
    @cancel="handleCreateRoleInstanceGroupModalCancel"
  >
    <template #title> {{ $t('role.bindInstanceGroup') }}</template>
    <table-select-instance-group-list
      v-if="bindRoleInstanceGroupModalVisible"
      v-model:instance-group-id="selectInstanceGroup"
      v-model:ignore-role-id="$props.modelValue"
    />
  </a-modal>
</template>

<script lang="ts" setup>
  import useLoading from '@/hooks/loading';
  import { Pagination } from '@/types/global';
  import { useI18n } from 'vue-i18n';
  import { ref, computed, reactive, watch } from 'vue';
  import {
    Message,
    TableColumnData,
    TableRowSelection,
  } from '@arco-design/web-vue';

  import {
    InstanceGroupRecord,
    queryInstanceGroupList,
    QueryInstanceGroupListReq,
  } from '@/api/instance';
  import { bindInstance, unbindInstance } from '@/api/role';

  import tableSelectInstanceGroupList from './table-select-instance-group-list.vue';

  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const generateFormModel = () => {
    return {
      name: '',
    };
  };
  const formModel = ref(generateFormModel());
  const bindRoleInstanceGroupModalVisible = ref(false);

  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };
  const pagination = reactive({
    ...basePagination,
  });

  const props = defineProps(['modelValue']);
  // const emit = defineEmits(['update:modelValue']);

  const selectedKeys = ref([]);

  const columns = computed<TableColumnData[]>(() => [
    {
      title: t('columns.index'),
      dataIndex: 'index',
      slotName: 'index',
    },
    {
      title: t('instanceGroup.name'),
      dataIndex: 'name',
    },

    {
      title: t('instanceGroup.info'),
      dataIndex: 'info',
    },
    {
      title: t('columns.updatedTime'),
      dataIndex: 'updated_time',
    },
    {
      title: t('columns.createdUser'),
      dataIndex: 'created_user',
    },

    {
      title: t('operations'),
      dataIndex: 'operations',
      slotName: 'operations',
    },
  ]);

  const rowSelection = reactive<TableRowSelection>({
    type: 'checkbox',
    showCheckedAll: true,
    onlyCurrent: false,
  });

  const instanceGroupList = ref<InstanceGroupRecord[]>([]);

  const fetchData = async (
    params: QueryInstanceGroupListReq = {
      page: pagination.page,
      page_size: pagination.pageSize,
      role_id: props.modelValue!,
      name: formModel.value.name,
    }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryInstanceGroupList(params);
      instanceGroupList.value = data.list;
      pagination.page = params.page;
      pagination.total = data.total;
    } catch (err) {
      // you can report use errorHandler or other
    } finally {
      // do something
      setLoading(false);
    }
  };

  const search = () => {
    fetchData({
      page: pagination.page,
      page_size: pagination.pageSize,
      role_id: props.modelValue,
      ...formModel.value,
    } as unknown as QueryInstanceGroupListReq);
  };

  const handleUnbindRoleInstanceGroup = async (e: any, record: any) => {
    try {
      await unbindInstance({
        role_id: props.modelValue,
        instance_group_ids: [record.id],
      });
    } catch (err) {
      return false;
    }

    Message.success(t('form.submit.success'));
    search();
    return true;
  };

  fetchData();

  const onPageChange = (current: number) => {
    fetchData({
      page_size: pagination.pageSize,
      role_id: props.modelValue,
      page: current,
      ...formModel.value,
    });
  };

  const reset = () => {
    formModel.value = generateFormModel();
  };

  const handleCreateRoleInstanceModal = (e: any, record: any) => {
    bindRoleInstanceGroupModalVisible.value = true;
  };

  const selectInstanceGroup = ref([]);

  const handleSubmitCreateRoleInstanceGroupForm = async () => {
    if (selectInstanceGroup.value.length === 0) {
      Message.error(t('role.bindInstance.validate.required'));
      return false;
    }
    try {
      await bindInstance({
        role_id: props.modelValue,
        instance_group_ids: selectInstanceGroup.value,
      });
    } catch (err) {
      return false;
    }

    Message.success(t('form.submit.success'));
    search();

    return true;
  };

  const handleCreateRoleInstanceGroupModalCancel = () => {
    bindRoleInstanceGroupModalVisible.value = false;
  };

  watch(
    () => selectedKeys.value,
    (val) => {
      // emit('update:modelValue', val);
    },
    { deep: true, immediate: true }
  );
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
</style>
