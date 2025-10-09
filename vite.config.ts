import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
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
                proxyReq.setHeader('x-api-key', env.ARTIFICIAL_ANALYSIS_API_KEY || '');
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
      build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              'chart-vendor': ['recharts'],
            }
          }
        }
      },
      plugins: [
        tailwindcss(),
        wasm(),
        topLevelAwait(),
        react()
      ],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.ARTIFICIAL_ANALYSIS_API_KEY': JSON.stringify(env.ARTIFICIAL_ANALYSIS_API_KEY || ''),
        'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY || ''),
        'process.env.AIMLAPI_KEY': JSON.stringify(env.AIMLAPI_KEY || ''),
        'process.env.HELICONE_API_KEY': JSON.stringify(env.HELICONE_API_KEY || '')
      },
      envPrefix: 'VITE_',
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
