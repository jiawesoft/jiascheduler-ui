import { mergeConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import baseConfig from './vite.config.base';

export default mergeConfig(
  {
    mode: 'development',
    server: {
      open: true,
      fs: {
        strict: true,
      },
      proxy: {
        '/api': {
          // target: 'http://192.168.1.51:9090',
          target: 'https://jiascheduler.iwannay.cn',
          changeOrigin: true,
        },
        '/terminal': {
          // target: 'ws://192.168.1.51:9090',
          target: 'wss://jiascheduler.iwannay.cn',
          changeOrigin: true,
          ws: true,
        },
      },
    },
    plugins: [
      eslint({
        cache: false,
        include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
        exclude: ['node_modules'],
      }),
    ],
  },
  baseConfig
);
