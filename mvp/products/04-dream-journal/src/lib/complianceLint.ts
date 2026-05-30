/**
 * 合规 lint：扫描代码 / 文档里的禁词 + 硬编码热线号码。
 *
 * 跑法：
 *   node --import tsx src/lib/complianceLint.ts
 *
 * 失败时 exit 1，CI 应当作 gate。
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// `src/lib/complianceLint.ts` → 项目根目录
const ROOT = join(__dirname, '..', '..');

// 禁词清单（来自 detail-04 § D.1 + proposal § 5.4）
const FORBIDDEN_PHRASES: string[] = [
  '算命',
  '解梦',
  '周公解梦',
  '占卜',
  '解签',
  '抽签',
  '八字',
  '命格',
  '运势',
  '运气好',
  '转运',
  '招财',
  '破财',
  '吉凶',
  '吉兆',
  '凶兆',
  '塔罗',
  '风水',
  '灵性',
  '念咒',
];

/**
 * 硬编码热线号码检测：典型中国心理援助热线前缀 + 美国 988。
 *
 * 注意：MVP 阶段所有热线都用 placeholder，**任何**真实号码进代码都视为违规。
 * 这里只列出最常见的几个前缀，足够 catch 复制粘贴时的疏漏。
 */
const HOTLINE_NUMBER_PATTERNS: RegExp[] = [
  /400-\d{3}-\d{4}/g, // 国内 400 热线，如 400-161-9995
  /400\s?\d{3}\s?\d{4}/g,
  /\b010-\d{8}\b/g, // 北京座机
  /\b021-\d{8}\b/g, // 上海座机
  /\b1-800-\d{3}-\d{4}\b/g, // US 1-800
  /\b988\b(?!\s*\()/g, // US 988 Lifeline（裸号；允许在注释里说明）
];

// 跳过的目录 / 文件
const IGNORE_DIRS = new Set([
  'node_modules',
  '.next',
  'out',
  '.git',
  'public',
  'dist',
  'ios',
  'android',
]);
const IGNORE_FILES = new Set([
  // lint 工具本身肯定有禁词样例
  'complianceLint.ts',
  // crisis 关键词表是产品命脉，本身就需要列禁词以外的危险词
  // 但它不会出现具体热线号码
]);

// 允许引用禁词的文件（必须在白名单内）
//
// 准入标准：该文件以「负面列表」方式提及禁词，即说明
// 「本应用不是算命/占卜/...」这种澄清式句法。
// 任何文件以「正面承诺」方式使用禁词（"为你算命"），即视为违规。
const ALLOW_FORBIDDEN_PHRASE_IN: Set<string> = new Set([
  'src/lib/complianceLint.ts',
  'src/lib/prompts.ts', // prompts 包含「不得使用这些词」的反向清单
  'src/routes/AboutPage.tsx', // about 页面说明"不算命/不占卜"等定位
  'src/lib/disclaimer.ts', // 首次启动弹窗显式声明"不是算命/占卜应用"
  'README.md', // README 顶部声明"不是算命/占卜/运势应用"
  'codex-todo-illustrations.md', // codex todo 列出图像禁忌清单
]);

interface Issue {
  file: string;
  line: number;
  reason: string;
  snippet: string;
}

function shouldScan(file: string): boolean {
  if (IGNORE_FILES.has(file.split('/').pop() ?? '')) return false;
  return (
    file.endsWith('.ts') ||
    file.endsWith('.tsx') ||
    file.endsWith('.md') ||
    file.endsWith('.json')
  );
}

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (shouldScan(p)) acc.push(p);
  }
  return acc;
}

function scanFile(file: string, issues: Issue[]): void {
  const rel = file.replace(ROOT + '/', '');
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');

  const allowsForbidden = ALLOW_FORBIDDEN_PHRASE_IN.has(rel);

  lines.forEach((line, idx) => {
    // 1. 禁词检查
    if (!allowsForbidden) {
      for (const phrase of FORBIDDEN_PHRASES) {
        if (line.includes(phrase)) {
          issues.push({
            file: rel,
            line: idx + 1,
            reason: `Forbidden phrase: "${phrase}"`,
            snippet: line.trim().slice(0, 120),
          });
        }
      }
    }

    // 2. 硬编码热线号码检查（任何文件都不允许）
    for (const pat of HOTLINE_NUMBER_PATTERNS) {
      const matches = line.match(pat);
      if (matches) {
        issues.push({
          file: rel,
          line: idx + 1,
          reason: `Hard-coded hotline number: ${matches.join(', ')}`,
          snippet: line.trim().slice(0, 120),
        });
      }
    }
  });
}

function main(): void {
  const files = walk(ROOT);
  const issues: Issue[] = [];
  for (const f of files) scanFile(f, issues);

  if (issues.length === 0) {
    console.log('[compliance-lint] PASS — no forbidden phrases or hard-coded hotline numbers.');
    process.exit(0);
  }

  console.error('[compliance-lint] FAIL — issues found:');
  for (const i of issues) {
    console.error(`  ${i.file}:${i.line}  ${i.reason}`);
    console.error(`    > ${i.snippet}`);
  }
  console.error(`\nTotal: ${issues.length} issue(s).`);
  process.exit(1);
}

main();
