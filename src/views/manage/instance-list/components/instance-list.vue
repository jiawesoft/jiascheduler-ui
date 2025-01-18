<template>
  <a-row>
    <a-col flex="auto">
      <a-form
        :model="formModel"
        :label-col-props="{ span: 6 }"
        :wrapper-col-props="{ span: 18 }"
        label-align="left"
        auto-label-width
        @submit="search"
      >
        <a-row :gutter="5">
          <a-col :span="10">
            <a-form-item field="schedule_name" :label="$t('instance.ip')">
              <a-input
                v-model="formModel.ip"
                @press-enter="search"
                :placeholder="$t('instance.ip.placeholder')"
              />
            </a-form-item>
          </a-col>

          <a-col :span="10">
            <a-form-item field="status" :label="$t('instance.status')">
              <a-radio-group
                @change="search"
                v-model="formModel.status"
                type="button"
              >
                <a-radio :value="1">
                  {{ $t('instance.online') }}
                </a-radio>
                <a-radio :value="0">
                  {{ $t('instance.offline') }}
                </a-radio>
              </a-radio-group>
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
        @click="handleSaveInstanceModal($event, null)"
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
                  {{ item.title === '#' ? t('index.sn') : item.title }}
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

    <template #status="{ record }">
      <a-tag v-if="record.status === 0" color="red"><icon-close /></a-tag>
      <a-tag v-else color="green"> <icon-check /></a-tag>
    </template>

    <template #operations="{ record }">
      <a-space direction="horizontal">
        <a-space>
          <a-button
            v-permission="['admin']"
            status="normal"
            size="mini"
            @click="handleSaveInstanceModal($event, record)"
          >
            {{ $t('operations.update') }}
          </a-button>
        </a-space>
        <a-space>
          <a-button size="mini" @click="handleViewTerminal($event, record)">
            {{ $t('operations.websshLogin') }}
          </a-button>
        </a-space>
      </a-space>
    </template>
  </a-table>

  <a-modal
    v-model:visible="saveInstanceModalvisible"
    title-align="start"
    style="width: auto"
    :draggable="true"
    width="40%"
    hide-cancel
    @before-ok="handleSubmitSaveInstanceForm"
    @cancel="handleSaveInstanceModalCancel"
  >
    <template #title> {{ $t('instance.updateInstance') }}</template>
    <a-form ref="saveInstanceFormRef" :model="form" :auto-label-width="true">
      <a-form-item
        field="ip"
        :label="$t('instance.ip')"
        :rules="[
          {
            required: true,
            type: 'ip',
          },
        ]"
      >
        <a-input v-model="form.ip" />
      </a-form-item>

      <a-form-item field="status" :label="$t('instance.status')">
        <a-radio-group v-model="form.status" type="button">
          <a-radio :value="1">
            {{ $t('instance.online') }}
          </a-radio>
          <a-radio :value="0">
            {{ $t('instance.offline') }}
          </a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item
        field="namespace"
        disabled
        :label="$t('instance.namespace')"
        :tooltip="$t('instance.namespace.tooltips')"
        :rules="[
          {
            required: true,
          },
        ]"
      >
        <a-input v-model="form.namespace" />
      </a-form-item>
      <a-form-item field="sys_user" :label="$t('instance.sysUser')" :rules="[]">
        <a-input v-model="form.sys_user" />
      </a-form-item>
      <a-form-item
        field="password"
        :label="$t('instance.password')"
        :tooltip="$t('instance.password.tooltips')"
        :rules="[
          {
            // required: true,
          },
        ]"
      >
        <a-input
          v-model="form.password"
          :style="{ width: '320px' }"
          :default-visibility="true"
          allow-clear
        />
      </a-form-item>
      <a-form-item
        field="instance-group-id"
        v-if="saveInstanceModalvisible"
        :label="$t('instance.instanceGroup')"
      >
        <select-group v-model:instance-group-id="form.instance_group_id" />
      </a-form-item>
      <a-form-item field="info" :label="$t('instance.info')">
        <a-textarea v-model="form.info" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive, watch, nextTick, toRefs } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';

  import { Pagination } from '@/types/global';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import cloneDeep from 'lodash/cloneDeep';
  import Sortable from 'sortablejs';

  import { useRouter } from 'vue-router';

  import {
    InstanceRecord,
    QueryInstanceListReq,
    queryInstanceList,
    saveInstance,
  } from '@/api/instance';
  import { Message } from '@arco-design/web-vue';

  import SelectGroup from '../../components/select-group.vue';

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };
  const saveInstanceModalvisible = ref(false);
  const grantedUserModalvisible = ref(false);
  const saveInstanceFormRef = ref();
  const grantedUserFormRef = ref();

  const defaultSaveInstanceForm = {
    ip: '',
    status: 0,
    id: 0,
    ssh_port: 22,
    password: '',
    info: '',
    instance_group_id: 0,
    sys_user: 'root',
    namespace: 'default',
  };

  const defaultGrantedUserForm = {
    ip: '',
    status: 0,
    id: 0,
    ssh_port: 22,
    password: '',
    info: '',
    user_id: '',
    role_id: [],
    namespace: 'default',
  };

  const state = reactive({
    form: {
      ...defaultSaveInstanceForm,
    },
    grantedUserForm: {
      ...defaultGrantedUserForm,
    },
  });
  const { form, grantedUserForm } = toRefs(state);

  const generateFormModel = () => {
    return {
      ip: '',
      status: 1,
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref<InstanceRecord[]>([]);
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
      title: t('instance.ip'),
      dataIndex: 'ip',
    },
    {
      title: t('instance.namespace'),
      dataIndex: 'namespace',
    },
    {
      title: t('instance.sysUser'),
      dataIndex: 'sys_user',
    },
    {
      title: t('instance.status'),
      dataIndex: 'status',
      slotName: 'status',
    },
    {
      title: t('instance.instanceGroup'),
      dataIndex: 'instance_group',
    },
    {
      title: t('instance.info'),
      dataIndex: 'info',
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

  const fetchData = async (
    params: QueryInstanceListReq = {
      page: 1,
      page_size: 20,
      status: formModel.value.status,
    }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryInstanceList(params);

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

  const handleSaveInstanceModal = (e: any, record: any) => {
    saveInstanceFormRef.value.clearValidate();
    if (record) {
      form.value = { ...record };
    } else {
      form.value = { ...defaultSaveInstanceForm };
    }

    saveInstanceModalvisible.value = true;
  };

  const handleSaveInstanceModalCancel = () => {
    saveInstanceModalvisible.value = false;
  };

  const handleSubmitSaveInstanceForm = async () => {
    const ret = await saveInstanceFormRef.value.validate();
    if (ret) {
      return false;
    }
    try {
      await saveInstance({
        ...form.value,
      });
    } catch (err) {
      return false;
    }

    Message.success(t('form.submit.success'));
    search();

    return true;
  };

  const handleSubmitGrantedUserForm = async () => {
    const ret = await grantedUserFormRef.value.validate();
    if (ret) {
      return false;
    }
    try {
      await saveInstance({
        ...form.value,
      });
    } catch (err) {
      return false;
    }

    Message.success(t('form.submit.success'));
    search();

    return true;
  };

  const router = useRouter();
  const handleViewTerminal = (e: any, record: any) => {
    const url = router.resolve({
      name: 'terminal',
      query: { instance_id: record.instance_id },
    });
    window.open(url.href, '_blank');
  };

  const search = () => {
    fetchData({
      page: basePagination.page,
      page_size: basePagination.pageSize,
      ...formModel.value,
    } as unknown as QueryInstanceListReq);
  };
  const onPageChange = (current: number) => {
    fetchData({
      page_size: pagination.pageSize,
      page: current,
      ...formModel.value,
    });
  };

  search();
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

<script lang="ts">
  export default {
    name: 'InstanceList',
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
