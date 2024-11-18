<template>
  <div class="container">
    <div class="left-side">
      <div class="panel">
        <Banner />
        <DataPanel
          :job-num="jobList.job_num"
          :running-num="jobList.running_num"
          :exec-succ-num="jobList.exec_succ_num"
          :exec-fail-num="jobList.exec_fail_num"
        />
        <!-- <ContentChart /> -->
      </div>
      <div class="panel tabs-panel" style="margin-top: 16px">
        <a-row>
          <a-col :span="24">
            <a-tabs
              default-active-key="default"
              type="line"
              size="medium"
              @change="changePanel"
            >
              <a-tab-pane key="default" :title="$t('job.type.default')">
                <a-grid :cols="24" :col-gap="10" :row-gap="10">
                  <a-grid-item
                    v-for="item in jobList?.rows"
                    :key="item.eid"
                    :span="{ xs: 12, sm: 8, md: 8, lg: 8, xl: 6, xxl: 6 }"
                  >
                    <JobData
                      :title="item.name"
                      :description="item.schedule_name"
                      :success-num="item.results[0].exec_succ_num"
                      :fail-num="item.results[0].exec_fail_num"
                      :time="item.results[0].last_start_time"
                    />
                  </a-grid-item>
                </a-grid>
                <a-skeleton v-if="loading" :animation="true">
                  <a-skeleton-line :rows="6" />
                </a-skeleton>
                <a-empty v-if="jobList?.rows.length === 0 && !loading">
                  <template #image>
                    <img class="empty-img" src="/src/assets/images/empty.png" />
                  </template>
                </a-empty>
              </a-tab-pane>
              <a-tab-pane key="bundle" :title="$t('job.type.bundle')">
                <template v-for="item in jobList?.rows" :key="item.eid">
                  <div class="card-title-header">
                    <a-space>
                      <template #split>
                        <a-divider direction="vertical" />
                      </template>
                      <div class="card-title">{{ item.name }}</div>
                      <div class="sub-title">{{ item.schedule_name }}</div>
                    </a-space>
                  </div>
                  <a-grid :cols="24" :col-gap="10" :row-gap="10">
                    <a-grid-item
                      v-for="result in item.results"
                      :key="result.eid"
                      :span="{ xs: 12, sm: 8, md: 8, lg: 8, xl: 6, xxl: 6 }"
                    >
                      <JobBundle
                        :title="result.name"
                        :info="result.info"
                        :success-num="result.exec_succ_num"
                        :fail-num="result.exec_fail_num"
                        :check-succ-num="result.check_succ_num"
                        :check-fail-num="result.check_fail_num"
                        :time="result.last_start_time"
                      />
                    </a-grid-item>
                  </a-grid>
                </template>
                <a-skeleton v-if="loading" :animation="true">
                  <a-skeleton-line :rows="6" />
                </a-skeleton>
                <a-empty v-if="jobList?.rows.length === 0 && !loading">
                  <template #image>
                    <img class="empty-img" src="/src/assets/images/empty.png" />
                  </template>
                </a-empty>
              </a-tab-pane>
            </a-tabs>
          </a-col>
        </a-row>
      </div>
    </div>
    <div class="right-side">
      <a-grid :cols="24" :row-gap="16">
        <a-grid-item :span="24">
          <div class="panel moduler-wrap">
            <QuickOperation />
          </div>
        </a-grid-item>
        <a-grid-item class="panel" :span="24">
          <Carousel />
        </a-grid-item>
        <a-grid-item class="panel" :span="24">
          <Docs />
        </a-grid-item>
      </a-grid>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { queryDashboardList, QueryDashboardRecord } from '@/api/dashboard';
  import useLoading from '@/hooks/loading';
  import Banner from './components/banner.vue';
  import DataPanel from './components/data-panel.vue';
  import JobData from './components/job-data.vue';
  import JobBundle from './components/job-bundle.vue';
  import QuickOperation from './components/quick-operation.vue';
  import Carousel from './components/carousel.vue';
  import Docs from './components/docs.vue';

  const { loading, setLoading } = useLoading();
  const jobList = ref<QueryDashboardRecord>({
    rows: [],
    exec_fail_num: 0,
    exec_succ_num: 0,
    job_num: 0,
    running_num: 0,
  });

  const fetchData = async (jobType: string | number) => {
    try {
      jobList.value.rows = [];
      setLoading(true);
      const { data } = await queryDashboardList({
        job_type: jobType,
        filter_schedule_history: [],
      });
      jobList.value = data;
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const changePanel = (jobType: string | number) => {
    fetchData(jobType);
  };

  fetchData('default');
</script>

<script lang="ts">
  export default {
    name: 'Dashboard', // If you want the include property of keep-alive to take effect, you must name the component
  };
</script>

<style lang="less" scoped>
  .container {
    background-color: var(--color-fill-2);
    padding: 16px 20px;
    padding-bottom: 0;
    display: flex;
  }

  .left-side {
    flex: 1;
    overflow: auto;
  }

  .right-side {
    width: 280px;
    margin-left: 16px;
  }

  .panel {
    background-color: var(--color-bg-2);
    border-radius: 4px;
    overflow: auto;
  }
  :deep(.panel-border) {
    margin-bottom: 0;
    border-bottom: 1px solid rgb(var(--gray-2));
  }
  .moduler-wrap {
    border-radius: 4px;
    background-color: var(--color-bg-2);
    :deep(.text) {
      font-size: 12px;
      text-align: center;
      color: rgb(var(--gray-8));
    }

    :deep(.wrapper) {
      margin-bottom: 8px;
      text-align: center;
      cursor: pointer;

      &:last-child {
        .text {
          margin-bottom: 0;
        }
      }
      &:hover {
        .icon {
          color: rgb(var(--arcoblue-6));
          background-color: #e8f3ff;
        }
        .text {
          color: rgb(var(--arcoblue-6));
        }
      }
    }

    :deep(.icon) {
      display: inline-block;
      width: 32px;
      height: 32px;
      margin-bottom: 4px;
      color: rgb(var(--dark-gray-1));
      line-height: 32px;
      font-size: 16px;
      text-align: center;
      background-color: rgb(var(--gray-1));
      border-radius: 4px;
    }
  }
  .tabs-panel {
    :deep(.arco-tabs-content) {
      padding: 10px 0px;
      min-height: 355px;
      // background: rgb(var(--gray-2));
    }
    :deep(.arco-tabs-content-item) {
      padding: 0 15px 20px;
    }
  }
  .card-title-header {
    background: var(--color-bg-2);
    padding: 10px 0;
    .card-title {
      font-weight: 500;
      font-size: 15px;
      color: rgb(var(--gray-9));
    }
    .sub-title {
      font-size: 12px;
      color: rgb(var(--gray-6));
    }
  }
  .empty-img {
    width: 70px;
    height: 70px;
    margin-top: 20px;
  }
  @media (min-width: 1601px) {
    .tabs-panel {
      :deep(.arco-grid) {
        display: flex;
        flex-wrap: wrap;
      }
      :deep(.arco-grid-item) {
        max-width: 260px;
        min-width: 230px;
      }
    }
  }
  @media (min-width: 1920px) {
    .tabs-panel {
      :deep(.arco-grid) {
        display: flex;
        flex-wrap: wrap;
      }
      :deep(.arco-grid-item) {
        max-width: 260px;
        min-width: 214px;
      }
    }
  }
</style>

<style lang="less" scoped>
  // responsive
  .mobile {
    .container {
      display: block;
    }
    .right-side {
      // display: none;
      width: 100%;
      margin-left: 0;
      margin-top: 16px;
    }
  }
</style>
