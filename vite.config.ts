import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        historyApiFallback: true,
        proxy: {
          '/api/models': {
            target: 'https://artificialanalysis.ai',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/models/, '/api/v2/data/llms/models'),
            configure: (proxy, options) => {
              proxy.on('proxyReq', (proxyReq, req, res) => {
                proxyReq.setHeader('x-api-key', 'aa_GdugNjckGYnOcsOJfZYLBVVCEKqnupUy');
              });
            }
          },
          '/api/exchange': {
            target: 'https://api.exchangerate-api.com',
            changeOrigin: true,
            rewrite: (path) => '/v4/latest/USD',
          }
        }
      },
      plugins: [
        wasm(),
        topLevelAwait(),
        react()
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      optimizeDeps: {
        exclude: ['tiktoken']
      }
    };
});
