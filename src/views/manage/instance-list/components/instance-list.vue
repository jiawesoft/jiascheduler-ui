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

    <template #sysUser="{ record }">
      <span>{{ record.sys_user || '-' }}</span>
      <a-tag
        v-if="(record.sys_users || []).length > 1"
        size="small"
        color="arcoblue"
        style="margin-left: 6px"
      >
        {{ $t('instance.sshUser.more', { count: record.sys_users.length }) }}
      </a-tag>
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
            {{ $t('operations.settings') }}
          </a-button>
        </a-space>
        <a-space>
          <a-button size="mini" @click="handleOpenSshConnect($event, record)">
            {{ $t('operations.websshLogin') }}
          </a-button>
        </a-space>
      </a-space>
    </template>
  </a-table>

  <a-drawer
    v-model:visible="saveInstanceModalvisible"
    placement="right"
    title-align="start"
    :width="drawerWidth"
    :draggable="true"
    :ok-text="$t('form.save')"
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
      <a-form-item
        field="sys_user"
        :label="$t('instance.sshUser.title')"
        :rules="[]"
      >
        <div class="sys-users">
          <div class="sys-users-tip">{{ $t('instance.sshUser.tip') }}</div>
          <div
            v-for="(item, index) in form.sys_users"
            :key="index"
            class="sys-user-item"
          >
            <a-radio
              :model-value="form.sys_user"
              :value="item.username"
              @change="handleDefaultUserChange(item.username)"
            >
              {{ $t('instance.sshUser.default') }}
            </a-radio>
            <a-input
              v-model="item.username"
              class="sys-user-name"
              :placeholder="$t('instance.sshUser.username.placeholder')"
              @change="handleUserNameChange(index)"
            />
            <a-select
              v-model="item.auth_type"
              class="sys-user-auth-type"
              @change="handleAuthTypeChange(item)"
            >
              <a-option value="password">
                {{ $t('terminal.sshConnect.auth.password') }}
              </a-option>
              <a-option value="key_content">
                {{ $t('terminal.sshConnect.auth.keyContent') }}
              </a-option>
            </a-select>
            <ssh-secret-field
              :key="`${index}-${item.auth_type}`"
              :type="item.auth_type"
              :has-stored="!!item.has_stored"
              :model-value="
                item.auth_type === 'key_content'
                  ? item.key_content || ''
                  : item.password || ''
              "
              @update:model-value="handleSecretChange(item, $event)"
            />
            <a-button
              type="text"
              status="danger"
              size="mini"
              @click="handleRemoveSysUser(index)"
            >
              <template #icon><icon-delete /></template>
            </a-button>
          </div>
          <a-button type="dashed" long size="small" @click="handleAddSysUser">
            <template #icon><icon-plus /></template>
            {{ $t('instance.sshUser.add') }}
          </a-button>
        </div>
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
  </a-drawer>

  <ssh-connect-modal
    v-model:visible="sshConnectModalvisible"
    :record="sshConnectRecord"
    @cancel="sshConnectModalvisible = false"
  ></ssh-connect-modal>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive, watch, nextTick, toRefs } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';

  import { Pagination } from '@/types/global';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import cloneDeep from 'lodash/cloneDeep';
  import Sortable from 'sortablejs';

  import {
    InstanceRecord,
    QueryInstanceListReq,
    SysUser,
    queryInstanceList,
    saveInstance,
  } from '@/api/instance';
  import { Message } from '@arco-design/web-vue';

  import SshSecretField from '@/components/ssh-secret-field.vue';
  import SelectGroup from '../../components/select-group.vue';
  import SshConnectModal from './ssh-connect-modal.vue';

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };
  const saveInstanceModalvisible = ref(false);
  const grantedUserModalvisible = ref(false);
  const sshConnectModalvisible = ref(false);
  const sshConnectRecord = ref<any>(null);
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
    sys_user: '',
    sys_users: [] as SysUser[],
    namespace: 'default',
  };

  /** Instance settings drawer width: adaptive on narrow screens. */
  const drawerWidth = computed(() =>
    window.innerWidth < 1200 ? '90%' : '820px'
  );

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
      slotName: 'sysUser',
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
      form.value = {
        ...record,
        sys_users: (record.sys_users || []).map((item: SysUser) => ({
          username: item.username,
          // The instance side supports password / key_content only; legacy
          // key_path entries fall back to the password form.
          auth_type:
            item.auth_type === 'key_content' ? 'key_content' : 'password',
          // Key content and password are never sent down; empty keeps the stored value.
          key_content: '',
          password: '',
          // The server already has a credential, shown as "configured"; legacy
          // key_path users have to enter the key content again.
          has_stored: item.auth_type !== 'key_path' && !!item.username,
          is_default: !!item.is_default,
        })),
      };
      // Backwards compatibility: the default user comes from the sys_user column.
      if (!form.value.sys_users.some((item) => item.is_default)) {
        const defaultItem = form.value.sys_users.find(
          (item) => item.username === record.sys_user
        );
        if (defaultItem) {
          defaultItem.is_default = true;
        }
      }
      form.value.sys_user =
        form.value.sys_users.find((item) => item.is_default)?.username || '';
    } else {
      form.value = { ...defaultSaveInstanceForm, sys_users: [] };
    }

    saveInstanceModalvisible.value = true;
  };

  const handleAddSysUser = () => {
    form.value.sys_users.push({
      username: '',
      auth_type: 'password',
      key_content: '',
      password: '',
      has_stored: false,
      is_default: form.value.sys_users.length === 0,
    });
    if (!form.value.sys_user) {
      syncDefaultUser();
    }
  };

  /** Write back a frozen field into the field matching its auth type. */
  const handleSecretChange = (item: SysUser, value: string) => {
    if (item.auth_type === 'key_content') {
      item.key_content = value;
    } else {
      item.password = value;
    }
  };

  const handleRemoveSysUser = (index: number) => {
    const [removed] = form.value.sys_users.splice(index, 1);
    if (removed?.is_default || form.value.sys_user === removed?.username) {
      form.value.sys_user = '';
    }
    if (!form.value.sys_users.length) {
      // Clear the default user so the server clears the sys_user column.
      form.value.sys_user = '';
      return;
    }
    syncDefaultUser();
  };

  /** Keep exactly one default login user. */
  const syncDefaultUser = () => {
    const users = form.value.sys_users;
    if (!users.length) {
      form.value.sys_user = '';
      return;
    }
    if (!users.some((item) => item.is_default)) {
      users[0].is_default = true;
    }
    form.value.sys_user =
      users.find((item) => item.is_default)?.username || users[0].username;
  };

  const handleDefaultUserChange = (username: string) => {
    form.value.sys_users.forEach((item) => {
      item.is_default = item.username === username;
    });
    form.value.sys_user = username;
  };

  const handleUserNameChange = (index: number) => {
    const item = form.value.sys_users[index];
    if (item?.is_default) {
      form.value.sys_user = item.username;
    }
  };

  const handleAuthTypeChange = (item: SysUser) => {
    item.password = '';
    item.key_content = '';
    // Start from the frozen state again after switching auth type.
    item.has_stored = false;
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

  const handleOpenSshConnect = (e: any, record: any) => {
    sshConnectRecord.value = record;
    sshConnectModalvisible.value = true;
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

  .sys-users {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;

    .sys-users-tip {
      color: var(--color-text-3);
      font-size: 12px;
      line-height: 18px;
    }

    .sys-user-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;

      :deep(.arco-radio) {
        margin-top: 6px;
        flex-shrink: 0;
        white-space: nowrap;
      }

      .sys-user-name {
        width: 120px;
        flex-shrink: 0;
      }

      .sys-user-auth-type {
        width: 108px;
        flex-shrink: 0;
      }
    }
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
