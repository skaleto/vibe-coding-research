import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { loadDreams } from '@/lib/storage';
import type { DreamRecord } from '@/lib/types';
import { Placeholder } from '@/components/Placeholder';

const SCHOOL_LABEL = {
  jungian: '荣格',
  freudian: '弗洛伊德',
  gestalt: '格式塔',
} as const;

export default function TimelinePage() {
  const [items, setItems] = useState<DreamRecord[] | undefined>(undefined);

  useEffect(() => {
    setItems(loadDreams());
  }, []);

  if (items === undefined) {
    return <div className="py-12 text-center text-ink-muted">加载中…</div>;
  }

  return (
    <div className="space-y-5 animate-fade-in pt-2">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-xs text-ink-muted hover:text-primary inline-flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> 回到首页
        </Link>
        <h1 className="text-lg font-serif text-primary">梦境时间轴</h1>
        <span />
      </div>

      {items.length === 0 ? (
        <div className="space-y-4">
          <Placeholder
            kind="empty-timeline"
            aspect="16/9"
            caption="空时间轴 / 沉睡中的月亮"
            spec="深紫底 + 月白点缀；占位文案：「这里会渐渐有你的梦境」"
          />
          <div className="surface-card p-6 text-center text-sm text-ink-muted space-y-3">
            <BookOpen className="w-6 h-6 mx-auto text-primary" aria-hidden="true" />
            <p>还没有记录的梦。回到首页，记录今晚做的第一个吧。</p>
            <Link to="/" className="btn-primary inline-flex">
              开始记录
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((d) => (
            <li key={d.id}>
              <Link
                to={`/result/${d.id}`}
                className="surface-card p-4 block hover:shadow-card transition"
              >
                <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
                  <span>{format(parseISO(d.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                  <span>{SCHOOL_LABEL[d.school]}</span>
                </div>
                <p className="text-sm text-ink line-clamp-2 leading-relaxed">{d.text}</p>
                {d.analysis ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {d.analysis.key_symbols.slice(0, 4).map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-bg-alt text-ink-muted">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
