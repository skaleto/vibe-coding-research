// Screenshot script: capture iPhone 14 Pro viewport for key pages of each MVP.
//
// Setup (one-time):
//   cd mvp && npm install            (installs playwright from mvp/package.json)
//   npx playwright install chromium  (downloads Chromium binary)
//
// Usage:
//   cd mvp && node scripts/screenshot.mjs <product-slug> <base-url>
//   cd mvp && npm run screenshot -- <product-slug> <base-url>

import { chromium, devices } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCT_DIR = path.resolve(__dirname, '..', 'products');

// Each shot:
//   name:     output file basename (no ext)
//   path:     URL path to navigate to
//   pre:      optional async fn(page) before screenshot (seed localStorage, click, etc)
//   wait:     extra ms to wait after goto for hydration / animation
const PLAN = {
  '01-ai-naming': [
    { name: '01-home',        path: '/',                                  wait: 1500 },
    { name: '02-baby-form',   path: '/baby',                              wait: 1500 },
    { name: '03-pricing',     path: '/pricing',                           wait: 1500 },
    {
      name: '04-baby-result',
      path: '/baby/result?surname=%E5%BC%A0&gender=female&vibe=%E6%B8%A9%E6%9F%94%E7%81%B5%E5%8A%A8',
      wait: 4500, // allow mock LLM
    },
  ],
  '02-countdown': [
    { name: '01-list-empty',  path: '/',                                  wait: 1500 },
    {
      name: '02-list-seeded',
      path: '/',
      wait: 1500,
      pre: async (page) => {
        await page.addInitScript(() => {
          const now = Date.now();
          const day = 24 * 60 * 60 * 1000;
          const data = {
            schemaVersion: 1,
            cards: [
              { id: 'demo1', title: '高考倒计时', emoji: '🎓', type: 'countdown', targetDate: new Date(now + 324 * day).toISOString(), theme: 'pink',    unit: 'day', note: '加油!', createdAt: now },
              { id: 'demo2', title: '我们的纪念日', emoji: '💍', type: 'countup',   targetDate: new Date(now - 87 * day).toISOString(),  theme: 'film',    unit: 'day', note: '',     createdAt: now },
              { id: 'demo3', title: '生日',         emoji: '🎂', type: 'countdown', targetDate: new Date(now + 12 * day).toISOString(),  theme: 'cyber',   unit: 'day', note: '',     createdAt: now },
            ],
            activeTheme: 'pink',
          };
          localStorage.setItem('countdown-pro:v1', JSON.stringify(data));
        });
      },
    },
    { name: '03-new',         path: '/new',                                wait: 1500 },
    { name: '04-settings',    path: '/settings',                           wait: 1500 },
  ],
  '03-plant-doctor': [
    { name: '01-home',        path: '/',                                  wait: 1500 },
    { name: '02-capture',     path: '/capture',                            wait: 1500 },
    { name: '03-my-plants',   path: '/my-plants',                          wait: 1500 },
    { name: '04-about',       path: '/about',                              wait: 1500 },
  ],
  '04-dream-journal': [
    {
      name: '01-home',
      path: '/',
      wait: 1500,
      pre: async (page) => {
        // 跳过 FirstLaunchGate 弹窗，让首页展示新 hero「让心理学帮你看见自己」
        await page.addInitScript(() => {
          localStorage.setItem('dream-journal:first-launch-ack', '1');
        });
      },
    },
    { name: '02-timeline',    path: '/timeline',                           wait: 1500 },
    { name: '03-crisis',      path: '/crisis',                             wait: 1500 },
    { name: '04-monthly',     path: '/monthly',                            wait: 1500 },
    { name: '05-about',       path: '/about',                              wait: 1500 },
  ],
  '05-pet-cards': [
    { name: '01-home',        path: '/',                                  wait: 1500 },
    { name: '02-history',     path: '/history',                            wait: 1500 },
    { name: '03-about',       path: '/about',                              wait: 1500 },
  ],
};

async function main() {
  const product = process.argv[2];
  const baseUrl = process.argv[3] || 'http://localhost:3000';
  const plan = PLAN[product];
  if (!plan) {
    console.error(`Unknown product: ${product}`);
    process.exit(1);
  }

  const outDir = path.join(PRODUCT_DIR, product, 'docs', 'screenshots');
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const iPhone = devices['iPhone 14 Pro'] || devices['iPhone 13'] || devices['iPhone 12'];

  const results = [];
  for (const shot of plan) {
    const context = await browser.newContext({
      ...iPhone,
      deviceScaleFactor: 2,
      locale: 'zh-CN',
    });
    const page = await context.newPage();

    // run pre hook (eg seed localStorage) before navigating
    if (shot.pre) await shot.pre(page);

    const url = baseUrl + shot.path;
    let ok = true;
    let err = '';
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });
      await page.waitForTimeout(shot.wait || 1500);
    } catch (e) {
      ok = false;
      err = e.message;
    }

    const file = path.join(outDir, `${shot.name}.png`);
    try {
      await page.screenshot({ path: file, fullPage: true });
      results.push({ name: shot.name, path: shot.path, file, ok, err });
      console.log(`[${product}] ${ok ? 'OK' : 'WARN'}  ${shot.path}  ->  ${shot.name}.png  ${err ? '(' + err.slice(0,80) + ')' : ''}`);
    } catch (e) {
      results.push({ name: shot.name, path: shot.path, file: null, ok: false, err: e.message });
      console.log(`[${product}] FAIL ${shot.path}: ${e.message}`);
    }

    await context.close();
  }

  await browser.close();

  // Write a manifest for downstream README insertion
  const manifest = path.join(outDir, '_manifest.json');
  await writeFile(manifest, JSON.stringify({ product, baseUrl, results, timestamp: new Date().toISOString() }, null, 2));
  console.log(`[${product}] manifest -> ${manifest}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
