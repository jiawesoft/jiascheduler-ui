<template>
  <a-card
    class="general-card"
    :title="$t('workplace.quick.operation')"
    :header-style="{ paddingBottom: '0' }"
    :body-style="{ padding: '24px 20px 0 20px' }"
  >
    <!-- <template #extra>
      <a-link>{{ $t('workplace.quickOperation.setup') }}</a-link>
    </template> -->
    <a-row :gutter="8">
      <a-col
        v-for="link in links"
        :key="link.text"
        :span="8"
        class="wrapper"
        @click="handleClick(link.path)"
      >
        <div class="icon">
          <component :is="link.icon" />
        </div>
        <a-typography-paragraph class="text">
          {{ $t(link.text) }}
        </a-typography-paragraph>
      </a-col>
    </a-row>
    <a-divider class="split-line" style="margin: 0" />
  </a-card>
</template>

<script lang="ts" setup>
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const links = [
    {
      text: 'workplace.jobList',
      icon: 'icon-file',
      path: '/repository/job-list',
    },
    { text: 'workplace.server', icon: 'icon-storage', path: '/assets/server' },
    {
      text: 'workplace.jobBundle',
      icon: 'icon-unordered-list',
      path: '/repository/job-bundle-script-list',
    },
    {
      text: 'workplace.runList',
      icon: 'icon-send',
      path: '/run-status/run-list',
    },
    {
      text: 'workplace.execHistory',
      icon: 'icon-bookmark',
      path: '/run-status/exec-history',
    },
  ];

  const handleClick = (path: string) => {
    if (!path) return;
    router.push(path);
  };
</script>
