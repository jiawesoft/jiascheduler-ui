<template>
  <div class="container">
    <Breadcrumb :items="['menu.repository', 'menu.repository.jobList']" />
    <a-card class="general-card">
      <div class="workflow-container" ref="container"></div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import LogicFlow from '@logicflow/core';
  import '@logicflow/core/lib/style/index.css';
  import { onMounted, ref } from 'vue';

  const container: any = ref(null);

  const nodes = [
    {
      id: '21', // 节点ID，需要全局唯一，不传入内部会自动生成一个ID
      type: 'rect', // 节点类型，可以传入LogicFlow内置的7种节点类型，也可以注册自定义节点后传入自定义类型
      x: 100, // 节点形状中心在x轴位置
      y: 100, // 节点形状中心在y轴的位置
      text: 'Origin Usage-rect', // 节点文本
      properties: {
        // 自定义属性，用于存储需要这个节点携带的信息，可以传入宽高以重设节点的宽高
        width: 160,
        height: 80,
      },
    },
    {
      id: '50',
      type: 'circle',
      x: 300,
      y: 300,
      text: 'Origin Usage-circle',
      properties: {
        r: 60,
      },
    },
  ];

  const graphData = {
    nodes: [
      {
        id: 'node-1',
        type: 'rect',
        x: 100,
        y: 100,
        text: '矩形',
      },
      {
        id: 'node-2',
        type: 'circle',
        x: 300,
        y: 100,
        text: '圆形',
      },
      {
        id: 'node-3',
        type: 'ellipse',
        x: 300,
        y: 250,
        text: '椭圆',
      },
      {
        id: 'node-4',
        type: 'polygon',
        x: 100,
        y: 250,
        text: '多边形',
      },
      {
        id: 'node-5',
        type: 'diamond',
        x: 100,
        y: 400,
        text: '菱形',
      },
      {
        id: 'node-6',
        type: 'text',
        x: 300,
        y: 400,
        text: '文本',
      },
    ],
    edges: [
      // {
      //   id: 'rect-2-circle', // 边ID，性质与节点ID一样
      //   type: 'polyline', // 边类型
      //   sourceNodeId: '50', // 起始节点Id
      //   targetNodeId: '21', // 目标节点Id
      // },
    ],
  };

  onMounted(() => {
    const lf = new LogicFlow({
      isSilentMode: false,
      stopScrollGraph: true,
      stopZoomGraph: true,
      container: container.value,
      grid: true,
      multipleSelectKey: 'shift',
      disabledTools: ['multipleSelect'],
      autoExpand: true,
      adjustEdgeStartAndEnd: true,
      allowRotate: true,
      edgeTextEdit: true,
      keyboard: {
        enabled: true,
      },
      partial: true,
      // background: {
      //   color: '#FFFFFF',
      // },
      edgeTextDraggable: true,
      edgeType: 'bezier',
      idGenerator(type) {
        return `${type}_${Math.random()}`;
      },
      edgeGenerator: (sourceNode) => {
        // 限制'rect', 'diamond', 'polygon'节点的连线为贝塞尔曲线
        if (['rect', 'diamond', 'polygon'].includes(sourceNode.type))
          return 'bezier';
        return 'polyline';
      },
    });

    lf.render(graphData);
  });
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 20px 20px;
  }
  .workflow-container {
    width: 100%;
    height: 500px;
  }
</style>
