// Full e2e test: 5 products against real Vite dev + gateway wrangler dev.
// Validates: route loads, real interactions, client→gateway fetch, compliance guards.

import { chromium, devices } from '/Users/bytedance/Documents/research/mvp/node_modules/playwright/index.mjs';

const GATEWAY_URL = 'http://localhost:8801';
const PRODUCTS = {
  '01-ai-naming':     { port: 3001 },
  '02-countdown':     { port: 3002 },
  '03-plant-doctor':  { port: 3003 },
  '04-dream-journal': { port: 3004 },
  '05-pet-cards':     { port: 3005 },
};

const results = [];
let browser;

function record(product, name, ok, detail = '') {
  results.push({ product, name, ok, detail });
  const icon = ok ? '✅' : '❌';
  console.log(`${icon} [${product}] ${name}${detail ? ' — ' + detail : ''}`);
}

async function withPage(prep) {
  const ctx = await browser.newContext({ ...devices['iPhone 14 Pro'], locale: 'zh-CN' });
  const page = await ctx.newPage();
  const calls = [];
  const responses = [];
  page.on('request', (req) => calls.push({ url: req.url(), method: req.method() }));
  page.on('response', (resp) => responses.push({ url: resp.url(), status: resp.status() }));
  await prep?.(page);
  return { ctx, page, calls, responses };
}

function gatewayCalls(calls, endpoint) {
  return calls.filter((c) => c.url.includes(GATEWAY_URL) && c.url.includes(endpoint));
}

// ───── 01 AI 起名 ─────
async function test01Naming() {
  const url = `http://localhost:${PRODUCTS['01-ai-naming'].port}`;

  // 1.1 Home loads
  {
    const { ctx, page } = await withPage();
    try {
      await page.goto(url + '/', { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1000);
      const body = await page.textContent('body');
      const has = body?.includes('起名') || body?.includes('诗经');
      record('01-ai-naming', 'home page loads with 起名 content', !!has, has ? '' : 'missing 起名 in body');
    } catch (e) { record('01-ai-naming', 'home page loads', false, e.message.slice(0, 80)); }
    await ctx.close();
  }

  // 1.2 Submit baby form → gateway fetch
  {
    const { ctx, page, calls } = await withPage();
    try {
      await page.goto(url + '/baby', { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1000);
      // Find surname input
      const inputs = await page.locator('input[type="text"], input:not([type])').all();
      if (inputs.length > 0) await inputs[0].fill('张');
      // 01 form requires: surname + at least 1 vibe tag selected
      // Buttons layout: [gender×2, vibe×N, source×7, submit×1]
      // Click first vibe-tag button (index 2 = first vibe option after 2 gender buttons)
      const buttons = await page.locator('button').all();
      if (buttons.length >= 3) {
        await buttons[2].click();   // pick first vibe tag
        await page.waitForTimeout(300);
      }
      // Submit: last w-full bg-accent button
      let submit = null;
      for (const b of buttons) {
        const cls = (await b.getAttribute('class')) || '';
        if (cls.includes('w-full') && cls.includes('bg-accent')) submit = b;
      }
      if (!submit && buttons.length > 0) submit = buttons[buttons.length - 1];
      if (!submit) {
        record('01-ai-naming', 'baby form submit triggers gateway', false, 'no submit button found');
      } else {
        await submit.click();
        await page.waitForTimeout(8000);
        const gw = gatewayCalls(calls, '/generate-names');
        const url2 = page.url();
        const ok = gw.length > 0 && url2.includes('/result');
        record('01-ai-naming', 'baby form → gateway /generate-names', ok,
          `gw_calls=${gw.length}, final_url=${url2.slice(-60)}`);
      }
    } catch (e) { record('01-ai-naming', 'baby form submit', false, e.message.slice(0, 80)); }
    await ctx.close();
  }
}

// ───── 02 倒数日 ─────
async function test02Countdown() {
  const url = `http://localhost:${PRODUCTS['02-countdown'].port}`;

  // 2.1 List page
  {
    const { ctx, page } = await withPage();
    try {
      await page.goto(url + '/', { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1500);
      const body = await page.textContent('body');
      const has = body?.includes('倒数日') || body?.includes('惦记');
      record('02-countdown', 'list page loads', !!has, has ? '' : 'missing 倒数日');
    } catch (e) { record('02-countdown', 'list page loads', false, e.message.slice(0, 80)); }
    await ctx.close();
  }

  // 2.2 Create new countdown → localStorage persist
  {
    const { ctx, page } = await withPage(async (p) => {
      await p.addInitScript(() => localStorage.clear());
    });
    try {
      await page.goto(url + '/new', { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1000);
      // Fill title
      const inputs = await page.locator('input[type="text"], input:not([type])').all();
      let titleInput = null;
      for (const i of inputs) {
        const ph = await i.getAttribute('placeholder');
        const name = await i.getAttribute('name');
        if (!ph?.includes('email') && !name?.includes('date')) { titleInput = i; break; }
      }
      if (titleInput) await titleInput.fill('E2E 测试纪念日');
      // Date input
      const dateInputs = await page.locator('input[type="date"]').all();
      if (dateInputs.length > 0) await dateInputs[0].fill('2027-12-31');
      // 02 submit: type="submit" inside <form>; key is countdown-pro:cards
      const submitBtn = await page.locator('button[type="submit"]').first();
      const submitCount = await page.locator('button[type="submit"]').count();
      if (submitCount === 0) {
        record('02-countdown', 'new countdown form submit', false, 'no submit button');
      } else {
        await submitBtn.click();
        await page.waitForTimeout(2500);
        const stored = await page.evaluate(() => localStorage.getItem('countdown-pro:cards'));
        const ok = !!stored && stored.includes('E2E 测试纪念日');
        record('02-countdown', 'new countdown persists to countdown-pro:cards', ok,
          ok ? `cards found` : `cards: ${stored?.slice(0, 80) || 'null'}`);
      }
    } catch (e) { record('02-countdown', 'new countdown create', false, e.message.slice(0, 80)); }
    await ctx.close();
  }

  // 2.3 Settings page
  {
    const { ctx, page } = await withPage();
    try {
      await page.goto(url + '/settings', { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1000);
      const body = await page.textContent('body');
      const has = body?.includes('主题') || body?.includes('设置');
      record('02-countdown', 'settings page loads', !!has);
    } catch (e) { record('02-countdown', 'settings page', false, e.message.slice(0, 80)); }
    await ctx.close();
  }
}

// ───── 03 植物医生 ─────
async function test03Plant() {
  const url = `http://localhost:${PRODUCTS['03-plant-doctor'].port}`;

  // 3.1 Home loads
  {
    const { ctx, page } = await withPage();
    try {
      await page.goto(url + '/', { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1000);
      const body = await page.textContent('body');
      const has = body?.includes('植物') || body?.includes('叶');
      record('03-plant-doctor', 'home page loads', !!has);
    } catch (e) { record('03-plant-doctor', 'home page', false, e.message.slice(0, 80)); }
    await ctx.close();
  }

  // 3.2 About page contains compliance disclaimer
  {
    const { ctx, page } = await withPage();
    try {
      await page.goto(url + '/about', { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1000);
      const body = await page.textContent('body');
      const hasDisclaimer = body?.includes('参考') || body?.includes('养护');
      // Compliance check: ensure NO affirmative medical promise (e.g. "我们可以治病")
      // Disclaimer pages legitimately mention 治病 in negation ("不会推荐中草药治病")
      const hasAffirmativeMedical = /我们(可以|能|会)(治病|开药方|诊断)/.test(body || '');
      const ok = hasDisclaimer && !hasAffirmativeMedical;
      record('03-plant-doctor', 'about page compliance (no affirmative medical promise)', ok,
        `disclaimer=${hasDisclaimer}, affirmative_medical=${hasAffirmativeMedical}`);
    } catch (e) { record('03-plant-doctor', 'about page', false, e.message.slice(0, 80)); }
    await ctx.close();
  }

  // 3.3 Capture page exists (can't really test image upload in headless)
  {
    const { ctx, page } = await withPage();
    try {
      await page.goto(url + '/capture', { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1000);
      const body = await page.textContent('body');
      const has = body?.includes('拍') || body?.includes('上传');
      record('03-plant-doctor', 'capture page loads', !!has);
    } catch (e) { record('03-plant-doctor', 'capture page', false, e.message.slice(0, 80)); }
    await ctx.close();
  }
}

// ───── 04 梦境日记 ─────
async function test04Dream() {
  const url = `http://localhost:${PRODUCTS['04-dream-journal'].port}`;

  // 4.1 Normal flow: input + submit → gateway fetch
  {
    const { ctx, page, calls } = await withPage(async (p) => {
      await p.addInitScript(() => localStorage.setItem('dream-journal:first-launch-ack', '1'));
    });
    try {
      await page.goto(url + '/', { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1500);
      const textareas = await page.locator('textarea').all();
      if (textareas.length === 0) {
        record('04-dream-journal', 'normal dream input + submit', false, 'no textarea');
      } else {
        await textareas[0].fill('我梦到自己在海边飞翔');
        await page.waitForTimeout(500);
        const buttons = await page.locator('button').all();
        let submit = null;
        for (const b of buttons) {
          const t = (await b.textContent()) || '';
          if (t.includes('分析') || t.includes('解读') || t.includes('保存')) { submit = b; break; }
        }
        if (submit) {
          await submit.click();
          await page.waitForTimeout(6000);
          const gw = gatewayCalls(calls, '/analyze-dream');
          const url2 = page.url();
          const ok = gw.length > 0 && url2.includes('/result');
          record('04-dream-journal', 'normal dream → gateway /analyze-dream', ok,
            `gw_calls=${gw.length}, url=${url2.slice(-50)}`);
        } else {
          record('04-dream-journal', 'normal dream + submit', false, 'no submit button');
        }
      }
    } catch (e) { record('04-dream-journal', 'normal dream', false, e.message.slice(0, 80)); }
    await ctx.close();
  }

  // 4.2 CRITICAL: Level 1 crisis trigger → does NOT call gateway (client-side short-circuit)
  {
    const { ctx, page, calls } = await withPage(async (p) => {
      await p.addInitScript(() => localStorage.setItem('dream-journal:first-launch-ack', '1'));
    });
    try {
      await page.goto(url + '/', { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1500);
      const textareas = await page.locator('textarea').all();
      await textareas[0].fill('我想死');
      await page.waitForTimeout(500);
      const buttons = await page.locator('button').all();
      let submit = null;
      for (const b of buttons) {
        const t = (await b.textContent()) || '';
        if (t.includes('分析') || t.includes('解读') || t.includes('保存')) { submit = b; break; }
      }
      if (submit) {
        await submit.click();
        await page.waitForTimeout(3000);
        const gw = gatewayCalls(calls, '/analyze-dream');
        const url2 = page.url();
        const hitCrisisPage = url2.includes('/crisis');
        const noGatewayCall = gw.length === 0;
        const ok = hitCrisisPage && noGatewayCall;
        record('04-dream-journal', 'CRITICAL crisis L1 → no gateway call + /crisis nav', ok,
          `hit_crisis=${hitCrisisPage}, gateway_calls=${gw.length} (must be 0)`);
      } else {
        record('04-dream-journal', 'crisis trigger', false, 'no submit button');
      }
    } catch (e) { record('04-dream-journal', 'crisis trigger', false, e.message.slice(0, 80)); }
    await ctx.close();
  }

  // 4.3 Crisis page: no "继续分析" button
  {
    const { ctx, page } = await withPage(async (p) => {
      await p.addInitScript(() => localStorage.setItem('dream-journal:first-launch-ack', '1'));
    });
    try {
      await page.goto(url + '/crisis', { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1500);
      const buttonsText = await page.evaluate(() =>
        Array.from(document.querySelectorAll('button')).map((b) => b.textContent || '').join('|'),
      );
      const hasContinue = buttonsText.includes('继续分析');
      record('04-dream-journal', 'CRITICAL crisis page has NO "继续分析" button', !hasContinue,
        hasContinue ? `FOUND "继续分析" in buttons` : `buttons text: ${buttonsText.slice(0, 100)}`);
    } catch (e) { record('04-dream-journal', 'crisis page', false, e.message.slice(0, 80)); }
    await ctx.close();
  }
}

// ───── 05 宠物心情卡片 ─────
async function test05Pet() {
  const url = `http://localhost:${PRODUCTS['05-pet-cards'].port}`;

  // 5.1 Home loads
  {
    const { ctx, page } = await withPage();
    try {
      await page.goto(url + '/', { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1500);
      const body = await page.textContent('body');
      const has = body?.includes('宠物') || body?.includes('喵') || body?.includes('心情');
      record('05-pet-cards', 'home page loads', !!has);
    } catch (e) { record('05-pet-cards', 'home page', false, e.message.slice(0, 80)); }
    await ctx.close();
  }

  // 5.2 Mock submit ("用示例数据看效果") → gateway fetch + result page
  {
    const { ctx, page, calls } = await withPage();
    try {
      await page.goto(url + '/', { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1500);
      // Click "用示例数据看效果"
      const links = await page.locator('button, a').all();
      let mockBtn = null;
      for (const l of links) {
        const t = (await l.textContent()) || '';
        if (t.includes('示例数据') || t.includes('示例')) { mockBtn = l; break; }
      }
      if (!mockBtn) {
        record('05-pet-cards', 'mock data button found', false, 'no 示例数据 button');
      } else {
        await mockBtn.click();
        await page.waitForTimeout(3000);
        const url2 = page.url();
        const ok = url2.includes('/result');
        record('05-pet-cards', 'mock submit → /result navigation', ok, `final_url=${url2.slice(-50)}`);
      }
    } catch (e) { record('05-pet-cards', 'mock submit', false, e.message.slice(0, 80)); }
    await ctx.close();
  }

  // 5.3 CRITICAL: "翻译" word must NOT appear on user-facing pages
  {
    const { ctx, page } = await withPage();
    try {
      // Check home + history
      for (const path of ['/', '/history']) {
        await page.goto(url + path, { waitUntil: 'networkidle', timeout: 20000 });
        await page.waitForTimeout(1000);
        const body = await page.textContent('body');
        if (body?.includes('翻译')) {
          record('05-pet-cards', `CRITICAL "翻译" not on ${path}`, false, `found "翻译" in body`);
          await ctx.close();
          return;
        }
      }
      record('05-pet-cards', 'CRITICAL "翻译" not on home + history pages', true);
    } catch (e) { record('05-pet-cards', 'no-fanyi check', false, e.message.slice(0, 80)); }
    await ctx.close();
  }
}

// ───── Main ─────
async function main() {
  console.log('Launching Chromium...');
  browser = await chromium.launch({ headless: true });

  try {
    await test01Naming();
    await test02Countdown();
    await test03Plant();
    await test04Dream();
    await test05Pet();
  } finally {
    await browser.close();
  }

  // Report
  console.log('\n========== E2E SUMMARY ==========');
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`Total: ${results.length}, Passed: ${passed}, Failed: ${failed}`);
  if (failed > 0) {
    console.log('\nFAILURES:');
    results.filter((r) => !r.ok).forEach((r) => console.log(`  ❌ [${r.product}] ${r.name} — ${r.detail}`));
    process.exit(1);
  }
  console.log('\n✅ ALL PASSED');
}

main().catch((e) => {
  console.error('SCRIPT FATAL:', e.message);
  process.exit(1);
});
