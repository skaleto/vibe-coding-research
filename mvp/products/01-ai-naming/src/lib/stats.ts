/**
 * 首页数字 banner —— 仅显示 localStorage 真实计数
 *
 * 历史教训：之前用 SEED (1247) + localStorage 累计给首页"撑数字"，
 * 显示"已生成 1,247+ 个名字"。本质上是伪造社交证明 —— 一个全新用户
 * 第一次打开就看到 1247，这是虚假宣传，与项目的 compliance-checklist
 * 立场矛盾。
 *
 * 现在：SEED 全为 0；首页老实显示 0；用户完成核心动作时 +1 累计；
 * 显示的就是当前用户本地真实触发过的次数。
 *
 * STATS_SEED 保留导出仅为 `keyof typeof STATS_SEED` 提供类型约束
 * （components/StatBadge.tsx 用到）。
 */

export const STATS_SEED = {
  /** 已通过 verify_quote 校验生成过的名字数（仅本地真实计数） */
  generated: 0,
} as const;

const STORAGE_KEY = 'ai-naming:stats:v1';

type StatsKey = keyof typeof STATS_SEED;

type StatsState = Partial<Record<StatsKey, number>>;

/** 仅在浏览器读 localStorage；非浏览器环境（如测试）返回 SEED */
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

/** 在某个动作触发后调用（例如成功生成名字后 +10） */
export function bumpStat(key: StatsKey, by = 1): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const local: StatsState = raw ? JSON.parse(raw) : {};
    local[key] = (local[key] ?? 0) + by;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
  } catch {
    /* 静默 —— stats 不能阻断主流程 */
  }
}

/** 千分位格式化：1247 -> 1,247 */
export function formatCount(n: number): string {
  return n.toLocaleString('en-US');
}
