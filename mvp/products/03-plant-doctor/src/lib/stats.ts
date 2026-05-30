/**
 * 植物医生 stats —— 仅显示 localStorage 真实计数
 *
 * 历史教训：之前 SEED 设为 832，首页显示"已分析 832+ 株"对新用户
 * 是虚构数据。已改为 0。
 *
 * ⚠️ 合规：禁词清单见 lib/lintAction.ts。文案用"已分析"是中性观察类
 * 动词，不能用"已治愈/已诊断"等暗示治疗结果的词。
 *
 * STATS_SEED 保留导出仅为 `keyof typeof STATS_SEED` 提供类型约束。
 */

export const STATS_SEED = {
  /** 已分析的植物图片数（仅本地真实计数） */
  analyzed: 0,
} as const;

const STORAGE_KEY = 'plant-doctor:stats:v1';

type StatsKey = keyof typeof STATS_SEED;
type StatsState = Partial<Record<StatsKey, number>>;

export function getDisplayCount(key: StatsKey): number {
  if (typeof window === 'undefined') return STATS_SEED[key];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const local: StatsState = raw ? JSON.parse(raw) : {};
    const localValue = typeof local[key] === 'number' ? (local[key] as number) : 0;
    return STATS_SEED[key] + localValue;
  } catch {
    return STATS_SEED[key];
  }
}

export function bumpStat(key: StatsKey, by = 1): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const local: StatsState = raw ? JSON.parse(raw) : {};
    local[key] = (local[key] ?? 0) + by;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
  } catch {
    /* silent */
  }
}

export function formatCount(n: number): string {
  return n.toLocaleString('en-US');
}
