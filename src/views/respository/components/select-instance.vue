<template>
  <a-card :style="{ width: '100%' }">
    <a-row>
      <a-col :flex="1">
        <a-form
          :model="formModel"
          :label-col-props="{ span: 6 }"
          :wrapper-col-props="{ span: 18 }"
          label-align="left"
          auto-label-width
          @submit="search"
        >
          <a-row :gutter="20">
            <a-col :span="15">
              <a-form-item field="ip" :label="$t('instance.ip')">
                <a-input
                  v-model="formModel.ip"
                  :placeholder="$t('instance.ip.placeholder')"
                />
              </a-form-item>
            </a-col>

            <a-col :span="8">
              <a-form-item field="status" :label="$t('instance.status')">
                <a-radio-group
                  v-model="formModel.status"
                  type="button"
                  @change="search"
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
    <a-table
      v-model:selectedKeys="selectedKeys"
      row-key="instance_id"
      :loading="loading"
      :columns="columns"
      :data="instanceList"
      :row-selection="rowSelection"
      :pagination="pagination"
      @page-change="onPageChange"
    >
      <template #index="{ rowIndex }">
        {{ rowIndex + 1 + (pagination.page - 1) * pagination.pageSize }}
      </template>
      <template #status="{ record }">
        <a-tag v-if="record.status === 0" color="red"><icon-close /></a-tag>
        <a-tag v-else color="green"> <icon-check /></a-tag>
      </template>
    </a-table>
  </a-card>
</template>

<script lang="ts" setup>
  import useLoading from '@/hooks/loading';
  import { Pagination } from '@/types/global';
  import { useI18n } from 'vue-i18n';
  import { ref, computed, reactive, watch } from 'vue';
  import { TableColumnData, TableRowSelection } from '@arco-design/web-vue';

  import {
    InstanceRecord,
    QueryUserServerReq,
    queryUserServerList,
  } from '@/api/instance';

  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();

  const generateFormModel = () => {
    return {
      ip: '',
      status: 1,
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

  defineProps(['modelValue']);
  const emit = defineEmits(['update:modelValue']);

  const selectedKeys = ref<string[]>([]);

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
  ]);

  const rowSelection = reactive<TableRowSelection>({
    type: 'checkbox',
    showCheckedAll: true,
    onlyCurrent: false,
  });

  const instanceList = ref<InstanceRecord[]>([]);

  const fetchData = async (
    params: QueryUserServerReq = { page: 1, page_size: 20, ip: '', status: 1 }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryUserServerList(params);
      instanceList.value = data.list;
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
      page: basePagination.page,
      page_size: basePagination.pageSize,
      ...formModel.value,
    } as unknown as QueryUserServerReq);
  };
  const onPageChange = (current: number) => {
    fetchData({
      page_size: pagination.pageSize,
      page: current,
      ...formModel.value,
    });
  };

  const reset = () => {
    formModel.value = generateFormModel();
  };

  fetchData();

  watch(
    () => selectedKeys.value,
    (val) => {
      const list = instanceList.value.filter((item) =>
        val.includes(item.instance_id)
      );
      emit('update:modelValue', list);
    },
    { deep: true, immediate: true }
  );
</script>
