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
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium'
      }
      style={{
        background: 'color-mix(in oklab, var(--theme-primary) 12%, transparent)',
        color: 'var(--theme-primary)',
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full animate-pulse"
        style={{ background: 'var(--theme-primary)' }}
        aria-hidden="true"
      />
      {prefix}
      <span className="font-bold tabular-nums">{formatCount(count)}</span>
      {suffix}
    </span>
  );
}
