/**
 * 网红名黑名单过滤
 *
 * - HARD_BLACKLIST：19 字硬黑名单，直接剔除
 * - SOFT_BLACKLIST_CHARS：13 字软黑名单，所有名字中含此类字的不超过 1 个
 *
 * 来源：detail-01-ai-naming.md § A.3.2
 */

export const HARD_BLACKLIST = new Set([
  '梓涵', '紫萱', '子轩', '子涵', '梓萱',
  '沐宸', '沐辰', '雨桐', '欣怡', '可馨',
  '思琪', '雨涵', '梓睿', '俊宇', '浩然',
  '浩宇', '子墨', '嘉怡', '婉清',
]);

export const SOFT_BLACKLIST_CHARS = new Set([
  '梓', '萱', '涵', '轩', '宸', '桐', '怡', '馨', '琪', '睿', '宇', '然', '墨',
]);

// 字义不吉字（硬过滤）
export const BAD_MEANING_CHARS = new Set([
  '殇', '亡', '孤', '煞', '凶', '丧', '哀', '疾', '病', '狱', '牢', '罪',
  '邪', '魔', '鬼', '尸', '骨',
]);

// 过大字（避免）
export const OVERWEIGHT_CHARS = new Set([
  '天', '帝', '王', '皇', '神', '圣', '霸',
]);

export type FilterReason =
  | 'hard_blacklist'
  | 'bad_meaning'
  | 'overweight'
  | 'soft_blacklist_exceeded';

export type FilterReport = {
  removed: Array<{ given_name: string; reason: FilterReason }>;
  warnings: Array<{ given_name: string; warning: string }>;
};

/**
 * 过滤掉硬黑名单 + 不吉字 + 过大字
 * 软黑名单：所有名字中含此类字的总数不超过 1 个
 */
export function filterByBlacklist<T extends { given_name: string }>(
  names: T[],
): { kept: T[]; report: FilterReport } {
  const report: FilterReport = { removed: [], warnings: [] };

  // Step 1: 硬黑名单 + 不吉字 + 过大字
  const survived = names.filter((n) => {
    if (HARD_BLACKLIST.has(n.given_name)) {
      report.removed.push({ given_name: n.given_name, reason: 'hard_blacklist' });
      return false;
    }
    for (const ch of n.given_name) {
      if (BAD_MEANING_CHARS.has(ch)) {
        report.removed.push({ given_name: n.given_name, reason: 'bad_meaning' });
        return false;
      }
      if (OVERWEIGHT_CHARS.has(ch)) {
        report.removed.push({ given_name: n.given_name, reason: 'overweight' });
        return false;
      }
    }
    return true;
  });

  // Step 2: 软黑名单 - 每组最多 1 个含 SOFT 字的
  let softCount = 0;
  const kept: T[] = [];
  for (const n of survived) {
    const hasSoft = [...n.given_name].some((c) => SOFT_BLACKLIST_CHARS.has(c));
    if (hasSoft) {
      if (softCount >= 1) {
        report.removed.push({ given_name: n.given_name, reason: 'soft_blacklist_exceeded' });
        continue;
      }
      softCount += 1;
      report.warnings.push({
        given_name: n.given_name,
        warning: '该名字含网红字（梓/萱/涵/轩/宸 等），重名率较高',
      });
    }
    kept.push(n);
  }

  return { kept, report };
}
