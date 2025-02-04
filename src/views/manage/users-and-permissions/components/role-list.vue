<template>
  <a-row>
    <a-col flex="auto">
      <a-form
        :model="formModel"
        :label-col-props="{ span: 6 }"
        :wrapper-col-props="{ span: 18 }"
        label-align="left"
        :auto-label-width="true"
        @submit="search"
      >
        <a-row :gutter="10">
          <a-col :span="10">
            <a-form-item field="name" :label="$t('role.name')">
              <a-input
                v-model="formModel.name"
                :placeholder="$t('role.name.placeholder')"
              />
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
    <a-col :span="12">
      <a-button
        type="primary"
        size="small"
        @click="handleSaveRoleFormModalVisible($event, null)"
      >
        <template #icon>
          <icon-plus />
        </template>
        {{ $t('operations.create') }}
      </a-button>
    </a-col>
    <a-col
      :span="12"
      style="display: flex; align-items: center; justify-content: end"
    >
      <a-tooltip :content="$t('columns.actions.refresh')">
        <div class="action-icon" @click="search"
          ><icon-refresh size="18"
        /></div>
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
                  {{ item.title === '#' ? '序列号' : item.title }}
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
    :bordered="false"
    :size="size"
    @page-change="onPageChange"
  >
    <template #index="{ rowIndex }">
      {{ rowIndex + 1 + (pagination.page - 1) * pagination.pageSize }}
    </template>

    <template #gender="{ record }">
      <a-tag v-if="record.gender === 'male'" color="blue">{{
        $t('user.gender.male')
      }}</a-tag>
      <a-tag v-else color="red"> {{ $t('user.gender.female') }}</a-tag>
    </template>

    <template #operations="{ record }">
      <a-button
        v-permission="['admin']"
        size="mini"
        @click="handleSaveRoleFormModalVisible($event, record)"
      >
        {{ $t('operations.set') }}
      </a-button>
    </template>
  </a-table>

  <a-modal
    v-model:visible="saveRoleModalVisible"
    title-align="start"
    :draggable="true"
    width="auto"
    hide-cancel
    @before-ok="handleSubmitSaveRoleForm"
    @cancel="handleSaveRoleFormModalCancel"
  >
    <template #title> {{ $t('role.setRole') }}</template>
    <a-form ref="saveRoleFormRef" :model="form" :auto-label-width="true">
      <a-form-item
        field="name"
        :disabled="form.id !== 0"
        :label="$t('role.name')"
        :rules="[
          {
            required: true,
          },
        ]"
      >
        <a-input
          :placeholder="$t('role.name.placeholder')"
          v-model="form.name"
        />
      </a-form-item>
      <a-form-item
        field="info"
        :label="$t('role.info')"
        :rules="[
          {
            // required: true,
          },
        ]"
      >
        <a-textarea v-model="form.info" />
      </a-form-item>
      <a-form-item field="permissions" :label="$t('role.permission')">
        <a-checkbox-group v-model="form.permissions">
          <a-checkbox
            v-for="item in allPermission"
            :key="item.key"
            :value="item.key"
            >{{ item.name }}</a-checkbox
          >
        </a-checkbox-group>
      </a-form-item>

      <a-form-item
        v-if="form.id !== 0"
        field="user_id"
        :label="$t('role.bind')"
      >
        <role-permissions v-model="form.id" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
  import useLoading from '@/hooks/loading';
  import { computed, nextTick, reactive, ref, toRefs, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { PermissionRecord, queryAllPermission } from '@/api/admin';
  import { QueryInstanceListReq } from '@/api/instance';
  import {
    QueryRoleListReq,
    RoleRecord,
    queryRoleList,
    saveRole,
  } from '@/api/role';
  import { Pagination } from '@/types/global';
  import { Message } from '@arco-design/web-vue';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import cloneDeep from 'lodash/cloneDeep';
  import Sortable from 'sortablejs';
  import rolePermissions from '../../components/role-permissions.vue';

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };
  const saveRoleModalVisible = ref(false);
  const saveRoleFormRef = ref();
  const allPermission = ref<PermissionRecord[]>();

  const defaultForm = {
    id: 0,
    name: '',
    info: '',
    permissions: [],
    user_ids: [],
  };
  const state = reactive({
    form: {
      ...defaultForm,
    },
  });
  const { form } = toRefs(state);

  const generateFormModel = () => {
    return {
      name: '',
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref<RoleRecord[]>([]);
  const formModel = ref(generateFormModel());
  const cloneColumns = ref<Column[]>([]);
  const showColumns = ref<Column[]>([]);

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
      slotName: 'index',
    },
    {
      title: t('role.name'),
      dataIndex: 'name',
    },

    {
      title: t('role.userTotal'),
      dataIndex: 'user_total',
    },

    {
      title: t('role.info'),
      dataIndex: 'info',
    },

    {
      title: t('columns.createdTime'),
      dataIndex: 'created_time',
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

  const fetchData = async (
    params: QueryRoleListReq = { page: 1, page_size: 20 }
  ) => {
    setLoading(true);

    try {
      const { data } = await queryRoleList(params);

      renderData.value = data.list;
      pagination.page = params.page;
      pagination.total = data.total;
    } catch (err) {
      // you can report use errorHandler or other
      Message.error(`${err}`);
    } finally {
      setLoading(false);
    }
  };

  const getAllPermissions = async () => {
    setLoading(true);
    try {
      const { data } = await queryAllPermission();
      allPermission.value = data.list;
    } catch (err) {
      Message.error(`${err}`);
    } finally {
      setLoading(false);
    }
  };

  const search = () => {
    fetchData({
      ...basePagination,
      ...formModel.value,
    } as unknown as QueryInstanceListReq);
  };

  const handleSaveRoleFormModalVisible = async (e: any, record: any) => {
    saveRoleFormRef.value.clearValidate();
    await getAllPermissions();

    if (record) {
      form.value = { ...record };
    } else {
      form.value = { ...defaultForm };
    }

    saveRoleModalVisible.value = true;
  };

  const handleSaveRoleFormModalCancel = () => {
    saveRoleModalVisible.value = false;
  };

  const handleSubmitSaveRoleForm = async () => {
    const ret = await saveRoleFormRef.value.validate();
    if (ret) {
      return false;
    }
    try {
      await saveRole({
        ...form.value,
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
      page: current,
      ...formModel.value,
    });
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
    if (!checked) {
      cloneColumns.value = showColumns.value.filter(
        (item) => item.dataIndex !== column.dataIndex
      );
    } else {
      cloneColumns.value.splice(index, 0, column);
    }
  };

  const exchangeArray = <T extends Array<any>>(
    array: T,
    beforeIdx: number,
    newIdx: number,
    isDeep = false
  ): T => {
    const newArray = isDeep ? cloneDeep(array) : array;
    if (beforeIdx > -1 && newIdx > -1) {
      // 先替换后面的，然后拿到替换的结果替换前面的
      newArray.splice(
        beforeIdx,
        1,
        newArray.splice(newIdx, 1, newArray[beforeIdx]).pop()
      );
    }
    return newArray;
  };

  const popupVisibleChange = (val: boolean) => {
    if (val) {
      nextTick(() => {
        const el = document.getElementById('tableSetting') as HTMLElement;
        const sortable = new Sortable(el, {
          onEnd(e: any) {
            const { oldIndex, newIndex } = e;
            exchangeArray(cloneColumns.value, oldIndex, newIndex);
            exchangeArray(showColumns.value, oldIndex, newIndex);
          },
        });
      });
    }
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
