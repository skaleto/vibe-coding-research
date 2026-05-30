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
