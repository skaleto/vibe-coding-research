import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const productIndex = parseInt(env.VITE_PRODUCT_INDEX ?? '3', 10);
  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      cssCodeSplit: true,
      minify: 'esbuild',
    },
    server: {
      port: 3000 + productIndex,
      strictPort: true,
    },
    define: {
      __OTA_BACKEND_URL__: JSON.stringify(env.VITE_OTA_BACKEND_URL ?? 'https://mvp-ota.workers.dev'),
      __GATEWAY_URL__: JSON.stringify(env.VITE_GATEWAY_URL ?? 'https://mvp-gateway.workers.dev'),
      __APP_ID__: JSON.stringify(env.VITE_APP_ID ?? 'io.plantdoctor.app'),
      __APP_VERSION__: JSON.stringify(env.MOBILE_UPDATE_VERSION ?? '0.0.0-dev'),
    },
  };
});
