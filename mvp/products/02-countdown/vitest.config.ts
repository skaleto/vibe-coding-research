import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  define: {
    __OTA_BACKEND_URL__: JSON.stringify('https://mvp-ota.workers.dev'),
    __GATEWAY_URL__: JSON.stringify('https://mvp-gateway.workers.dev'),
    __APP_ID__: JSON.stringify('io.countdown-pro.app'),
    __APP_VERSION__: JSON.stringify('0.0.0-test'),
  },
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test-setup.ts'],
  },
});
