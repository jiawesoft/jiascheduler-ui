<template>
  <a-spin :loading="loading" style="width: 100%">
    <div style="padding: 15px">
      <div
        style="margin-bottom: 10px; display: flex; justify-content: flex-start"
      >
        <a-button type="outline" @click="createTeam">{{
          $t('team.modal.addTitle')
        }}</a-button>
      </div>

      <a-list class="team-list-wrapper">
        <a-list-item
          v-for="item in teamList"
          :key="item.name"
          :class="{ active: teamIndex === item.id }"
          @click="switchTeam(item)"
        >
          <a-list-item-meta :title="item.name">
            <template #avatar>
              <icon-user-group />
            </template>
          </a-list-item-meta>
          <template #actions>
            <icon-edit @click="editTeam(item)" />
            <icon-delete @click="removeTeam(item)" />
          </template>
        </a-list-item>
      </a-list>
    </div>

    <!-- 新增、编辑团队 -->
    <a-modal
      ref="teamModelInstanceFormRef"
      v-model:visible="teamModalvisible"
      title-align="start"
      style="width: auto"
      :draggable="true"
      width="40%"
      hide-cancel
      @before-ok="handleTeamExecutorForm"
      @cancel="handleTeamCancel"
    >
      <template #title>
        {{
          modelType === 'add'
            ? $t('team.modal.addTitle')
            : $t('team.modal.editTitle')
        }}</template
      >
      <a-form ref="saveTeamFormRef" :model="teamForm" :auto-label-width="true">
        <a-form-item
          field="name"
          :label="$t('team.modal.teamName')"
          :rules="[
            {
              required: true,
            },
          ]"
        >
          <a-input
            v-model="teamForm.name"
            :placeholder="$t('team.modal.teamName')"
          />
        </a-form-item>

        <a-form-item field="info" :label="$t('team.modal.teamInfo')">
          <a-textarea
            v-model="teamForm.info"
            :placeholder="$t('team.modal.teamInfo')"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-spin>
</template>

<script lang="ts" setup>
  import { ref, reactive, toRefs, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import { useAppStore } from '@/store';
  import { TeamListRes, addTeam, removeFile } from '@/api/team';
  import { Message } from '@arco-design/web-vue';

  const appStore = useAppStore();

  const teamList = computed(() => {
    return appStore.getTeamList;
  });
  const teamIndex = computed(() => {
    return appStore.currentTeamId;
  });

  const state = reactive({
    teamForm: {
      name: '',
      info: '',
    },
  });
  const { teamForm } = toRefs(state);

  const saveTeamFormRef = ref();
  const modelType = ref('add');
  const editId = ref();

  const { loading } = useLoading(false);
  const { t } = useI18n();

  // 团队编辑、新增、删除
  const teamModalvisible = ref(false);
  const handleTeamExecutorForm = async () => {
    const ret = await saveTeamFormRef.value.validate();
    if (ret) {
      return false;
    }
    try {
      const params = modelType.value === 'edit' ? { id: editId.value } : {};

      const { data } = await addTeam({
        ...teamForm.value,
        ...params,
      });
      appStore.setTeamId(data.affected);
    } catch (err) {
      return false;
    }

    Message.success(t('form.submit.success'));
    appStore.queryTeamList({});

    return true;
  };

  const handleTeamCancel = () => {
    teamModalvisible.value = false;
  };
  const createTeam = () => {
    modelType.value = 'add';
    teamModalvisible.value = true;
  };
  const editTeam = (data: TeamListRes) => {
    modelType.value = 'edit';
    teamModalvisible.value = true;
    teamForm.value.name = data.name;
    teamForm.value.info = data.info || '';
    editId.value = data.id;
  };
  const removeTeam = async (data: TeamListRes) => {
    try {
      await removeFile({
        team_id: data.id,
      });
    } catch (err) {
      return false;
    }
    Message.success(t('form.submit.success'));
    appStore.queryTeamList({});

    return true;
  };

  const switchTeam = (data: TeamListRes) => {
    appStore.setTeamId(data.id);
  };
</script>

<style scoped lang="less">
  .team-list-wrapper {
    :deep(
        .arco-list-medium
          .arco-list-content-wrapper
          .arco-list-content
          > .arco-list-item
      ) {
      padding: 10px 12px;
      cursor: pointer;
    }
    .active {
      background: var(--color-fill-2);
      color: rgb(var(--primary-6));
      :deep(.arco-list-item-meta-title) {
        color: rgb(var(--primary-6));
      }
    }
    :deep(.arco-list-item-action > li:not(:last-child)) {
      margin-right: 10px;
    }
    :deep(.arco-list-item-action li) {
      margin-left: 15px;
    }
  }
</style>
