import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Settings, Sparkles } from 'lucide-react';
import { useCountdownStore } from '@/lib/store';
import { CountdownCard } from '@/components/CountdownCard';
import { StatBadge } from '@/components/StatBadge';
import { computeView } from '@/lib/dateMath';

export default function ListPage() {
  const cards = useCountdownStore((s) => s.cards);
  const hydrated = useCountdownStore((s) => s.hydrated);

  // Sort: countdowns ascending by days-left, then countups by days-elapsed.
  const sorted = useMemo(() => {
    return [...cards].sort((a, b) => {
      const va = computeView(a);
      const vb = computeView(b);
      return va.signedDays - vb.signedDays;
    });
  }, [cards]);

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-6 list-bottom-pad">
      <header className="flex items-start justify-between mb-6 sm:mb-8 gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.3em] opacity-60">
            Fire your reminder app
          </div>
          <h1
            className="text-3xl font-bold mt-1"
            style={{ color: 'var(--theme-text)' }}
          >
            比 iOS 提醒事项美 10 倍
          </h1>
          {/* 大字号 + 强调色：把"X 件正在惦记的事"放大成 hero 数字 */}
          {hydrated ? (
            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span
                className="text-4xl font-bold tabular-nums leading-none"
                style={{ color: 'var(--theme-primary)' }}
              >
                {cards.length}
              </span>
              <span className="text-sm opacity-70">件正在惦记的事</span>
              <StatBadge
                statKey="createdTotal"
                prefix="累计创建 "
                suffix=""
                className="ml-0"
              />
            </div>
          ) : (
            <p className="text-sm opacity-70 mt-1">加载中…</p>
          )}
        </div>
        <Link
          to="/settings"
          aria-label="设置"
          className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-black/5 shrink-0"
          style={{ color: 'var(--theme-text)' }}
        >
          <Settings size={18} />
        </Link>
      </header>

      {hydrated && sorted.length === 0 && <EmptyState />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sorted.map((card) => (
          <CountdownCard key={card.id} card={card} />
        ))}
      </div>

      <Link
        to="/new"
        aria-label="新建倒数日"
        className="fixed bottom-6 right-6 sm:right-10 inline-flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
        style={{
          background: 'var(--theme-primary)',
          color: 'var(--theme-surface)',
        }}
      >
        <Plus size={26} />
      </Link>
    </main>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-3xl p-6 sm:p-8 text-center"
      style={{
        background: 'var(--theme-surface)',
        color: 'var(--theme-text)',
      }}
    >
      <img
        src="/placeholders/hero-themes.png"
        alt="倒数日主题预览"
        className="mb-5 aspect-video w-full rounded-2xl object-cover shadow-sm"
      />
      <div className="mx-auto inline-flex items-center justify-center h-14 w-14 rounded-full"
        style={{ background: 'var(--theme-bg)' }}>
        <Sparkles size={26} />
      </div>
      <h2 className="text-lg font-semibold mt-3">还没有倒数日</h2>
      <p className="text-sm opacity-70 mt-1">
        点击右下角的 + 创建第一个，或先去设置页切个主题。
      </p>
      <div className="mt-4 flex gap-2 justify-center">
        <Link to="/new" className="btn btn-primary text-sm">
          <Plus size={16} /> 新建
        </Link>
        <Link to="/settings" className="btn btn-ghost text-sm">
          <Settings size={16} /> 设置
        </Link>
      </div>
    </div>
  );
}
