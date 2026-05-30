import { useEffect, useState } from 'react';
import { formatCount, getDisplayCount, STATS_SEED } from '@/lib/stats';

type Props = {
  statKey: keyof typeof STATS_SEED;
  /** 完整 label，例如 "已生成 ${count} 个名字" 中除 count 外部分 */
  prefix: string;
  suffix: string;
  className?: string;
};

/**
 * 首页右上角 / hero 显眼数字徽章。
 * 首帧渲染 0（STATS_SEED 已全部归零），mount 后从 localStorage 读取
 * 当前用户本地真实累计数。新用户看到 0。
 */
export function StatBadge({ statKey, prefix, suffix, className }: Props) {
  const [count, setCount] = useState<number>(STATS_SEED[statKey]);

  useEffect(() => {
    setCount(getDisplayCount(statKey));
  }, [statKey]);

  return (
    <span
      className={
        className ??
        'inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent-dark'
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
      {prefix}
      <span className="font-bold tabular-nums">{formatCount(count)}</span>
      {suffix}
    </span>
  );
}
