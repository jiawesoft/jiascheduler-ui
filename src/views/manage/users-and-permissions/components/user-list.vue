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
        @click="handleUserRegisterModal($event, null)"
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
                  {{ item.title === '#' ? $t('columns.sn') : item.title }}
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
      <a-space direction="horizontal">
        <a-space>
          <a-button
            v-permission="['admin']"
            size="mini"
            @click="handleUserRegisterModal($event, record)"
          >
            {{ $t('operations.update') }}
          </a-button>
        </a-space>
        <a-space>
          <a-button
            v-permission="['admin']"
            size="mini"
            @click="handleUserServerModal($event, record)"
          >
            {{ $t('instance.server') }}
          </a-button>
        </a-space>
      </a-space>
    </template>
  </a-table>

  <a-modal
    v-model:visible="userRegisterModalVisible"
    title-align="start"
    style="width: auto"
    :draggable="true"
    width="40%"
    hide-cancel
    @before-ok="handleSubmitUserRegisterForm"
    @cancel="handleRegisterUserModalCancel"
  >
    <template #title> {{ $t('user.saveUser') }}</template>
    <a-form ref="userRegisterFormRef" :model="form" :auto-label-width="true">
      <a-form-item
        field="username"
        :disabled="form.user_id !== ''"
        :label="$t('user.username')"
        :rules="[
          {
            required: true,
          },
        ]"
      >
        <a-input v-model="form.username" />
      </a-form-item>
      <a-form-item
        field="nickname"
        :label="$t('user.nickname')"
        :rules="[
          {
            required: true,
          },
        ]"
      >
        <a-input v-model="form.nickname" />
      </a-form-item>

      <a-form-item
        field="email"
        :label="$t('user.email')"
        :rules="[
          {
            required: true,
            type: 'email',
          },
        ]"
      >
        <a-input
          v-model="form.email"
          :placeholder="$t('user.email.placeholder')"
        />
      </a-form-item>

      <a-form-item
        field="gender"
        :rules="[{ required: true }]"
        :label="$t('user.gender')"
      >
        <a-radio-group v-model="form.gender" type="button">
          <a-radio value="male">
            {{ $t('user.gender.male') }}
          </a-radio>
          <a-radio value="female">
            {{ $t('user.gender.female') }}
          </a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item
        field="phone"
        :label="$t('user.phone')"
        :rules="[
          {
            // required: true,
          },
        ]"
      >
        <a-input v-model="form.phone" />
      </a-form-item>

      <a-form-item
        field="password"
        :label="$t('user.password')"
        :tooltip="$t('user.password.tooltips')"
        :rules="[
          {
            // required: true,
          },
        ]"
      >
        <a-input v-model="form.password" />
      </a-form-item>

      <a-form-item
        field="introduction"
        :label="$t('user.introduction')"
        :rules="[
          {
            maxLength: 200,
          },
        ]"
        row-class="keep-margin"
      >
        <a-textarea
          v-model="form.introduction"
          :placeholder="$t('user.introduction.placeholder')"
        />
      </a-form-item>

      <a-form-item field="role_id" :label="$t('user.role')">
        <select-role
          v-if="userRegisterModalVisible"
          v-model:role-id="form.role_id"
        />
      </a-form-item>
    </a-form>
  </a-modal>

  <a-modal
    v-model:visible="userServerModalVisible"
    title-align="start"
    style="width: auto"
    :draggable="true"
    width="60%"
    hide-cancel
    @cancel="handleUserServerModalCancel"
  >
    <template #title> {{ $t('instance.userServer') }}</template>
    <table-select-user-server-list
      v-if="userServerModalVisible"
      v-model:search-user-id="selectUserId"
    />
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

  import { QueryInstanceListReq } from '@/api/instance';
  import { Message } from '@arco-design/web-vue';
  import {
    QueryUserListReq,
    UserInfo,
    adminUpdateUserInfo,
    queryUserList,
    userRegister,
  } from '@/api/user';
  import { rand } from '@vueuse/core';

  import SelectRole from '@/views/manage/components/select-role.vue';
  import tableSelectUserServerList from '@/views/manage/components/table-select-user-server-list.vue';

  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };
  const userRegisterModalVisible = ref(false);
  const userRegisterFormRef = ref();
  const userServerModalVisible = ref(false);
  const selectUserId = ref();

  const gendPassword = (l: number): string => {
    const b =
      'QWERTYUIOPASDFGHJKLZXCVBNM[]qwertyuiop{}asdfghjklzxcvbnm1234567890';

    let password = '';

    for (let i = 0; i < l; i += 1) {
      password += b[rand(0, b.length - 1)];
    }
    return password;
  };

  const defaultForm = {
    user_id: '',
    username: '',
    nickname: '',
    role: 'user',
    role_id: 0,
    avatar: '',
    email: '',
    phone: '',
    password: '',
    gender: 'male',
    introduction: '',
  };
  const state = reactive({
    form: {
      ...defaultForm,
      password: gendPassword(10),
    },
  });
  const { form } = toRefs(state);

  const generateFormModel = () => {
    return {
      keyword: '',
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref<UserInfo[]>([]);
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
      name: t('userList.size.mini'),
      value: 'mini',
    },
    {
      name: t('userList.size.small'),
      value: 'small',
    },
    {
      name: t('userList.size.medium'),
      value: 'medium',
    },
    {
      name: t('userList.size.large'),
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

  const fetchData = async (
    params: QueryUserListReq = { page: 1, page_size: 20 }
  ) => {
    setLoading(true);

    try {
      const { data } = await queryUserList(params);

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

  const search = () => {
    fetchData({
      ...basePagination,
      ...formModel.value,
    } as unknown as QueryInstanceListReq);
  };

  const handleUserRegisterModal = (e: any, record: any) => {
    userRegisterFormRef.value.clearValidate();
    if (record) {
      form.value = { ...record };
    } else {
      form.value = { ...defaultForm, password: gendPassword(10) };
    }

    userRegisterModalVisible.value = true;
  };

  const handleRegisterUserModalCancel = () => {
    userRegisterModalVisible.value = false;
  };

  const handleSubmitUserRegisterForm = async () => {
    const ret = await userRegisterFormRef.value.validate();
    if (ret) {
      return false;
    }
    try {
      if (form.value.user_id !== '') {
        await adminUpdateUserInfo({
          ...form.value,
        });
      } else {
        await userRegister({
          ...form.value,
        });
      }
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

  const handleUserServerModal = (e: any, record: any) => {
    userServerModalVisible.value = true;
    selectUserId.value = record.user_id;
  };

  const handleUserServerModalCancel = () => {
    userServerModalVisible.value = false;
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
