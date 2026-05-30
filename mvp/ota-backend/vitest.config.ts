import { defineConfig } from 'vitest/config';

/**
 * Plain Node vitest (was @cloudflare/vitest-pool-workers).
 *
 * Manifest tests use a temp DATA_DIR (node:fs.mkdtemp); OSS presign tests mock
 * the `ali-oss` module so nothing ever hits the network. No miniflare / KV / R2
 * bindings are needed — the app is exercised via `createApp(config)` and Hono's
 * in-process `app.request()` / `app.fetch()`.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
