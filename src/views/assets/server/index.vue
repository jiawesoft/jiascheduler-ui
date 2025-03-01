<template>
  <div class="container">
    <Breadcrumb :items="['menu.assets', 'menu.assets.server']" />
    <a-card class="general-card">
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
            <a-row :gutter="5">
              <a-col :span="10">
                <a-form-item field="ip" :label="$t('instance.ip')">
                  <a-input
                    v-model="formModel.ip"
                    :placeholder="$t('instance.ip.placeholder')"
                    @press-enter="search"
                  />
                </a-form-item>
              </a-col>

              <a-col :span="10">
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
        <a-col :span="12"> </a-col>
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
          <!-- <a-button
            type="text"
            size="small"
            @click="handleViewExecDetailModal($event, record)"
          >
            {{ $t('operations.view') }}
          </a-button> -->
          <a-button
            type="text"
            size="small"
            @click="handleViewTerminal($event, record)"
          >
            {{ $t('operations.websshLogin') }}
          </a-button>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="visible"
      title-align="start"
      style="width: auto"
      :draggable="true"
      width="30%"
      hide-cancel
      @cancel="handleCancel"
    >
      <template #title> {{ $t('instance.detail') }}</template>
      <a-form :model="form" :auto-label-width="true">
        <a-form-item field="status" :label="$t('instance.status')">
          {{ form.status }}
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
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
    QueryUserServerReq,
    queryUserServerList,
  } from '@/api/instance';
  import { Message } from '@arco-design/web-vue';

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };
  const visible = ref(false);

  const state = reactive({
    form: {
      ip: '',
      status: 1,
      id: 0,
      updated_time: '',
    },
  });
  const { form } = toRefs(state);

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
      title: t('instance.status'),
      dataIndex: 'status',
      slotName: 'status',
    },

    {
      title: t('instance.info'),
      dataIndex: 'info',
      slotName: 'info',
    },
    {
      title: t('instance.instanceGroup'),
      dataIndex: 'instance_group',
      slotName: 'instance_group',
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
    params: QueryUserServerReq = {
      page: 1,
      page_size: 20,
      status: formModel.value.status,
    }
  ) => {
    setLoading(true);

    try {
      const { data } = await queryUserServerList(params);

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

  // const handleViewExecDetailModal = (e: any, record: any) => {
  //   if (record) {
  //     form.value = { ...record };
  //   }

  //   visible.value = true;
  // };

  const handleCancel = () => {
    visible.value = false;
  };

  const router = useRouter();
  const handleViewTerminal = (e: any, record: any) => {
    const url = router.resolve({
      name: 'terminal',
      query: {
        instance_id: record.instance_id,
      },
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
