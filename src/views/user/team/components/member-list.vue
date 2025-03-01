<template>
  <div style="padding: 15px">
    <a-row style="margin-bottom: 16px">
      <a-col :span="12">
        <a-button type="primary" @click="handleAddMemberModal">
          <template #icon>
            <icon-plus />
          </template>
          {{ $t('team.add.user') }}
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
      :columns="(cloneColumns as TableColumnData[])"
      :data="renderData"
      :bordered="false"
      :size="size"
    >
      <template #index="{ rowIndex }">
        {{ rowIndex + 1 }}
      </template>
      <template #isAdmin="{ record }">
        <a-tag v-if="record.is_admin" size="small" color="red"> admin </a-tag>
        <a-tag v-else size="small" color="arcoblue"> member </a-tag>
      </template>

      <template #operations="{ record }">
        <a-popconfirm
          :content="$t('operations.delete.confirm')"
          @ok="handleDeleteMemberModal(record)"
        >
          <a-button status="danger" size="small">
            {{ $t('operations.delete') }}
          </a-button>
        </a-popconfirm>
      </template>
    </a-table>
  </div>

  <!-- 新增成员 -->
  <a-modal
    v-model:visible="memberModalvisible"
    title-align="start"
    style="width: auto"
    :draggable="true"
    width="60%"
    hide-cancel
    :ok-text="$t('form.save')"
    @before-ok="handleSubmitSaveMember"
    @cancel="handleCancel"
  >
    <template #title> {{ $t('team.add.user') }}</template>
    <table-select-user-list
      v-if="memberModalvisible"
      v-model:userId="selectUser"
    />
  </a-modal>
</template>

<script lang="ts" setup>
  import { computed, ref, watch, nextTick } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';

  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import cloneDeep from 'lodash/cloneDeep';
  import Sortable from 'sortablejs';
  import { useAppStore } from '@/store';

  import { Message } from '@arco-design/web-vue';
  import {
    queryTeamDetail,
    TeamDetailRecord,
    QueryTeamDetailReq,
    addTeamUser,
    removeFile,
    TeamMember,
  } from '@/api/team';
  import tableSelectUserList from './table-select-user-list.vue';

  const appStore = useAppStore();

  const teamId = computed(() => {
    return appStore.currentTeamId;
  });

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };
  const memberModalvisible = ref(false);

  const { loading, setLoading } = useLoading(false);
  const { t } = useI18n();
  const renderData = ref<TeamDetailRecord[]>([]);
  const cloneColumns = ref<Column[]>([]);
  const showColumns = ref<Column[]>([]);

  const size = ref<SizeProps>('medium');

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
      title: t('team.member.username'),
      dataIndex: 'username',
    },
    {
      title: t('team.member.isAdmin'),
      dataIndex: 'is_admin',
      slotName: 'isAdmin',
    },
    {
      title: t('team.member.createdTime'),
      dataIndex: 'created_time',
    },
    {
      title: t('operations'),
      dataIndex: 'operations',
      slotName: 'operations',
    },
  ]);

  const fetchData = async (
    params: QueryTeamDetailReq = {
      id: teamId.value,
    }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryTeamDetail(params);
      renderData.value = data.list;
    } catch (err) {
      // you can report use errorHandler or other
      Message.error(`${err}`);
    } finally {
      setLoading(false);
    }
  };

  const selectUser = ref<TeamMember[]>([]);

  const handleCancel = () => {
    memberModalvisible.value = false;
  };

  const search = () => {
    fetchData();
  };

  const handleSelectDensity = (
    val: string | number | Record<string, any> | undefined
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

  const handleAddMemberModal = () => {
    memberModalvisible.value = true;
    selectUser.value = renderData.value.map((v) => {
      return {
        user_id: v.user_id,
        is_admin: v.is_admin || false,
      };
    });
  };

  const handleDeleteMemberModal = async (record: TeamDetailRecord) => {
    try {
      await removeFile({
        team_id: teamId.value,
        user_ids: [record.user_id],
      });
    } catch (err) {
      return false;
    }

    Message.success(t('form.submit.success'));
    search();

    return true;
  };

  const handleSubmitSaveMember = async () => {
    const ret = selectUser.value;
    if (ret.length === 0) {
      return false;
    }
    try {
      await addTeamUser({
        team_id: teamId.value,
        members: selectUser.value,
      });
    } catch (err) {
      return false;
    }

    Message.success(t('form.submit.success'));
    search();

    return true;
  };

  watch(
    () => columns.value,
    (val) => {
      cloneColumns.value = cloneDeep(val);
      cloneColumns.value.forEach((item) => {
        item.checked = true;
      });
      showColumns.value = cloneDeep(cloneColumns.value);
    },
    { deep: true, immediate: true }
  );

  watch(
    () => teamId.value,
    (val) => {
      if (val !== -99) {
        fetchData();
      }
    },
    { deep: true, immediate: true }
  );
</script>

<style scoped lang="less">
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
  .team-card {
    height: calc(100% - 56px);
    :deep(& > .arco-card-body) {
      padding: 0;
      height: 100%;
    }
  }
</style>
