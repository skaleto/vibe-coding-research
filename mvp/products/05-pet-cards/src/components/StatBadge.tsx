'use client';

import { useEffect, useState } from 'react';
import { formatCount, getDisplayCount, STATS_SEED } from '@/lib/stats';

type Props = {
  statKey: keyof typeof STATS_SEED;
  prefix: string;
  suffix: string;
  className?: string;
};

export function StatBadge({ statKey, prefix, suffix, className }: Props) {
  const [count, setCount] = useState<number>(STATS_SEED[statKey]);
  useEffect(() => {
    setCount(getDisplayCount(statKey));
  }, [statKey]);

  return (
    <span
      className={
        className ??
        'inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary'
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
      {prefix}
      <span className="font-bold tabular-nums">{formatCount(count)}</span>
      {suffix}
    </span>
  );
}

/** "已生成 X 张 · 分享 Y 次" 紧凑双数字版（首页 hero 用） */
export function DualStatBadge({
  className,
}: {
  className?: string;
}) {
  const [generated, setGenerated] = useState<number>(STATS_SEED.cardsGenerated);
  const [shared, setShared] = useState<number>(STATS_SEED.cardsShared);

  useEffect(() => {
    setGenerated(getDisplayCount('cardsGenerated'));
    setShared(getDisplayCount('cardsShared'));
  }, []);

  return (
    <span
      className={
        className ??
        'inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-medium text-primary'
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
      <span>
        已生成 <span className="font-bold tabular-nums">{formatCount(generated)}</span> 张
      </span>
      <span aria-hidden="true" className="opacity-60">·</span>
      <span>
        <span className="font-bold tabular-nums">{formatCount(shared)}</span> 次分享
      </span>
    </span>
  );
}
