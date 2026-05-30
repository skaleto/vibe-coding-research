/**
 * 倒数日 stats —— 仅显示 localStorage 真实计数
 *
 * 历史教训：之前 SEED 设为 8234，首页 banner 显示"已创建 8,234+ 件"，
 * 对新用户而言是伪造的社交证明。已改为 0。
 *
 * currentCards 是 zustand 实时数（正在挂着的）；createdTotal 是
 * 历史新建过的总数（含已删除）。两者维度不同，都基于本地真实操作。
 *
 * STATS_SEED 保留导出仅为 `keyof typeof STATS_SEED` 提供类型约束。
 */

export const STATS_SEED = {
  /** 累计已创建过的倒数日（仅本地真实计数） */
  createdTotal: 0,
} as const;

const STORAGE_KEY = 'countdown-pro:stats:v1';

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
