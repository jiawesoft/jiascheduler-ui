<template>
  <a-modal
    :visible="isCreate"
    :unmount-on-close="true"
    :draggable="true"
    width="50%"
    hide-cancel
    :footer="false"
    @ok="handleCancel"
    @cancel="handleCancel"
  >
    <template #title> {{ $t('terminal.newConnect') }} </template>
    <div>
      <div style="margin-bottom: 16px">
        <div class="sub-title">{{ $t('terminal.create.searchTitle') }}</div>
        <a-space>
          <!-- <a-input
            v-model="searchKey"
            :style="{ width: '320px' }"
            :placeholder="$t('terminal.create.notSelected')"
            allow-clear
            @press-enter="searchIp"
          > </input>-->
          <a-textarea
            v-model="searchKey"
            :style="{ width: '320px' }"
            :placeholder="$t('terminal.create.notSelected')"
            allow-clear
            auto-size
          />

          <icon-search @click="searchIp" style="cursor: pointer" />

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
        <template #operations="{ record }">
          <!-- <a-button
            type="text"
            size="small"
            @click="handleViewExecDetailModal($event, record)"
          >
            {{ $t('operations.view') }}
          </a-button> -->
          <a-button
            type="primary"
            size="mini"
            @click="handleOpenSshConnect($event, record)"
          >
            {{ $t('operations.websshLogin') }}
          </a-button>
        </template>
      </a-table>
    </div>
  </a-modal>
  <connect-modal
    v-model:visible="sshConnectModalvisible"
    :record="sshConnectRecord"
    @cancel="sshConnectModalvisible = false"
    @add-terminal="handleAddTerminal"
  />
</template>

<script lang="ts" setup>
  import { ref, reactive, PropType, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Pagination } from '@/types/global';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import {
    InstanceRecord,
    QueryUserServerReq,
    queryUserServerList,
  } from '@/api/instance';
  import useLoading from '@/hooks/loading';
  import connectModal from '@/views/terminal/components/connect-modal.vue';

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
  const emit = defineEmits(['cancelModal', 'addTerminal']);

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
    {
      title: t('operations'),
      dataIndex: 'operations',
      slotName: 'operations',
    },
  ]);
  const renderData = ref<InstanceRecord[]>([]);
  const size = ref<SizeProps>('medium');
  const sshConnectModalvisible = ref(false);
  const sshConnectRecord = ref<any>(null);
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
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  fetchData({
    page_size: pagination.pageSize,
    page: pagination.page,
    status: 1,
    ips: searchKey.value.split('\n').filter((item) => item.trim() !== ''),
  });

  function handleCancel() {
    emit('cancelModal');
  }

  async function handleAddTerminal(info: any) {
    setLoading(true);
    try {
      // const { data } = await getTerminalSession({ session_id: sessionId });
      // const selectItem = {
      //   id: data.session_id,
      //   ip: data.instance.ip,
      //   namespace: data.instance.namespace,
      //   instanceId: data.instance.instance_id,
      //   sysUser: data.connect_opts.user,
      //   userSource: data.user_source,
      //   sessionId: data.session_id,
      // };
      emit('addTerminal', info);
      emit('cancelModal');
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }

    return true;
  }

  const onPageChange = (current: number) => {
    fetchData({
      page_size: pagination.pageSize,
      page: current,
      status: currentStatus.value,
      ips: searchKey.value.split('\n').filter((item) => item.trim() !== ''),
    });
  };

  const selectedChangeIp = (rowKeys: any) => {
    selectedRowKeys.value = rowKeys;
  };

  const searchIp = () => {
    fetchData({
      page_size: pagination.pageSize,
      page: pagination.page,
      ips: searchKey.value.split('\n').filter((item) => item.trim() !== ''),
      status: currentStatus.value,
    });
  };

  const handleOpenSshConnect = (e: any, record: any) => {
    sshConnectRecord.value = record;
    sshConnectModalvisible.value = true;
  };
</script>

<style lang="less" scoped>
  .sub-title {
    color: var(--color-neutral-8);
    font-size: 14px;
    margin-bottom: 8px;
  }
</style>
