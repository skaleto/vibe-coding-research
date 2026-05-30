/**
 * 严重情绪三级关键词检测 —— 服务端先行。
 *
 * 1:1 移植自 mvp/products/04-dream-journal/lib/crisisKeywords.ts + detectCrisis.ts
 *
 * 一级命中 → API 直接 redirectToCrisis, 不调任何 LLM
 * 二/三级 → 调 LLM 后挂 crisis_alert
 */

import { normalizeForMatch } from './normalize';

export type CrisisLevel = 0 | 1 | 2 | 3;

export interface CrisisKeywordTable {
  level1: string[];
  level2: string[];
  level3: string[];
}

export const CRISIS_KEYWORDS_ZH: CrisisKeywordTable = {
  level1: [
    '自杀',
    '了结自己',
    '了结了',
    '了断',
    '结束生命',
    '结束自己',
    '结束这一切',
    '跳楼',
    '跳河',
    '跳桥',
    '跳轨',
    '上吊',
    '自缢',
    '割腕',
    '割脉',
    '服毒',
    '吃药自杀',
    '不想活',
    '不想活了',
    '活不下去',
    '活着没意义',
    '活着没意思',
    '活着没什么意思',
    '想死',
    '我想死',
    '杀了自己',
    '把自己解决',
    '解决自己',
    '安乐死',
    '求死',
    '自残',
    '撞墙',
    '划自己',
    '烧自己',
    '伤害自己',
    '消失算了',
    '去死',
    '想消失就消失',
    '永远的离开',
    '永远离开',
    // 委婉语 (euphemisms) — A1 建议补入一级词表
    '解脱',
    '一了百了',
    '不想撑了',
    '不想撑下去',
    '撑不下去',
    '撑不下去了',
    '活着没意义',
    '人生没有意义',
    '活着是种折磨',
    '不想再醒来',
    '不想醒来了',
  ],
  level2: [
    '绝望',
    '彻底没希望',
    '崩溃',
    '崩了',
    '撑不住',
    '熬不下去',
    '熬不住',
    '痛苦极了',
    '心如刀绞',
    '心碎',
    '空虚',
    '完全空',
    '什么都没意思',
    '活着累',
    '累到不行',
    '好累好累',
    '对未来绝望',
    '看不到希望',
    '破防',
  ],
  level3: [
    '孤独',
    '好孤独',
    '没人懂',
    '没人理解',
    '想消失',
    '躲起来',
    '一个人面对',
    '一个人扛',
    '撑着',
    'emo',
    '摆烂',
  ],
};

export const CRISIS_KEYWORDS_EN: CrisisKeywordTable = {
  level1: [
    'suicide',
    'suicidal',
    'kill myself',
    'end my life',
    'end it all',
    'want to die',
    'wish i was dead',
    'wish i were dead',
    'hang myself',
    'jump off',
    'overdose',
    'shoot myself',
    'self harm',
    'self-harm',
    'cut myself',
    'hurt myself',
    'no reason to live',
    'better off dead',
    "don't want to be here anymore",
    'want to end it',
    "can't go on living",
  ],
  level2: [
    'hopeless',
    'no hope',
    'despair',
    "can't go on",
    "can't take it anymore",
    'breaking down',
    'everything is pointless',
    "what's the point",
    'exhausted by life',
    'tired of everything',
  ],
  level3: [
    'lonely',
    'so lonely',
    'nobody understands',
    'want to disappear',
    'all alone',
    'holding on',
  ],
};

export function getKeywordTable(locale: string = 'zh-CN'): CrisisKeywordTable {
  if (locale.startsWith('en')) return CRISIS_KEYWORDS_EN;
  return CRISIS_KEYWORDS_ZH;
}

export interface CrisisDetectionResult {
  level: CrisisLevel;
  matched: string | null;
  action: 'redirect' | 'append-warm-card' | 'append-gentle-tip' | 'none';
}

/**
 * Match a keyword against already-normalized text. Both sides go through the
 * SAME `normalizeForMatch` (NFKC + trad→simp fold + strip whitespace / invisible
 * / punctuation + lowercase), so space / zero-width / punctuation / full-width /
 * traditional bypasses all collapse to the canonical form before `includes`.
 *
 * A5-01: "自 杀" / "自​杀" / "自。杀" / "自殺" / "想 死" all match; the benign
 * "大自然…从不杀生" stays clear because real ideographs between 自 and 杀 are
 * preserved (only separators are stripped), so they never become adjacent.
 */
function matchKeyword(normalizedText: string, keywords: string[]): string | null {
  for (const kw of keywords) {
    const nk = normalizeForMatch(kw);
    if (nk.length > 0 && normalizedText.includes(nk)) {
      return kw;
    }
  }
  return null;
}

export function detectCrisis(text: string, locale: string = 'zh-CN'): CrisisDetectionResult {
  if (!text || text.trim().length === 0) {
    return { level: 0, matched: null, action: 'none' };
  }

  const table = getKeywordTable(locale);
  const normalized = normalizeForMatch(text);

  const m1 = matchKeyword(normalized, table.level1);
  if (m1) return { level: 1, matched: m1, action: 'redirect' };

  const m2 = matchKeyword(normalized, table.level2);
  if (m2) return { level: 2, matched: m2, action: 'append-warm-card' };

  const m3 = matchKeyword(normalized, table.level3);
  if (m3) return { level: 3, matched: m3, action: 'append-gentle-tip' };

  return { level: 0, matched: null, action: 'none' };
}

// ---------- 04 共享常量 ----------

export const DISCLAIMER_TOP =
  '以下内容为 AI 基于心理学知识科普生成，仅供反思参考，不构成医疗诊断或专业咨询建议。';

export const NEXT_STEP_DEFAULT = '如果近期情绪困扰持续，建议咨询专业心理咨询师。';
