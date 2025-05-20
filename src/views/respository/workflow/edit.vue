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
  import {
    Menu,
    Control,
    MiniMap,
    DndPanel,
    SelectionSelect,
    BpmnElement,
    BpmnXmlAdapter,
    Snapshot,
  } from '@logicflow/extension';
  import '@logicflow/extension/lib/style/index.css';

  import { onMounted, ref } from 'vue';

  const minimapVisible = ref(false);
  const gridVisible = ref(false);

  const colorfulTheme = {
    baseNode: {
      fill: '#fefaec',
      stroke: '#625772',
      strokeWidth: 2,
    },
    baseEdge: {
      stroke: '#625772',
      strokeWidth: 2,
    },
    rect: {
      fill: '#fefaec',
      stroke: '#f38181',
      strokeWidth: 2,
    },
    circle: {
      fill: '#fefaec',
      stroke: '#a9eee6',
      properties: {
        r: 20,
      },
      strokeWidth: 2,
    },
    diamond: {
      fill: '#fefaec',
      stroke: '#fce38a',
      strokeWidth: 2,
    },
    ellipse: {
      fill: '#eaffd0',
      stroke: '#95e1d3',
      strokeWidth: 2,
    },
    polygon: {
      fill: '#fce38a',
      stroke: '#f38181',
      strokeWidth: 2,
    },
    line: {
      stroke: '#2d4059',
      strokeWidth: 2,
    },
    polyline: {
      stroke: '#ff7e67',
      strokeWidth: 2,
      // strokeDasharray: '5,5',
    },
    bezier: {
      stroke: '#c86b85',
      strokeWidth: 2,
      // strokeDasharray: '10,10',
    },
    anchorLine: {
      stroke: '#ffc93c',
      strokeWidth: 2,
      // strokeDasharray: '15,15',
    },
    text: {
      color: '#ff6f3c',
      fontSize: 14,
    },
    nodeText: {
      color: '#7e6bc4',
      fontSize: 14,
      fontWeight: 800,
    },
    edgeText: {
      color: '#ffaa64',
      fontSize: 14,
    },
    inputText: {
      color: '#ffaa64',
      background: 'transparent',
      fontSize: 14,
    },
    anchor: {
      fill: '#ffaa64',
      stroke: '#fff5a5',
    },
    arrow: {
      stroke: '#f8b595',
      strokeWidth: 1,
    },
    snapline: {
      stroke: '#f67280',
      strokeWidth: 1,
    },
    rotateControl: {
      fill: '#f8b595',
      stroke: '#6c5b7c',
    },
    resizeControl: {
      fill: '#a4e5d9',
      stroke: '#649dad',
    },
    resizeOutline: {
      stroke: '#a4e5d9',
    },
    edgeAdjust: {
      fill: '#fb929e',
      stroke: '#fff6f6',
    },
    outline: {
      hover: {
        stroke: '#7098da',
      },
      stroke: '#a393eb',
      strokeWidth: 2,
    },
    edgeAnimation: {},
  };
  const darkTheme = {
    baseNode: {
      fill: '#282c34',
      stroke: '#FF79C6',
      strokeWidth: 2,
    },
    baseEdge: {
      stroke: '#FF79C6',
      strokeWidth: 2,
    },
    rect: {
      fill: '#282c34',
      stroke: '#8dc87e',
      strokeWidth: 2,
    },
    circle: {
      fill: '#282c34',
      stroke: '#62b2eb',
      strokeWidth: 4,
    },
    diamond: {
      fill: '#282c34',
      stroke: '#ec5c72',
      strokeWidth: 4,
    },
    ellipse: {
      fill: '#282c34',
      stroke: '#FFB86C',
      strokeWidth: 4,
    },
    polygon: {
      fill: '#282c34',
      stroke: '#cd67d5',
      strokeWidth: 4,
    },
    line: {
      stroke: '#FF2222',
      strokeWidth: 2,
    },
    polyline: {
      stroke: '#1B2B34',
      strokeWidth: 2,
      strokeDasharray: '5,5',
    },
    bezier: {
      stroke: '#282A36',
      strokeWidth: 2,
      strokeDasharray: '10,10',
    },
    anchorLine: {
      stroke: '#DCDCAA',
      strokeWidth: 8,
      strokeDasharray: '15,15',
    },
    text: {
      color: '#90549b',
      fontSize: 14,
    },
    nodeText: {
      color: '#D4D4D4',
      fontSize: 14,
      fontWeight: 800,
    },
    edgeText: {
      color: '#D4D4D4',
      fontSize: 14,
    },
    inputText: {
      color: '#CE9178',
      background: 'transparent',
      fontSize: 14,
    },
    anchor: {
      fill: '#282c34',
      stroke: '#D7BA7D',
    },
    arrow: {
      stroke: '#FF6600',
      strokeWidth: 1,
    },
    snapline: {
      stroke: '#666666',
      strokeWidth: 1,
    },
    rotateControl: {
      fill: '#282c34',
      stroke: '#FF79C6',
    },
    resizeControl: {
      fill: '#282c34',
      stroke: '#D7BA7D',
    },
    resizeOutline: {
      stroke: '#FF6600',
    },
    edgeAdjust: {
      fill: '#fb929e',
      stroke: '#fff6f6',
    },
    outline: {
      hover: {
        stroke: '#FF6600',
      },
      stroke: '#FF007F',
      strokeWidth: 2,
    },
    edgeAnimation: {},
  };

  const container: any = ref(null);

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
      themes: colorfulTheme,
      isSilentMode: false,
      stopScrollGraph: true,
      stopZoomGraph: true,
      container: container.value,
      grid: false,
      multipleSelectKey: 'shift',
      // disabledTools: ['multipleSelect'],
      autoExpand: true,
      adjustEdgeStartAndEnd: true,
      allowRotate: true,
      edgeTextEdit: true,
      keyboard: {
        enabled: true,
      },
      animation: true,
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
        return 'bezier';
        // 限制'rect', 'diamond', 'polygon'节点的连线为贝塞尔曲线
        // if (['rect', 'diamond', 'polygon'].includes(sourceNode.type))
        //   return 'bezier';
        // return 'polyline';
      },
      plugins: [
        BpmnElement,
        BpmnXmlAdapter,
        DndPanel,
        SelectionSelect,
        Control,
        MiniMap,
        Menu,
        Snapshot,
      ],
    });

    lf.setTheme(colorfulTheme as any);

    (lf.extension.menu as any).addMenuConfig({
      nodeMenu: [
        {
          text: '分享',
          callback() {
            alert('分享成功！');
          },
        },
        {
          text: '属性',
          callback(node: any) {
            alert(`
                节点id：${node.id}
                节点类型：${node.type}
                节点坐标：(x: ${node.x}, y: ${node.y})
              `);
          },
        },
      ],
      edgeMenu: [
        {
          text: '属性',
          callback(edge: any) {
            const {
              id,
              type,
              startPoint,
              endPoint,
              sourceNodeId,
              targetNodeId,
            } = edge;
            alert(`
                边id：${id}
                边类型：${type}
                边起点坐标：(startPoint: [${startPoint.x}, ${startPoint.y}])
                边终点坐标：(endPoint: [${endPoint.x}, ${endPoint.y}])
                源节点id：${sourceNodeId}
                目标节点id：${targetNodeId}
              `);
          },
        },
      ],
      graphMenu: [
        {
          text: '网格',
          callback() {
            if (gridVisible.value) {
              gridVisible.value = false;
              lf.graphModel.updateGridOptions({ visible: false });
            } else {
              gridVisible.value = true;
              lf.graphModel.updateGridOptions({ visible: true });
            }
          },
        },
      ],
    });

    (lf.extension.control as Control).addItem({
      key: 'mini-map',
      iconClass: 'custom-minimap',
      title: '导航',
      text: '导航',

      onClick: (lf, ev) => {
        if (!minimapVisible.value) {
          minimapVisible.value = true;
          (lf.extension.miniMap as MiniMap).show();
        } else {
          minimapVisible.value = false;
          (lf.extension.miniMap as MiniMap).hide();
        }
      },
    });

    (lf.extension.control as Control).addItem({
      key: 'reset-translate',
      iconClass: 'reset-translate',
      title: '',
      text: '还原',
      onClick: (lf, ev) => {
        lf.resetTranslate();
      },
    });
    (lf.extension.control as Control).addItem({
      key: 'reset-translate',
      iconClass: 'reset-translate',
      title: '',
      text: '导出',
      onClick: (lf, ev) => {
        lf.getSnapshot('流程图');
      },
    });

    lf.setPatternItems([
      {
        label: '选区',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAAOVJREFUOBGtVMENwzAIjKP++2026ETdpv10iy7WFbqFyyW6GBywLCv5gI+Dw2Bluj1znuSjhb99Gkn6QILDY2imo60p8nsnc9bEo3+QJ+AKHfMdZHnl78wyTnyHZD53Zzx73MRSgYvnqgCUHj6gwdck7Zsp1VOrz0Uz8NbKunzAW+Gu4fYW28bUYutYlzSa7B84Fh7d1kjLwhcSdYAYrdkMQVpsBr5XgDGuXwQfQr0y9zwLda+DUYXLaGKdd2ZTtvbolaO87pdo24hP7ov16N0zArH1ur3iwJpXxm+v7oAJNR4JEP8DoAuSFEkYH7cAAAAASUVORK5CYII=',
        callback: () => {
          lf.current.openSelectionSelect();
          lf.current.once('selection:selected', () => {
            lf.current.closeSelectionSelect();
          });
        },
      },
      {
        type: 'bpmn:startEvent',
        label: '开始',
        text: '开始',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAAnBJREFUOBGdVL1rU1EcPfdGBddmaZLiEhdx1MHZQXApraCzQ7GKLgoRBxMfcRELuihWKcXFRcEWF8HBf0DdDCKYRZpnl7p0svLe9Zzbd29eQhTbC8nv+9zf130AT63jvooOGS8Vf9Nt5zxba7sXQwODfkWpkbjTQfCGUd9gIp3uuPP8bZ946g56dYQvnBg+b1HB8VIQmMFrazKcKSvFW2dQTxJnJdQ77urmXWOMBCmXM2Rke4S7UAW+/8ywwFoewmBps2tu7mbTdp8VMOkIRAkKfrVawalJTtIliclFbaOBqa0M2xImHeVIfd/nKAfVq/LGnPss5Kh00VEdSzfwnBXPUpmykNss4lUI9C1ga+8PNrBD5YeqRY2Zz8PhjooIbfJXjowvQJBqkmEkVnktWhwu2SM7SMx7Cj0N9IC0oQXRo8xwAGzQms+xrB/nNSUWVveI48ayrFGyC2+E2C+aWrZHXvOuz+CiV6iycWe1Rd1Q6+QUG07nb5SbPrL4426d+9E1axKjY3AoRrlEeSQo2Eu0T6BWAAr6COhTcWjRaYfKG5csnvytvUr/WY4rrPMB53Uo7jZRjXaG6/CFfNMaXEu75nG47X+oepU7PKJvvzGDY1YLSKHJrK7vFUwXKkaxwhCW3u+sDFMVrIju54RYYbFKpALZAo7sB6wcKyyrd+aBMryMT2gPyD6GsQoRFkGHr14TthZni9ck0z+Pnmee460mHXbRAypKNy3nuMdrWgVKj8YVV8E7PSzp1BZ9SJnJAsXdryw/h5ctboUVi4AFiCd+lQaYMw5z3LGTBKjLQOeUF35k89f58Vv/tGh+l+PE/wG0rgfIUbZK5AAAAABJRU5ErkJggg==',
      },
      // {
      //   type: 'bpmn:userTask',
      //   label: '用户任务',
      //   text: '用户任务',
      //   icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAEFVwZaAAAABGdBTUEAALGPC/xhBQAAAqlJREFUOBF9VM9rE0EUfrMJNUKLihGbpLGtaCOIR8VjQMGDePCgCCIiCNqzCAp2MyYUCXhUtF5E0D+g1t48qAd7CCLqQUQKEWkStcEfVGlLdp/fm3aW2QQdyLzf33zz5m2IsAZ9XhDpyaaIZkTS4ASzK41TFao88GuJ3hsr2pAbipHxuSYyKRugagICGANkfFnNh3HeE2N0b3nN2cgnpcictw5veJIzxmDamSlxxQZicq/mflxhbaH8BLRbuRwNtZp0JAhoplVRUdzmCe/vO27wFuuA3S5qXruGdboy5/PRGFsbFGKo/haRtQHIrM83bVeTrOgNhZReWaYGnE4aUQgTJNvijJFF4jQ8BxJE5xfKatZWmZcTQ+BVgh7s8SgPlCkcec4mGTmieTP4xd7PcpIEg1TX6gdeLW8rTVMVLVvb7ctXoH0Cydl2QOPJBG21STE5OsnbweVYzAnD3A7PVILuY0yiiyDwSm2g441r6rMSgp6iK42yqroI2QoXeJVeA+YeZSa47gZdXaZWQKTrG93rukk/l2Al6Kzh5AZEl7dDQy+JjgFahQjRopSxPbrbvK7GRe9ePWBo1wcU7sYrFZtavXALwGw/7Dnc50urrHJuTPSoO2IMV3gUQGNg87IbSOIY9BpiT9HV7FCZ94nPXb3MSnwHn/FFFE1vG6DTby+r31KAkUktB3Qf6ikUPWxW1BkXSPQeMHHiW0+HAd2GelJsZz1OJegCxqzl+CLVHa/IibuHeJ1HAKzhuDR+ymNaRFM+4jU6UWKXorRmbyqkq/D76FffevwdCp+jN3UAN/C9JRVTDuOxC/oh+EdMnqIOrlYteKSfadVRGLJFJPSB/ti/6K8f0CNymg/iH2gO/f0DwE0yjAFO6l8JaR5j0VPwPwfaYHqOqrCI319WzwhwzNW/aQAAAABJRU5ErkJggg==',
      // },
      {
        type: 'bpmn:serviceTask',
        label: '任务',
        text: '任务',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAEFVwZaAAAABGdBTUEAALGPC/xhBQAAAqlJREFUOBF9VM9rE0EUfrMJNUKLihGbpLGtaCOIR8VjQMGDePCgCCIiCNqzCAp2MyYUCXhUtF5E0D+g1t48qAd7CCLqQUQKEWkStcEfVGlLdp/fm3aW2QQdyLzf33zz5m2IsAZ9XhDpyaaIZkTS4ASzK41TFao88GuJ3hsr2pAbipHxuSYyKRugagICGANkfFnNh3HeE2N0b3nN2cgnpcictw5veJIzxmDamSlxxQZicq/mflxhbaH8BLRbuRwNtZp0JAhoplVRUdzmCe/vO27wFuuA3S5qXruGdboy5/PRGFsbFGKo/haRtQHIrM83bVeTrOgNhZReWaYGnE4aUQgTJNvijJFF4jQ8BxJE5xfKatZWmZcTQ+BVgh7s8SgPlCkcec4mGTmieTP4xd7PcpIEg1TX6gdeLW8rTVMVLVvb7ctXoH0Cydl2QOPJBG21STE5OsnbweVYzAnD3A7PVILuY0yiiyDwSm2g441r6rMSgp6iK42yqroI2QoXeJVeA+YeZSa47gZdXaZWQKTrG93rukk/l2Al6Kzh5AZEl7dDQy+JjgFahQjRopSxPbrbvK7GRe9ePWBo1wcU7sYrFZtavXALwGw/7Dnc50urrHJuTPSoO2IMV3gUQGNg87IbSOIY9BpiT9HV7FCZ94nPXb3MSnwHn/FFFE1vG6DTby+r31KAkUktB3Qf6ikUPWxW1BkXSPQeMHHiW0+HAd2GelJsZz1OJegCxqzl+CLVHa/IibuHeJ1HAKzhuDR+ymNaRFM+4jU6UWKXorRmbyqkq/D76FffevwdCp+jN3UAN/C9JRVTDuOxC/oh+EdMnqIOrlYteKSfadVRGLJFJPSB/ti/6K8f0CNymg/iH2gO/f0DwE0yjAFO6l8JaR5j0VPwPwfaYHqOqrCI319WzwhwzNW/aQAAAABJRU5ErkJggg==',
      },
      {
        type: 'bpmn:exclusiveGateway',
        label: '条件',
        text: '条件',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAAHeEJUAAAAABGdBTUEAALGPC/xhBQAAAvVJREFUOBGNVEFrE0EU/mY3bQoiFlOkaUJrQUQoWMGePLX24EH0IIoHKQiCV0G8iE1covgLiqA/QTzVm1JPogc9tIJYFaQtlhQxqYjSpunu+L7JvmUTU3AgmTfvffPNN++9WSA1DO182f6xwILzD5btfAoQmwL5KJEwiQyVbSVZ0IgRyV6PTpIJ81E5ZvqfHQR0HUOBHW4L5Et2kQ6Zf7iAOhTFAA8s0pEP7AXO1uAA52SbqGk6h/6J45LaLhO64ByfcUzM39V7ZiAdS2yCePPEIQYvTUHqM/n7dgQNfBKWPjpF4ISk8q3J4nB11qw6X8l+FsF3EhlkEMfrjIer3wJTLwS2aCNcj4DbGxXTw00JmAuO+Ni6bBxVUCvS5d9aa04+so4pHW5jLTywuXAL7jJ+D06sl82Sgl2JuVBQn498zkc2bGKxULHjCnSMadBKYDYYHAtsby1EQ5lNGrQd4Y3v4Zo0XdGEmDno46yCM9Tk+RiJmUYHS/aXHPNTcjxcbTFna000PFJHIVZ5lFRqRpJWk9/+QtlOUYJj9HG5pVFEU7zqIYDVsw2s+AJaD8wTd2umgSCCyUxgGsS1Y6TBwXQQTFuZaHcd8gAGioE90hlsY+wMcs30RduYtxanjMGal8H5dMW67dmT1JFtYUEe8LiQLRsPZ6IIc7A4J5tqco3T0pnv/4u0kyzrYUq7gASuEyI8VXKvB9Odytv6jS/PNaZBln0nioJG/AVQRZvApOdhjj3Jt8QC8Im09SafwdBdvIpztpxWxpeKCC+EsFdS8DCyuCn2munFpL7ctHKp+Xc5cMybeIyMAN33SPL3ZR9QV1XVwLyzHm6Iv0/yeUuUb7PPlZC4D4HZkeu6dpF4v9j9MreGtMbxMMRLIcjJic9yHi7WQ3yVKzZVWUr5UrViJvn1FfUlwe/KYVfYyWRLSGNu16hR01U9IacajXPei0wx/5BqgInvJN+MMNtNme7ReU9SBbgntovn0kKHpFg7UogZvaZiOue/q1SBo9ktHzQAAAAASUVORK5CYII=',
      },
      {
        type: 'bpmn:endEvent',
        label: '结束',
        text: '结束',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAA1BJREFUOBFtVE1IVUEYPXOf+tq40Y3vPcmFIdSjIorWoRG0ERWUgnb5FwVhYQSl72oUoZAboxKNFtWiwKRN0M+jpfSzqJAQclHo001tKkjl3emc8V69igP3znzfnO/M9zcDcKT67azmjYWTwl9Vn7Vumeqzj1DVb6cleQY4oAVnIOPb+mKAGxQmKI5CWNJ2aLPatxWa3aB9K7/fB+/Z0jUF6TmMlFLQqrkECWQzOZxYGjTlOl8eeKaIY5yHnFn486xBustDjWT6dG7pmjHOJd+33t0iitTPkK6tEvjxq4h2MozQ6WFSX/LkDUGfFwfhEZj1Auz/U4pyAi5Sznd7uKzznXeVHlI/Aywmk6j7fsUsEuCGADrWARXXwjxWQsUbIupDHJI7kF5dRktg0eN81IbiZXiTESic50iwS+t1oJgL83jAiBupLDCQqwziaWSoAFSeIR3P5Xv5az00wyIn35QRYTwdSYbz8pH8fxUUAtxnFvYmEmgI0wYXUXcCCSpeEVpXlsRhBnCEATxWylL9+EKCAYhe1NGstUa6356kS9NVvt3DU2fd+Wtbm/+lSbylJqsqkSm9CRhvoJVlvKPvF1RKY/FcPn5j4UfIMLn8D4UYb54BNsilTDXKnF4CfTobA0FpoW/LSp306wkXM+XaOJhZaFkcNM82ASNAWMrhrUbRfmyeI1FvRBTpN06WKxa9BK0o2E4Pd3zfBBEwPsv9sQBnmLVbLEIZ/Xe9LYwJu/Er17W6HYVBc7vmuk0xUQ+pqxdom5Fnp55SiytXLPYoMXNM4u4SNSCFWnrVIzKG3EGyMXo6n/BQOe+bX3FClY4PwydVhthOZ9NnS+ntiLh0fxtlUJHAuGaFoVmttpVMeum0p3WEXbcll94l1wM/gZ0Ccczop77VvN2I7TlsZCsuXf1WHvWEhjO8DPtyOVg2/mvK9QqboEth+7pD6NUQC1HN/TwvydGBARi9MZSzLE4b8Ru3XhX2PBxf8E1er2A6516o0w4sIA+lwURhAON82Kwe2iDAC1Watq4XHaGQ7skLcFOtI5lDxuM2gZe6WFIotPAhbaeYlU4to5cuarF1QrcZ/lwrLaCJl66JBocYZnrNlvm2+MBCTmUymPrYZVbjdlr/BxlMjmNmNI3SAAAAAElFTkSuQmCC',
      },
    ]);

    lf.render({});
  });
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 20px 20px;
  }
  .workflow-container {
    width: 100%;
    height: 680px;
  }
</style>
