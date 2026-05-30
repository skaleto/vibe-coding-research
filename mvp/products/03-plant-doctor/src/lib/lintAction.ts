/**
 * lintAction —— 双重保险合规过滤器
 *
 * codex review 强制：禁止任何农药商品名 / 通用名 / 剂量 / 稀释比例
 * 即便 LLM 在 prompt 约束下漏了网，本模块在 API 返回前对所有文本字段做正则扫描，
 * 命中任何敏感词 / 数字稀释比例 / 浓度百分比时，整段替换为安全话术。
 *
 * 归一化硬化（A3-03-3 / A1-F-03）：匹配前先 normalize（NFKC + 去空白 + 去零宽字符），
 * 防止 LLM 用「多 菌 灵」「多-菌灵」「多菌靈」（繁体）或英文通用名（carbendazim）绕过
 * 简体精确 includes。client 与 gateway 双层都跑这套清洗，client 这一层不可省。
 *
 * 用法：在 /api/diagnose 返回前调用 lintDiagnosisResult(result)。
 */

// ---------- 0. 文本归一化 ----------

/** 零宽 / 不可见字符：零宽空格、零宽非连接、零宽连接、各类 word joiner、BOM 等。 */
const INVISIBLE_RE = /[​-‏‪-‮⁠-⁤﻿]/g;

/** 所有空白（含全角空格 　、tab、换行）+ 常见分隔标点（连字符、点号、斜杠等）。 */
const SEPARATOR_RE = /[\s　\-_./\\|·•・,，、~～]+/g;

/**
 * 归一化文本用于匹配：
 *  1. NFKC（全角→半角、兼容字形归一）
 *  2. 去零宽 / 不可见字符
 *  3. 去空白 + 常见分隔标点（防「多 菌 灵」「多-菌灵」「波尔多 液」绕过）
 *  4. toLowerCase（英文通用名大小写无关）
 *
 * 注意：去分隔符后中英文都拼成连续串，农药名 / 英文通用名均为高区分度长 token，
 * 子串匹配不会误伤正常护理文本（已由单测覆盖「颗粒土 70%」等场景）。
 */
export function normalize(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .normalize('NFKC')
    .replace(INVISIBLE_RE, '')
    .replace(SEPARATOR_RE, '')
    .toLowerCase();
}

// ---------- 1. 黑名单 ----------

/** 农药通用名 / 商品名（来自 detail-03 § A.3 + compliance § 3.A） */
export const PESTICIDE_NAMES: readonly string[] = [
  // 通用名
  '多菌灵',
  '波尔多液',
  '吡虫啉',
  '代森锰锌',
  '代森锌',
  '嘧霉胺',
  '三唑酮',
  '农用链霉素',
  '链霉素',
  '咪鲜胺',
  '阿维菌素',
  '甲基托布津',
  '托布津',
  '百菌清',
  '甲霜灵',
  '丙森锌',
  '氟硅唑',
  '苯醚甲环唑',
  '春雷霉素',
  '中生菌素',
  '氯氰菊酯',
  '高效氯氰菊酯',
  '氯虫苯甲酰胺',
  '吡蚜酮',
  '啶虫脒',
  '哒螨灵',
  '螺螨酯',
  '炔螨特',
  '阿维·哒螨灵',
  '甲氰菊酯',
  '联苯菊酯',
  '溴氰菊酯',
  '马拉硫磷',
  '敌敌畏',
  '乐果',
  '辛硫磷',
  '毒死蜱',
  '丁硫克百威',
  // 商品名
  '绿亨一号',
  '绿亨1号',
  '施克粉',
  '敌百虫',
  '敌百虫粉剂',
  '艾绿士',
  '速克灵',
  '扑海因',
  '安泰生',
  '科博',
  // 经常被一并提的"民间偏方"
  '小苏打溶液',
  '稀释小苏打',
  '白醋稀释',
  '大蒜水',
  '辣椒水',
  '烟蒂泡水',
  // 繁体变体（NFKC 不做繁→简，需显式补；只补高频杀菌/杀虫剂）
  '多菌靈',
  '波爾多液',
  '代森錳鋅',
  '甲基托布津', // 已含简体，繁体同形
  '百菌清',
  '甲霜靈',
  '氯氰菊酯',
  '聯苯菊酯',
  '溴氰菊酯',
  '馬拉硫磷',
  '敵敵畏',
  '樂果',
  '毒死蜱',
  '農用鏈黴素',
  '鏈黴素',
  '春雷黴素',
];

/**
 * 农药英文通用名（ISO common names）——GPT 系模型常直接输出英文名绕过中文词表。
 * 归一化后小写匹配，均为高区分度长 token，无误伤风险。
 */
export const PESTICIDE_NAMES_EN: readonly string[] = [
  // 杀菌剂
  'carbendazim',
  'chlorothalonil',
  'mancozeb',
  'maneb',
  'zineb',
  'propineb',
  'thiophanate', // -methyl 同源
  'thiophanatemethyl',
  'metalaxyl',
  'difenoconazole',
  'triadimefon',
  'prochloraz',
  'pyrimethanil',
  'iprodione',
  'flusilazole',
  'bordeaux', // bordeaux mixture 波尔多液
  'streptomycin',
  'kasugamycin',
  'zhongshengmycin',
  // 杀虫 / 杀螨剂
  'imidacloprid',
  'abamectin',
  'avermectin',
  'acetamiprid',
  'pymetrozine',
  'chlorantraniliprole',
  'cypermethrin',
  'deltamethrin',
  'bifenthrin',
  'fenpropathrin',
  'pyridaben',
  'spirodiclofen',
  'propargite',
  'malathion',
  'dichlorvos',
  'omethoate',
  'dimethoate',
  'phoxim',
  'chlorpyrifos',
  'carbosulfan',
  'glyphosate', // 除草剂，常被误用
  'glufosinate',
  'paraquat',
];

/** 剂量 / 稀释比例 / 浓度的正则 */
export const DOSAGE_PATTERNS: readonly RegExp[] = [
  // 1:1000 / 1：800 等稀释比例
  /\d+\s*[:：]\s*\d{2,5}/g,
  // 5ml/L / 10g/L 等浓度
  /\d+(?:\.\d+)?\s*(?:ml|mL|毫升|g|克|kg|公斤)\s*\/\s*(?:L|l|升|kg|公斤)/g,
  // 70% / 85% 这种农药制剂常见浓度（保留普通百分比要小心，所以只在前后 1-2 字符是数字/百分号符号时算）
  /\b\d{1,2}\.?\d*\s*%\s*(?:可湿性粉剂|乳油|悬浮剂|水分散粒剂|可溶性粉剂)/g,
  // 喷洒 X 次 / 喷雾 X 次
  /喷(?:洒|雾|施)\s*\d+\s*(?:次|遍)/g,
];

/**
 * 给剂量正则用的轻归一化：NFKC（全角数字/百分号→半角）+ 去零宽字符，
 * 但**保留** 空白 / : / / / % 等结构字符（正则本身已用 \s* 容忍空白）。
 * 不能用全量 normalize()——那会把 ml/L 的斜杠、稀释比例的冒号都删掉。
 */
function normalizeForDosage(text: string): string {
  return text.normalize('NFKC').replace(INVISIBLE_RE, '');
}

/** 安全替换话术 */
export const SAFE_REPLACEMENT = '请咨询本地园艺师或农资人员';

// ---------- 2. 核心扫描函数 ----------

export interface LintResult {
  cleaned: string;
  hit: boolean;
  matches: string[];
}

/**
 * 预计算：归一化形式 -> 原始可读 token。
 * 中英文词表统一归一后入表；命中时回报原始 token（而非被剥离的归一串），
 * 便于日志 / report 阅读。重复的归一键保留首个原始写法即可。
 */
const NORMALIZED_NAME_INDEX: ReadonlyArray<{ norm: string; original: string }> = (() => {
  const seen = new Set<string>();
  const out: Array<{ norm: string; original: string }> = [];
  for (const original of [...PESTICIDE_NAMES, ...PESTICIDE_NAMES_EN]) {
    const norm = normalize(original);
    if (!norm || seen.has(norm)) continue;
    seen.add(norm);
    out.push({ norm, original });
  }
  return out;
})();

/**
 * 对单段文本做扫描，命中任何农药名 / 剂量 / 稀释比例时，整段替换为 SAFE_REPLACEMENT
 * 并附带说明（避免静默丢失上下文）。
 *
 * 匹配前先 normalize（NFKC + 去空白/分隔符 + 去零宽 + 小写），因此
 * 「多 菌 灵」「多-菌灵」「多菌靈」「Carbendazim」均会命中。
 */
export function lintText(text: string): LintResult {
  if (!text || typeof text !== 'string') {
    return { cleaned: text || '', hit: false, matches: [] };
  }

  const matches: string[] = [];

  // a) 直接命中农药名（中文 + 繁体 + 英文通用名），归一化后子串匹配
  const normalizedText = normalize(text);
  if (normalizedText) {
    for (const { norm, original } of NORMALIZED_NAME_INDEX) {
      if (normalizedText.includes(norm)) {
        matches.push(original);
      }
    }
  }

  // b) 命中剂量 / 比例（轻归一化：保留 : / % 结构字符，仅折叠全角 + 去零宽）
  const dosageText = normalizeForDosage(text);
  for (const re of DOSAGE_PATTERNS) {
    const found = dosageText.match(re);
    if (found) matches.push(...found);
  }

  if (matches.length === 0) {
    return { cleaned: text, hit: false, matches: [] };
  }

  // 命中：整段替换（不做局部替换，避免漏网）
  return {
    cleaned: SAFE_REPLACEMENT,
    hit: true,
    matches,
  };
}

// ---------- 3. 针对 DiagnosisResult 的整体清洗 ----------

import type { DiagnosisResult } from './schema';

export interface LintReport {
  hits: number;
  fields: string[]; // 触发的字段路径
  matchedTokens: string[]; // 命中的具体 token（去重）
}

/**
 * 对整个 DiagnosisResult 做递归 lint。
 * 返回 { result, report }。result 已被替换为安全版本。
 */
export function lintDiagnosisResult(input: DiagnosisResult): {
  result: DiagnosisResult;
  report: LintReport;
} {
  const fields: string[] = [];
  const matchedTokens = new Set<string>();

  const lintAndTrack = (text: string, path: string): string => {
    const r = lintText(text);
    if (r.hit) {
      fields.push(path);
      r.matches.forEach((m) => matchedTokens.add(m));
    }
    return r.cleaned;
  };

  const cleaned: DiagnosisResult = {
    ...input,
    plant_name: lintAndTrack(input.plant_name, 'plant_name'),
    scientific_name: lintAndTrack(input.scientific_name, 'scientific_name'),
    image_quality_feedback: lintAndTrack(input.image_quality_feedback, 'image_quality_feedback'),
    diagnosis: input.diagnosis.map((d, i) => ({
      ...d,
      cause: lintAndTrack(d.cause, `diagnosis[${i}].cause`),
      evidence: lintAndTrack(d.evidence, `diagnosis[${i}].evidence`),
    })),
    action_steps: input.action_steps.map((s, i) => lintAndTrack(s, `action_steps[${i}]`)),
    prognosis: {
      ...input.prognosis,
      fallback_if_fail: lintAndTrack(input.prognosis.fallback_if_fail, 'prognosis.fallback_if_fail'),
    },
    calendar_30d: input.calendar_30d.map((d, i) => ({
      ...d,
      action: lintAndTrack(d.action, `calendar_30d[${i}].action`),
    })),
    disclaimer: lintAndTrack(input.disclaimer, 'disclaimer'),
  };

  return {
    result: cleaned,
    report: {
      hits: fields.length,
      fields,
      matchedTokens: Array.from(matchedTokens),
    },
  };
}
