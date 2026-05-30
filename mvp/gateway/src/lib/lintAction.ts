/**
 * lintAction —— 03 植物医生服务端合规过滤器
 *
 * 1:1 移植自 mvp/products/03-plant-doctor/lib/lintAction.ts
 *
 * 命中任何农药商品名 / 通用名 / 剂量 / 稀释比例 / 浓度 / 喷洒频次 → 整段替换 SAFE_REPLACEMENT。
 *
 * A1 F-03 硬化：匹配前对文本做 normalizeForMatch（NFKC + 繁简折叠 + 去空白/零宽/
 * 标点 + lower），关键词同样归一化后再 includes，封堵空格/零宽/繁体/全角绕过；
 * 并补英文通用名词表（carbendazim / glyphosate / mancozeb …）。
 */

import { normalizeForMatch, nfkcStripZeroWidth } from './normalize';

/** 英文农药通用名（小写）。LLM（尤其 GPT 系）可能直接输出英文名绕过简体词表。 */
export const PESTICIDE_NAMES_EN: readonly string[] = [
  'carbendazim', // 多菌灵
  'chlorothalonil', // 百菌清
  'mancozeb', // 代森锰锌
  'zineb', // 代森锌
  'maneb', // 代森锰
  'thiophanate-methyl', // 甲基托布津
  'thiophanate methyl',
  'imidacloprid', // 吡虫啉
  'acetamiprid', // 啶虫脒
  'pymetrozine', // 吡蚜酮
  'abamectin', // 阿维菌素
  'avermectin',
  'emamectin', // 甲维盐 / 艾绿士活性成分
  'emamectin benzoate',
  'glyphosate', // 草甘膦
  'glufosinate', // 草铵膦
  'paraquat', // 百草枯
  'diquat', // 敌草快
  'pyraclostrobin', // 吡唑醚菌酯
  'azoxystrobin', // 嘧菌酯
  'difenoconazole', // 苯醚甲环唑
  'tebuconazole', // 戊唑醇
  'triadimefon', // 三唑酮
  'flusilazole', // 氟硅唑
  'prochloraz', // 咪鲜胺
  'metalaxyl', // 甲霜灵
  'mancozeb metalaxyl',
  'propineb', // 丙森锌
  'iprodione', // 异菌脲 / 扑海因
  'procymidone', // 速克灵
  'pyrimethanil', // 嘧霉胺
  'thiram', // 福美双
  'streptomycin', // 链霉素 / 农用链霉素
  'kasugamycin', // 春雷霉素
  'zhongshengmycin', // 中生菌素
  'validamycin', // 井冈霉素
  'cypermethrin', // 氯氰菊酯
  'beta-cypermethrin', // 高效氯氰菊酯
  'deltamethrin', // 溴氰菊酯
  'bifenthrin', // 联苯菊酯
  'fenpropathrin', // 甲氰菊酯
  'chlorantraniliprole', // 氯虫苯甲酰胺
  'pyridaben', // 哒螨灵
  'spirodiclofen', // 螺螨酯
  'propargite', // 炔螨特
  'malathion', // 马拉硫磷
  'dichlorvos', // 敌敌畏
  'dimethoate', // 乐果
  'phoxim', // 辛硫磷
  'chlorpyrifos', // 毒死蜱
  'carbosulfan', // 丁硫克百威
  'trichlorfon', // 敌百虫
  'bordeaux mixture', // 波尔多液
];

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
  // 民间偏方
  '小苏打溶液',
  '稀释小苏打',
  '白醋稀释',
  '大蒜水',
  '辣椒水',
  '烟蒂泡水',
];

export const DOSAGE_PATTERNS: readonly RegExp[] = [
  /\d+\s*[:：]\s*\d{2,5}/g,
  /\d+(?:\.\d+)?\s*(?:ml|mL|毫升|g|克|kg|公斤)\s*\/\s*(?:L|l|升|kg|公斤)/g,
  /\b\d{1,2}\.?\d*\s*%\s*(?:可湿性粉剂|乳油|悬浮剂|水分散粒剂|可溶性粉剂)/g,
  /喷(?:洒|雾|施)\s*\d+\s*(?:次|遍)/g,
];

export const SAFE_REPLACEMENT = '请咨询本地园艺师或农资人员';

export interface LintTextResult {
  cleaned: string;
  hit: boolean;
  matches: string[];
}

export function lintText(text: string): LintTextResult {
  if (!text || typeof text !== 'string') {
    return { cleaned: text || '', hit: false, matches: [] };
  }
  const matches: string[] = [];

  // Pass 1: pesticide names. Both text and keyword go through the SAME
  // normalizeForMatch so spaced ("多 菌 灵"), zero-width ("多菌​灵"),
  // punctuation-split ("多·菌·灵"), traditional ("多菌靈") and English-name
  // variants all collapse to a canonical form before `includes`.
  const normName = normalizeForMatch(text);
  for (const name of PESTICIDE_NAMES) {
    const nk = normalizeForMatch(name);
    if (nk.length > 0 && normName.includes(nk)) matches.push(name);
  }
  for (const name of PESTICIDE_NAMES_EN) {
    const nk = normalizeForMatch(name);
    if (nk.length > 0 && normName.includes(nk)) matches.push(name);
  }

  // Pass 2: dosage / ratio / frequency patterns on lightly-normalized text
  // (NFKC + strip zero-width, whitespace & punctuation preserved so the regex's
  // ":" "%" "/" "." and `\s*` still work; full-width "１：１０００" → "1:1000").
  const normDose = nfkcStripZeroWidth(text);
  for (const re of DOSAGE_PATTERNS) {
    const found = normDose.match(re);
    if (found) matches.push(...found);
  }

  if (matches.length === 0) {
    return { cleaned: text, hit: false, matches: [] };
  }
  return { cleaned: SAFE_REPLACEMENT, hit: true, matches };
}

// ---------- DiagnosisResult shape (matches design § Gateway type) ----------

export type Likelihood = '高' | '中' | '低';
export type Severity = '轻' | '中' | '重';
export type CalendarType =
  | 'watering'
  | 'fertilizing'
  | 'lighting'
  | 'ventilation'
  | 'observation'
  | 'repotting'
  | 'consult';

export interface DiagnosisItem {
  cause: string;
  likelihood: Likelihood;
  evidence: string;
  severity: Severity;
}

export interface DiagnosisResult {
  plant_name: string;
  scientific_name: string;
  confidence: number;
  image_quality_ok: boolean;
  image_quality_feedback: string;
  diagnosis: DiagnosisItem[];
  action_steps: string[];
  prognosis: {
    recovery_outlook: Likelihood;
    time_to_observe: string;
    fallback_if_fail: string;
  };
  calendar_30d: Array<{ day: number; action: string; type: CalendarType }>;
  disclaimer: string;
}

export interface LintReport {
  hits: number;
  fields: string[];
  matchedTokens: string[];
}

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
    image_quality_feedback: lintAndTrack(
      input.image_quality_feedback,
      'image_quality_feedback',
    ),
    diagnosis: (input.diagnosis ?? []).map((d, i) => ({
      ...d,
      cause: lintAndTrack(d.cause, `diagnosis[${i}].cause`),
      evidence: lintAndTrack(d.evidence, `diagnosis[${i}].evidence`),
    })),
    action_steps: (input.action_steps ?? []).map((s, i) =>
      lintAndTrack(s, `action_steps[${i}]`),
    ),
    prognosis: {
      ...input.prognosis,
      fallback_if_fail: lintAndTrack(
        input.prognosis?.fallback_if_fail ?? '',
        'prognosis.fallback_if_fail',
      ),
    },
    calendar_30d: (input.calendar_30d ?? []).map((d, i) => ({
      ...d,
      action: lintAndTrack(d.action, `calendar_30d[${i}].action`),
    })),
    disclaimer: lintAndTrack(input.disclaimer ?? '', 'disclaimer'),
  };

  return {
    result: cleaned,
    report: { hits: fields.length, fields, matchedTokens: Array.from(matchedTokens) },
  };
}
