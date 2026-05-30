import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { loadDreams } from '@/lib/storage';
import type { DreamRecord } from '@/lib/types';

interface SymbolFreq {
  name: string;
  count: number;
}

export default function MonthlyPage() {
  const [items, setItems] = useState<DreamRecord[] | undefined>(undefined);

  useEffect(() => {
    setItems(loadDreams());
  }, []);

  const stats = useMemo(() => {
    if (!items) return null;
    const symbolMap = new Map<string, number>();
    const emotionMap = new Map<string, number>();
    for (const d of items) {
      if (!d.analysis) continue;
      for (const s of d.analysis.key_symbols) {
        symbolMap.set(s, (symbolMap.get(s) ?? 0) + 1);
      }
      for (const e of d.analysis.emotion_tags) {
        emotionMap.set(e, (emotionMap.get(e) ?? 0) + 1);
      }
    }
    const topSymbols: SymbolFreq[] = Array.from(symbolMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    const topEmotions: SymbolFreq[] = Array.from(emotionMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    return {
      total: items.length,
      analyzed: items.filter((i) => i.analysis).length,
      topSymbols,
      topEmotions,
    };
  }, [items]);

  if (!stats) {
    return <div className="py-12 text-center text-ink-muted">加载中…</div>;
  }

  return (
    <div className="space-y-5 animate-fade-in pt-2">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-xs text-ink-muted hover:text-primary inline-flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> 回到首页
        </Link>
        <h1 className="text-lg font-serif text-primary">月度报告</h1>
        <span />
      </div>

      <div className="surface-card p-5">
        <div className="text-xs text-ink-muted mb-1">本月梦境</div>
        <div className="text-3xl font-serif text-primary-dark">{stats.total}</div>
        <p className="text-xs text-ink-light mt-1">
          已完成分析：{stats.analyzed} / {stats.total}
        </p>
      </div>

      <section className="surface-card p-5 space-y-3">
        <h2 className="text-sm font-medium text-primary">意象云（高频出现）</h2>
        {stats.topSymbols.length === 0 ? (
          <p className="text-xs text-ink-muted">还没有可统计的意象。记录几个梦后再来看看。</p>
        ) : (
          <div className="flex flex-wrap gap-2 items-baseline">
            {stats.topSymbols.map((s, i) => (
              <span
                key={s.name}
                className="text-primary"
                style={{ fontSize: `${Math.min(14 + s.count * 4, 28)}px` }}
                title={`出现 ${s.count} 次`}
              >
                {s.name}
                <span className="text-[10px] text-ink-light ml-0.5">×{s.count}</span>
                {i < stats.topSymbols.length - 1 ? '·' : ''}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="surface-card p-5 space-y-3">
        <h2 className="text-sm font-medium text-primary">情绪关键词</h2>
        {stats.topEmotions.length === 0 ? (
          <p className="text-xs text-ink-muted">还没有可统计的情绪标签。</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {stats.topEmotions.map((e) => (
              <span
                key={e.name}
                className="text-xs px-2.5 py-1 rounded-full bg-bg-alt text-ink-muted"
              >
                # {e.name} · {e.count}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="surface-card p-5 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          下一步可以问自己
        </div>
        <ul className="list-disc pl-5 text-sm text-ink leading-relaxed space-y-1">
          <li>本月出现最多的意象，让你想到生活中的什么？</li>
          <li>哪一种情绪关键词在你白天的生活中也常常出现？</li>
          <li>有没有梦境留下了你想再读一遍的句子？</li>
        </ul>
      </section>

      <p className="text-[11px] text-ink-light text-center px-2 pt-2">
        月度报告基于你的记录数据生成；统计本身不构成任何形式的医疗诊断或预测。
      </p>
    </div>
  );
}
