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
              <a-form-item field="keyword" :label="$t('user.keyword')">
                <a-input
                  v-model="formModel.keyword"
                  :placeholder="$t('user.keyword.placeholder')"
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
          @click="handleCreateRoleUserModal($event, null)"
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
      row-key="user_id"
      :loading="loading"
      :columns="columns"
      :data="userList"
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
              @before-ok="handleDeleteRoleUserModal($event, record)"
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
    v-model:visible="bindRoleUserModalVisible"
    title-align="start"
    style="width: auto"
    :draggable="true"
    width="60%"
    hide-cancel
    :ok-text="$t('form.save')"
    @before-ok="handleSubmitCreateRoleUserForm"
    @cancel="handleCreateRoleRoleUserModalCancel"
  >
    <template #title> {{ $t('role.bindUser') }}</template>
    <table-select-user-list
      v-if="bindRoleUserModalVisible"
      v-model:user-id="selectUser"
      v-model:ignore-role-id="$props.roleId"
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

  import { queryUserList, QueryUserListReq, UserInfo } from '@/api/user';
  import { setUser } from '@/api/role';
  import tableSelectUserList from './table-select-user-list.vue';

  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();

  const bindRoleUserModalVisible = ref(false);
  const generateFormModel = () => {
    return {
      keyword: '',
    };
  };
  const formModel = ref(generateFormModel());

  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };
  const pagination = reactive({
    ...basePagination,
  });

  const selectUser = ref([]);

  const props = defineProps({
    roleId: {
      type: Number,
      default: 0,
    },
    filterZeroRoleId: {
      type: Boolean,
      default: true,
    },
  });
  // const emit = defineEmits(['update:modelValue']);

  const selectedKeys = ref([]);

  const columns = computed<TableColumnData[]>(() => [
    {
      title: t('columns.index'),
      dataIndex: 'index',
      slotName: 'index',
    },
    {
      title: t('user.username'),
      dataIndex: 'username',
    },

    {
      title: t('user.nickname'),
      dataIndex: 'nickname',
    },
    {
      title: t('user.gender'),
      dataIndex: 'gender',
      slotName: 'gender',
    },
    {
      title: t('user.email'),
      dataIndex: 'email',
    },
    {
      title: t('user.phone'),
      dataIndex: 'phone',
    },
    {
      title: t('user.role'),
      dataIndex: 'role',
    },
    {
      title: t('columns.updatedTime'),
      dataIndex: 'updated_time',
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

  const userList = ref<UserInfo[]>([]);

  const fetchData = async (
    params: QueryUserListReq = {
      page: pagination.page,
      page_size: pagination.pageSize,
      role_id: props.roleId,
      ...formModel.value,
    }
  ) => {
    if (params.role_id === 0 && !props.filterZeroRoleId) {
      return;
    }
    setLoading(true);
    try {
      const { data } = await queryUserList(params);
      userList.value = data.list;
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
      role_id: props.roleId,
      ...formModel.value,
    } as unknown as QueryUserListReq);
  };

  const handleDeleteRoleUserModal = async (e: any, record: any) => {
    try {
      await setUser({
        role_id: 0,
        user_ids: [record.user_id],
      });
    } catch (err) {
      return false;
    }
    Message.success(t('form.submit.success'));
    search();
    return true;
  };

  const onPageChange = (current: number) => {
    fetchData({
      page_size: pagination.pageSize,
      role_id: props.roleId,
      page: current,
      ...formModel.value,
    });
  };

  search();

  const reset = () => {
    formModel.value = generateFormModel();
  };

  const handleSubmitCreateRoleUserForm = async () => {
    if (selectUser.value.length === 0) {
      Message.error(t('role.bindUser.validate.required'));
      return false;
    }
    try {
      await setUser({
        role_id: props.roleId,
        user_ids: selectUser.value,
      });
    } catch (err) {
      return false;
    }
    Message.success(t('form.submit.success'));
    search();
    return true;
  };

  const handleCreateRoleUserModal = (e: any, record: any) => {
    bindRoleUserModalVisible.value = true;
  };

  const handleCreateRoleRoleUserModalCancel = () => {
    bindRoleUserModalVisible.value = false;
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
