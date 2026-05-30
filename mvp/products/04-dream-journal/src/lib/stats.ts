/**
 * 梦境日记 stats —— 仅显示 localStorage 真实计数
 *
 * 历史教训：之前 SEED 设为 593，首页显示"已记录 593+ 个梦境"对
 * 新用户是虚构数据。在 dream-journal 这种主打"危机干预合规"的产品
 * 上同时做伪造社交证明，自相矛盾尤其严重。已改为 0。
 *
 * ⚠️ 合规：完整禁词清单见 lib/complianceLint.ts FORBIDDEN_PHRASES。
 * 用"已记录"这种中性记录类动词；不抓 dream 内容做任何展示，只 +1
 * 累计计数器。
 *
 * STATS_SEED 保留导出仅为 `keyof typeof STATS_SEED` 提供类型约束。
 */

export const STATS_SEED = {
  /** 已记录的梦境数（仅本地真实计数） */
  recorded: 0,
} as const;

const STORAGE_KEY = 'dream-journal:stats:v1';

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
