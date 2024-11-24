<template>
  <a-modal
    :visible="isCreate"
    :on-before-ok="handleBeforeOk"
    :unmount-on-close="true"
    :draggable="true"
    width="50%"
    @cancel="handleCancel"
  >
    <template #title> {{ $t('terminal.newConnect') }} </template>
    <div>
      <div style="margin-bottom: 16px">
        <div class="sub-title">{{ $t('terminal.create.searchTitle') }}</div>
        <a-space>
          <a-input
            v-model="searchKey"
            :style="{ width: '320px' }"
            :placeholder="$t('terminal.create.notSelected')"
            allow-clear
            @press-enter="searchIp"
          >
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
          <!-- <a-form-item field="status" :label="$t('instance.status')"> -->
          <a-radio-group
            v-model="currentStatus"
            type="button"
            @change="searchIp"
          >
            <a-radio :value="1">
              {{ $t('instance.online') }}
            </a-radio>
            <a-radio :value="0">
              {{ $t('instance.offline') }}
            </a-radio>
          </a-radio-group>
          <!-- </a-form-item> -->
        </a-space>
      </div>
      <div class="sub-title">{{ $t('terminal.create.listTitle') }}</div>
      <a-table
        row-key="instance_id"
        :loading="loading"
        :pagination="pagination"
        :columns="(columns as TableColumnData[])"
        :data="renderData"
        :bordered="false"
        :size="size"
        :row-selection="{
          type: 'radio',
          showCheckedAll: true,
          onlyCurrent: false,
        }"
        @page-change="onPageChange"
        @selection-change="selectedChangeIp"
      >
        <template #index="{ rowIndex }">
          {{ rowIndex + 1 + (pagination.page - 1) * pagination.pageSize }}
        </template>
        <template #ip="{ record }">
          <span>{{ record.ip }}</span>
        </template>
        <template #namespace="{ record }">
          <span>{{ record.namespace }}</span>
        </template>
        <template #status="{ record }">
          <a-tag v-if="record.status === 0" color="red"><icon-close /></a-tag>
          <a-tag v-else color="green"> <icon-check /></a-tag>
        </template>
      </a-table>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, reactive, PropType, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Message, Modal } from '@arco-design/web-vue';
  import { useRouter } from 'vue-router';
  import { Pagination } from '@/types/global';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import {
    InstanceRecord,
    QueryUserServerReq,
    queryUserServerList,
  } from '@/api/instance';
  import useLoading from '@/hooks/loading';

  const router = useRouter();
  const { t } = useI18n();

  defineProps({
    isCreate: {
      type: Boolean,
      default: false,
    },
    renderData: {
      type: Array as PropType<InstanceRecord[]>,
      default() {
        return [];
      },
    },
    loading: {
      type: Boolean,
      default: false,
    },
  });

  const searchKey = ref('');
  const currentStatus = ref(1);

  const selectedRowKeys = ref([]);
  const emit = defineEmits(['cancelModal', 'fetchData', 'addTerminal']);

  const basePagination: Pagination = {
    page: 1,
    pageSize: 20,
  };

  const pagination = reactive({
    ...basePagination,
  });

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';

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
      title: t('instance.status'),
      dataIndex: 'status',
      slotName: 'status',
    },
    {
      title: t('columns.updatedTime'),
      dataIndex: 'updated_time',
    },
  ]);
  const renderData = ref<InstanceRecord[]>([]);
  const size = ref<SizeProps>('medium');

  const { loading, setLoading } = useLoading(false);
  const fetchData = async (
    params: QueryUserServerReq = {
      page: 1,
      page_size: 20,
    }
  ) => {
    try {
      setLoading(true);
      const { data } = await queryUserServerList(params);
      renderData.value = data?.list || [];
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  fetchData({
    page_size: pagination.pageSize,
    page: pagination.page,
    status: 1,
  });

  function handleCancel() {
    emit('cancelModal');
  }

  async function handleBeforeOk() {
    if (selectedRowKeys.value.length === 0) {
      Message.error(t('terminal.create.notSelected'));
    } else {
      emit('cancelModal');
      const selectItem = renderData.value.find(
        (item) => item.instance_id === selectedRowKeys.value[0]
      );
      if (!selectItem) {
        Modal.error({
          content: 'No data found!',
          escToClose: false,
          maskClosable: false,
          onOk: () => {
            router.push({
              path: '/',
            });
          },
        });
      } else {
        emit('addTerminal', selectItem);
      }
    }

    return true;
  }
  const onPageChange = (current: number) => {
    fetchData({
      page_size: pagination.pageSize,
      page: current,
      ip: searchKey.value,
    });
  };

  const selectedChangeIp = (rowKeys) => {
    selectedRowKeys.value = rowKeys;
  };

  const searchIp = () => {
    fetchData({
      page_size: pagination.pageSize,
      page: pagination.page,
      ip: searchKey.value,
      status: currentStatus.value,
    });
  };
</script>

<style lang="less" scoped>
  .sub-title {
    color: var(--color-neutral-8);
    font-size: 14px;
    margin-bottom: 8px;
  }
</style>
