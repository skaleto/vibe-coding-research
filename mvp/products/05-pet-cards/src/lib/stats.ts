/**
 * 宠物心情卡片 stats —— 仅显示 localStorage 真实计数
 *
 * 历史教训：之前 SEED 设为 1568 + 421，首页显示"已生成 1,568+ 张
 *  · 分享 421+ 次"对新用户是虚构数据 —— 这与 PRD 里把"虚假效果
 * 措辞"列为退一赔三风险的立场直接冲突。已改为 0。
 *
 * ⚠️ 合规护栏（与 prompt.ts 同步禁词清单）：
 * - 文案禁词清单见 lib/prompt.ts 和 lib/llm.ts
 * - 不能承诺"准确率/真实意图/精度"
 * - 只用"生成/分享"等娱乐性中性词
 *
 * STATS_SEED 保留导出仅为 `keyof typeof STATS_SEED` 提供类型约束。
 */

export const STATS_SEED = {
  /** 已生成的萌系对白卡片数（仅本地真实计数） */
  cardsGenerated: 0,
  /** 已被分享的卡片数（仅本地真实计数） */
  cardsShared: 0,
} as const;

const STORAGE_KEY = 'pet-cards:stats:v1';

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
