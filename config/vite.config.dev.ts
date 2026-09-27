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
          target: 'http://127.0.0.1:9090',
          changeOrigin: true,
        },
        // Streaming download: a plain poem route (an OpenAPI endpoint cannot
        // stream a response body), so it sits outside the /api prefix.
        '/file/sftp/tunnel/download/stream': {
          target: 'http://127.0.0.1:9090',
          changeOrigin: true,
        },
        '/terminal': {
          target: 'ws://127.0.0.1:9090',
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
