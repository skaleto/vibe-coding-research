/**
 * 严重情绪检测函数
 *
 * 设计原则：
 * 1. 保守优先：宁可误报，不可漏报
 * 2. 一级命中立即返回，**不继续调用 LLM**
 * 3. 服务端 + 客户端双跑（API route 入口先跑一次，客户端表单提交前再跑一次）
 * 4. 返回值不仅给 level，还给 matched keyword 用于埋点（隐私上不存梦境原文）
 *
 * 抗规避归一化（审计 F04-03 / F04-04 硬化）：
 * 纯 `toLowerCase + includes` 可被以下手段绕过，命脉召回有洞：
 *   - 插入半角/全角空格："自 杀"、"想　死"
 *   - 插入零宽字符："自​杀"（U+200B 等）
 *   - 繁体变体："自殺"、"跳樓"、"割腕"
 *   - 全角英文/数字："ｋｉｌｌ"
 * 因此匹配前对文本与关键词都跑一遍 normalize()：
 *   NFKC（全角→半角、兼容字形折叠）→ 去所有空白 \s → 去零宽字符
 *   → 繁体高危字→简体 → toLowerCase
 * 这样在**不放宽语义**（不做谐音/拆字猜测）的前提下显著提升召回。
 */

import {
  type CrisisKeywordTable,
  type CrisisLevel,
  getKeywordTable,
} from './crisisKeywords';

export interface CrisisDetectionResult {
  level: CrisisLevel;
  matched: string | null;
  /** 用于客户端决定下一步：'redirect' / 'append-warm-card' / 'append-gentle-tip' / 'none' */
  action: 'redirect' | 'append-warm-card' | 'append-gentle-tip' | 'none';
}

/**
 * 零宽 / 不可见字符（常被用来在汉字间插入以绕过 includes）。
 * 用显式 \u 转义书写，避免源码里出现不可见字符造成维护风险。
 *   U+200B 零宽空格, U+200C 零宽非连接符, U+200D 零宽连接符,
 *   U+FEFF 零宽不换行空格(BOM), U+2060 单词连接符,
 *   U+00AD 软连字符, U+180E 蒙古元音分隔符。
 * 注：NBSP(U+00A0) / 全角空格(U+3000) 等"有宽空白"已由下方 \s 处理。
 */
const ZERO_WIDTH_RE = /[​‌‍﻿⁠­᠎]/g;

/** CJK 统一表意文字基本区，用于按字符做繁→简映射。 */
const CJK_RE = /[一-鿿]/g;

/**
 * 繁体高危字 → 简体 映射。
 *
 * 仅覆盖一级 / 二级 / 三级关键词中出现的汉字的繁体变体，
 * 目的是把繁体输入折叠到简体词表上命中，而非做通用繁简转换。
 * 词表本身一律以简体维护（见 crisisKeywords.ts 注释）。
 *
 * 维护提示：往词表新增含「简繁有别」汉字的关键词时，需把该字的
 * 繁体变体补进此表，否则繁体输入会漏检。
 */
const TRAD_TO_SIMP: Record<string, string> = {
  殺: '杀',
  樓: '楼',
  橋: '桥',
  軌: '轨',
  縊: '缢',
  脈: '脉',
  藥: '药',
  結: '结',
  斷: '断',
  傷: '伤',
  劃: '划',
  燒: '烧',
  離: '离',
  開: '开',
  幾: '几',
  萬: '万',
  歲: '岁',
  夢: '梦',
  滅: '灭',
  斃: '毙',
  撐: '撑',
  潰: '溃',
  絕: '绝',
  難: '难',
  獨: '独',
  躲: '躲',
  擺: '摆',
  爛: '烂',
  輕: '轻',
  墜: '坠',
  屍: '尸',
};

/**
 * 归一化：抗规避的核心。返回小写、去空白、去零宽、繁→简后的文本。
 *
 * 对外导出，供测试断言与服务端复用。
 */
export function normalize(text: string): string {
  if (!text) return '';
  // 1. NFKC：全角→半角、兼容字形折叠（ｋｉｌｌ→kill、１→1、NBSP→普通空格 等）
  let out = text.normalize('NFKC');
  // 2. 去掉所有空白字符（普通空格 / 制表 / 换行 / 经 NFKC 已转普通空格的 NBSP 等）
  out = out.replace(/\s+/g, '');
  // 3. 去零宽 / 不可见字符
  out = out.replace(ZERO_WIDTH_RE, '');
  // 4. 繁体高危字 → 简体
  out = out.replace(CJK_RE, (ch) => TRAD_TO_SIMP[ch] ?? ch);
  // 5. 统一小写（英文表 / 全角英文经 NFKC 后）
  return out.toLowerCase();
}

/**
 * 关键词匹配（基于归一化文本）。
 *
 * MVP 阶段：纯关键词 + 归一化；生产环境建议叠加本地 NLP 模型双保险。
 *
 * False positive 处理：
 * - "我梦到我自杀了" 仍然触发一级（保守策略，详见 detail-04 § G.2）
 * - 不做"我不想自杀"这类否定语境过滤，因为梦境描述 + 抑郁主诉常混合
 */
export function detectCrisis(
  text: string,
  locale = 'zh-CN'
): CrisisDetectionResult {
  if (!text || text.trim().length === 0) {
    return { level: 0, matched: null, action: 'none' };
  }

  const table: CrisisKeywordTable = getKeywordTable(locale);
  const normalized = normalize(text);
  if (normalized.length === 0) {
    return { level: 0, matched: null, action: 'none' };
  }

  // 一级优先（命中即跳转 /crisis，不发任何请求）
  for (const kw of table.level1) {
    if (normalized.includes(normalize(kw))) {
      return { level: 1, matched: kw, action: 'redirect' };
    }
  }

  for (const kw of table.level2) {
    if (normalized.includes(normalize(kw))) {
      return { level: 2, matched: kw, action: 'append-warm-card' };
    }
  }

  for (const kw of table.level3) {
    if (normalized.includes(normalize(kw))) {
      return { level: 3, matched: kw, action: 'append-gentle-tip' };
    }
  }

  return { level: 0, matched: null, action: 'none' };
}
