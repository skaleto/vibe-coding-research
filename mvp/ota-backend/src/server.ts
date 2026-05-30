/**
 * mvp-ota — Node.js HTTP entry point (@hono/node-server).
 *
 * Runs the Hono app on Aliyun ECS behind systemd. Configuration comes from
 * `process.env` (see types.ts::loadConfig): OSS endpoint/bucket/AK/SK, the
 * per-app + shared admin tokens, and DATA_DIR for manifest JSON files.
 *
 * Port: `PORT` env, default 8401.
 */

import { serve } from '@hono/node-server';
import { createApp } from './index.js';
import { loadConfig } from './types.js';

const DEFAULT_PORT = 8401;

function parsePort(value: string | undefined): number {
  if (!value) return DEFAULT_PORT;
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n > 0 && n < 65536 ? n : DEFAULT_PORT;
}

const config = loadConfig();
const port = parsePort(process.env.PORT);
const app = createApp(config);

serve({ fetch: app.fetch, port }, (info) => {
  // eslint-disable-next-line no-console
  console.log(`[mvp-ota] listening on http://0.0.0.0:${info.port} (DATA_DIR=${config.DATA_DIR})`);
});
