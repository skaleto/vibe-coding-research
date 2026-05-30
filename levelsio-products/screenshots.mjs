// Snapshot levelsio's personal site + product portfolio.
// Desktop @ 1280x800 + iPhone 14 Pro mobile view for selected products.

import { chromium, devices } from '/Users/bytedance/Documents/ai-baby-growth-companion/node_modules/playwright/index.mjs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const OUT = '/Users/bytedance/Documents/research/levelsio-products/screenshots';

const SITES = [
  { id: 'levels-io',    url: 'https://levels.io',        label: '个人主页',         mobile: false },
  { id: 'photoai',      url: 'https://photoai.com',      label: 'PhotoAI 主力产品', mobile: true  },
  { id: 'interiorai',   url: 'https://interiorai.com',   label: 'Interior AI',     mobile: false },
  { id: 'fly-pieter',   url: 'https://fly.pieter.com',   label: 'Fly · vibe-coded 飞行游戏', mobile: false },
  { id: 'nomadlist',    url: 'https://nomadlist.com',    label: 'Nomad List',      mobile: false },
  { id: 'remoteok',     url: 'https://remoteok.com',     label: 'Remote OK',       mobile: false },
  { id: 'hoodmaps',     url: 'https://hoodmaps.com',     label: 'HoodMaps',        mobile: false },
  { id: 'jam-pieter',   url: 'https://jam.pieter.com',   label: 'Vibe Coding Game Jam', mobile: false },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const site of SITES) {
    // Desktop screenshot
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'en-US' });
      const page = await ctx.newPage();
      const file = path.join(OUT, `${site.id}-desktop.png`);
      let ok = true, err = '';
      try {
        await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3500); // let lazy images load
        await page.screenshot({ path: file, fullPage: false }); // viewport only to keep file readable
        console.log(`OK desktop ${site.id} -> ${file}`);
      } catch (e) {
        ok = false; err = e.message;
        // attempt last screenshot even on timeout
        try { await page.screenshot({ path: file, fullPage: false }); } catch {}
        console.log(`WARN desktop ${site.id}: ${err.slice(0,90)}`);
      }
      results.push({ id: site.id, label: site.label, url: site.url, viewport: 'desktop', file, ok, err });
      await ctx.close();
    }

    // Mobile screenshot (optional)
    if (site.mobile) {
      const iPhone = devices['iPhone 14 Pro'] || devices['iPhone 13'];
      const ctx = await browser.newContext({ ...iPhone, locale: 'en-US' });
      const page = await ctx.newPage();
      const file = path.join(OUT, `${site.id}-mobile.png`);
      let ok = true, err = '';
      try {
        await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3500);
        await page.screenshot({ path: file, fullPage: false });
        console.log(`OK mobile  ${site.id} -> ${file}`);
      } catch (e) {
        ok = false; err = e.message;
        try { await page.screenshot({ path: file, fullPage: false }); } catch {}
        console.log(`WARN mobile  ${site.id}: ${err.slice(0,90)}`);
      }
      results.push({ id: site.id, label: site.label, url: site.url, viewport: 'mobile', file, ok, err });
      await ctx.close();
    }
  }

  await browser.close();
  console.log('\n=== summary ===');
  for (const r of results) {
    console.log(`  ${r.ok ? '✓' : '✗'} ${r.viewport.padEnd(7)} ${r.id.padEnd(15)} ${r.url}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
