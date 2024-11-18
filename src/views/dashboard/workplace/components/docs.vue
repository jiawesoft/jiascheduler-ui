<template>
  <a-card
    class="general-card"
    :title="$t('workplace.docs')"
    :header-style="{ paddingBottom: 0 }"
    :body-style="{ paddingTop: 0 }"
    style="height: 166px"
  >
    <a-row>
      <a-col :span="11">
        <a-link
          href="https://github.com/jiawesoft/jiascheduler"
          icon
          target="_bank"
        >
          {{ $t('workplace.docs.userGuide') }}
        </a-link>
      </a-col>
      <a-col :span="13">
        <a-link href="/doc" icon target="_bank">
          {{ $t('workplace.docs.interfaceDocs') }}
        </a-link>
      </a-col>
    </a-row>
  </a-card>
</template>

<style lang="less" scoped>
  .arco-card-body .arco-link {
    margin: 10px 0;
    color: rgb(var(--gray-8));
  }
</style>
