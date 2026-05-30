import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Info, ArrowLeft, RefreshCcw } from 'lucide-react';
import { loadDream } from '@/lib/storage';
import type { DreamRecord } from '@/lib/types';
import { DISCLAIMER_TOP, DISCLAIMER_FOOTER } from '@/lib/disclaimer';
import { SymbolChips } from '@/components/SymbolChips';
import { CrisisWarmCard } from '@/components/CrisisWarmCard';

const SCHOOL_LABEL = {
  jungian: '荣格',
  freudian: '弗洛伊德',
  gestalt: '格式塔',
} as const;

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<DreamRecord | null | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setRecord(null);
      return;
    }
    setRecord(loadDream(id));
  }, [id]);

  if (record === undefined) {
    return <div className="py-12 text-center text-ink-muted">加载中…</div>;
  }
  if (record === null || !record.analysis) {
    return (
      <div className="surface-card p-8 text-center space-y-4">
        <p className="text-ink-muted">找不到这份梦境记录。</p>
        <Link to="/" className="btn-ghost">
          <ArrowLeft className="w-4 h-4" />
          回到首页
        </Link>
      </div>
    );
  }

  const a = record.analysis;

  return (
    <div className="space-y-5 animate-fade-in pt-2">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-xs text-ink-muted hover:text-primary inline-flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> 回到首页
        </Link>
        <Link to="/timeline" className="text-xs text-ink-muted hover:text-primary inline-flex items-center gap-1">
          时间轴
        </Link>
      </div>

      {/* 顶部 disclaimer（客户端强制注入，不依赖 LLM 自觉） */}
      <div className="flex items-start gap-2 bg-bg-alt/70 border border-ink-light/30 rounded-card p-3 text-xs text-ink-muted leading-relaxed">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
        <span>{DISCLAIMER_TOP}</span>
      </div>

      <section className="surface-card p-4 space-y-2">
        <div className="text-xs text-ink-muted">你记录的梦</div>
        <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{record.text}</p>
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-ink-light">
          <span className="px-2 py-0.5 rounded-full bg-bg-alt">流派：{SCHOOL_LABEL[record.school]}</span>
          {record.mood ? (
            <span className="px-2 py-0.5 rounded-full bg-bg-alt">情绪：{record.mood}</span>
          ) : null}
        </div>
      </section>

      <section className="surface-card p-5 space-y-3">
        <h2 className="text-sm font-medium text-primary">核心意象</h2>
        <SymbolChips symbols={a.key_symbols} />
      </section>

      <section className="surface-card p-5 space-y-3">
        <h2 className="text-sm font-medium text-primary">{SCHOOL_LABEL[record.school]}视角的解读</h2>
        <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{a.psychology_view}</p>
      </section>

      <section className="surface-card p-5 space-y-3">
        <h2 className="text-sm font-medium text-primary">三种视角对比</h2>
        <div className="space-y-3">
          {a.views.map((v) => (
            <div key={v.school} className="text-sm leading-relaxed">
              <div className="text-xs text-accent-dark mb-0.5">{v.schoolLabel}</div>
              <p className="text-ink">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card p-5 space-y-3">
        <h2 className="text-sm font-medium text-primary">3 个反思问题</h2>
        <ol className="space-y-2 list-decimal pl-5 text-sm text-ink">
          {a.reflection_questions.map((q, i) => (
            <li key={i} className="leading-relaxed">
              {q}
            </li>
          ))}
        </ol>
      </section>

      <section className="surface-card p-5 space-y-2">
        <h2 className="text-sm font-medium text-primary">情绪关键词</h2>
        <div className="flex flex-wrap gap-2">
          {a.emotion_tags.map((t) => (
            <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-bg-alt text-ink-muted">
              # {t}
            </span>
          ))}
        </div>
      </section>

      <section className="surface-card p-5 space-y-2">
        <div className="text-xs text-ink-muted">下一步</div>
        <p className="text-sm text-ink leading-relaxed">{a.next_step}</p>
      </section>

      {/* 二 / 三级触发：附加暖色卡片（一级永远不会到达此页面） */}
      {a.crisis_alert && (a.crisis_alert.level === 2 || a.crisis_alert.level === 3) ? (
        <CrisisWarmCard level={a.crisis_alert.level} />
      ) : null}

      <p className="text-[11px] text-ink-light leading-relaxed text-center px-2">
        {DISCLAIMER_FOOTER}
      </p>

      <div className="flex gap-2 pt-2">
        <Link to="/" className="btn-ghost flex-1">
          <RefreshCcw className="w-4 h-4" />
          再记一个梦
        </Link>
        <Link to="/timeline" className="btn-primary flex-1">
          查看时间轴
        </Link>
      </div>
    </div>
  );
}
