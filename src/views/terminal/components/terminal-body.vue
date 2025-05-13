<template>
  <div
    id="terminal-body"
    :style="{
      width,
      height,
      background: themeConfig.terminalBackground,
    }"
    @focusin="handleFocus"
  >
    <div ref="terminalRef" class="terminal" />
  </div>
</template>

<script lang="ts" setup>
  import '@xterm/xterm/css/xterm.css';
  import { ITheme, Terminal } from '@xterm/xterm';
  import { FitAddon } from '@xterm/addon-fit';
  //   import { SearchAddon } from 'xterm-addon-search';
  import { WebLinksAddon } from '@xterm/addon-web-links';
  import {
    ref,
    nextTick,
    reactive,
    onMounted,
    onBeforeUnmount,
    watch,
  } from 'vue';
  //   import TerminalSearch from './TerminalSearch.vue';
  import { debounce } from 'lodash';

  import { useEventListener } from '@vueuse/core';
  import { useAppStore } from '@/store';
  import themeConfig from './theme-config';
  import TerminalStatus from './common';

  // "xterm": "^5.3.0",
  //     "xterm-addon-fit": "^0.8.0",
  //     "xterm-addon-search": "^0.13.0",
  //     "xterm-addon-web-links": "^0.9.0"

  const props = defineProps({
    /**
     * 初始化执行命令
     */
    cmd: { type: String },
    /**
     * 连接url
     */
    ip: {
      type: String,
    },
    instanceId: {
      type: String,
      default: '',
    },
    /**
     * 高度
     */
    height: {
      type: [String, Number],
      default: '100%',
    },
    width: {
      type: [String, Number],
      default: '100%',
    },
    terminal: {
      type: Object,
    },
  });

  const appStore = useAppStore();

  const emit = defineEmits(['statusChange', 'focusTerminal']);

  const terminalRef: any = ref(null);
  const terminalSearchRef: any = ref(null);

  const handleFocus = () => {
    emit('focusTerminal', props.terminal);
  };

  // 终端实例
  let term: Terminal;
  let socket: WebSocket;
  let pingInterval: any;

  const state = reactive({
    // 插件
    addon: {
      fit: null as any,
      // search: null as any,
      weblinks: null as any,
    },
    status: TerminalStatus.NoConnected,
  });

  function closeSocket() {
    // 关闭 websocket
    if (socket && socket.readyState === 1) {
      socket.close();
    }

    // 清除 ping
    if (pingInterval) {
      clearInterval(pingInterval);
    }
  }

  function close() {
    console.log('in terminal body close');
    closeSocket();
    if (term) {
      state.addon.fit.dispose();
      state.addon.weblinks.dispose();
      term.dispose();
    }
  }

  const resize = () => {
    nextTick(() => {
      state.addon.fit.fit();
    });
  };

  const send = (msg: any) => {
    if (state.status === TerminalStatus.Connected) {
      socket?.send(JSON.stringify(msg));
    }
  };

  enum MsgType {
    Resize = 1,
    Data = 2,
    Ping = 3,
  }

  const sendResize = (cols: number, rows: number) => {
    send({
      type: MsgType.Resize,
      cols,
      rows,
    });
  };

  const sendPing = () => {
    send({
      type: MsgType.Ping,
      msg: 'ping',
    });
  };

  function sendCmd(key: any) {
    send({
      type: MsgType.Data,
      msg: key,
    });
  }
  const focus = () => {
    setTimeout(() => term.focus(), 100);
  };

  /**
   * 连接成功
   */
  const onConnected = () => {
    // 注册心跳
    pingInterval = setInterval(sendPing, 15000);

    // 注册 terminal 事件
    term.onResize((event) => sendResize(event.cols, event.rows));
    term.onData((event) => sendCmd(event));

    // 注册自定义快捷键
    term.attachCustomKeyEventHandler((event: KeyboardEvent) => {
      // 注册搜索键 ctrl + f
      if (
        event.key === 'f' &&
        (event.ctrlKey || event.metaKey) &&
        event.type === 'keydown'
      ) {
        event.preventDefault();
        terminalSearchRef.value.open();
      }

      return true;
    });

    state.status = TerminalStatus.Connected;

    // 注册窗口大小监听器
    useEventListener('resize', debounce(resize, 400));

    focus();

    // 如果有初始要执行的命令，则发送执行命令
    if (props.cmd) {
      sendCmd(`${props.cmd} \r`);
    }
    // 校正窗体
    sendResize(term?.cols, term?.rows);
  };
  function getMessage(msg: any) {
    // msg.data是真正后端返回的数据
    term.write(msg.data);
  }

  function initSocket() {
    if (props.ip) {
      // const namespace = route.query.namespace || 'default';
      // const currentEnv = import.meta.env.VITE_APP_ENV;
      const currentProtocol = window.location.protocol;
      const wsProtocol = currentProtocol.includes('https') ? 'wss:' : 'ws:';
      // const socketUrl = `${wsProtocol}//${window.location.host}/terminal/webssh/${props.ip}?rows=${term?.rows}&cols=${term?.cols}`;
      const socketUrl = `${wsProtocol}//${window.location.host}/terminal/tunnel/${props.instanceId}?rows=${term?.rows}&cols=${term?.cols}`;

      // const socketUrl = `${props.socketUrl}?rows=${term?.rows}&cols=${term?.cols}`;
      socket = new WebSocket(socketUrl);
    }

    // 监听socket连接
    socket.onopen = () => {
      onConnected();
    };

    // 监听socket错误信息
    socket.onerror = (e: Event) => {
      term.writeln('\r\n\x1b[31mNotice: Connection error...');
      state.status = TerminalStatus.Error;
      console.log('Connection error', e);
    };

    socket.onclose = (e: CloseEvent) => {
      term.writeln('\r\n\x1b[31mNotice: Connection is closed...');
      console.log('terminal socket close...', e.reason);
      const currentNum = appStore.connect_number;
      appStore.setConnectNumber(currentNum - 1);
      // 清除 ping
      if (pingInterval) clearInterval(pingInterval);
      state.status = TerminalStatus.Disconnected;
    };

    // 监听socket消息
    socket.onmessage = getMessage;
  }

  function init() {
    if (term) {
      close();
    }
    term = new Terminal({
      fontSize: themeConfig.terminalFontSize || 15,
      fontWeight: 'normal',
      fontFamily: 'monospace, monaco, Consolas, Lucida Console',
      cursorBlink: true,
      disableStdin: false,
      allowProposedApi: true,
      fastScrollModifier: 'ctrl',
      theme: {
        foreground: themeConfig.terminalForeground || '#7e9192', // 字体
        background: themeConfig.terminalBackground || '#002833', // 背景色
        cursor: themeConfig.terminalCursor || '#268F81', // 设置光标
        // cursorAccent: "red",  // 光标停止颜色
      } as ITheme,
    });
    term.open(terminalRef.value);

    // 注册自适应组件
    const fitAddon = new FitAddon();
    state.addon.fit = fitAddon;
    term.loadAddon(fitAddon);
    resize();

    // 注册搜索组件
    // const searchAddon = new SearchAddon();
    // state.addon.search = searchAddon;
    // term.loadAddon(searchAddon);

    // 注册 url link组件
    const weblinks = new WebLinksAddon();
    state.addon.weblinks = weblinks;
    term.loadAddon(weblinks);

    // 初始化websocket
    initSocket();
  }

  // 自适应终端
  const fitTerminal = () => {
    resize();
  };

  const selectedTerminal = (value: boolean) => {
    if (value) {
      term.options.theme = {
        background: themeConfig.terminalBackground || '#002833',
      };
    } else {
      term.options.theme = {
        background: 'rgb(40,40,40)',
      };
    }
  };

  const clear = () => {
    term.clear();
    term.clearSelection();
    term.focus();
  };

  const getStatus = (): TerminalStatus => {
    return state.status;
  };

  onMounted(() => {
    nextTick(() => {
      init();
    });
  });

  watch(
    () => state.status,
    () => {
      emit('statusChange', state.status);
    }
  );

  onBeforeUnmount(() => {
    close();
  });

  defineExpose({
    init,
    fitTerminal,
    focus,
    clear,
    close,
    getStatus,
    sendResize,
    resize,
    selectedTerminal,
    sendCmd,
  });
</script>

<style lang="less">
  #terminal-body {
    background: #212529;
    width: 100%;

    .terminal {
      width: 100%;
      height: 100%;

      .xterm .xterm-viewport {
        overflow-y: hidden;
      }
    }
  }
</style>
