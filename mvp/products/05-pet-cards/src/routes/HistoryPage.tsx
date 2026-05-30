import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Sparkles } from 'lucide-react';
import { deleteResult, loadAllResults } from '@/lib/storage';
import { getMoodPalette } from '@/lib/moodColors';
import type { PetCardResult } from '@/lib/types';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState<PetCardResult[]>([]);

  useEffect(() => {
    setResults(loadAllResults());
  }, []);

  const onDelete = (id: string) => {
    if (!confirm('删除这条卡片？不可恢复')) return;
    deleteResult(id);
    setResults((rs) => rs.filter((r) => r.id !== id));
  };

  return (
    <div className="px-4 pt-4">
      <header className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          aria-label="返回"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-soft"
        >
          <ArrowLeft className="h-4 w-4 text-ink-muted" />
        </button>
        <div className="text-sm font-medium text-ink-dark">历史卡片</div>
        <span className="h-9 w-9" />
      </header>

      {results.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-bg-alt">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-3 text-base font-semibold text-ink-dark">还没有卡片</h2>
          <p className="mt-1 text-sm text-ink-muted">
            录段叫声，AI 会帮宝宝说出心声～
          </p>
          <Link
            to="/"
            className="mt-4 rounded-btn bg-primary px-5 py-2 text-sm font-medium text-white shadow-bubble"
          >
            去录第一段
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {results.map((r) => {
            const palette = getMoodPalette(r.mood_tag);
            const d = new Date(r.createdAt);
            const dateStr = `${d.getMonth() + 1}.${d.getDate()} ${d
              .getHours()
              .toString()
              .padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
            return (
              <li
                key={r.id}
                className="overflow-hidden rounded-card bg-white shadow-soft"
                style={{ borderLeft: `4px solid ${palette.primary}` }}
              >
                <Link to={`/result/${r.id}`} className="flex items-start gap-3 p-3">
                  <div
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: palette.secondary }}
                  >
                    <span className="text-2xl">{r.emoji_set[0] ?? '🐾'}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-bold text-ink-dark">{r.petName}</div>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                        style={{ background: palette.accent }}
                      >
                        {r.mood_tag} {palette.emoji}
                      </span>
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs text-ink-muted">
                      {r.translation[0] ?? ''}
                    </div>
                    <div className="mt-1.5 text-[10px] text-ink-light">{dateStr}</div>
                  </div>
                </Link>
                <div className="flex justify-end border-t border-ink-light/20 px-3 py-1.5">
                  <button
                    onClick={() => onDelete(r.id)}
                    className="inline-flex items-center gap-1 text-[11px] text-ink-muted"
                    aria-label="删除"
                  >
                    <Trash2 className="h-3 w-3" />
                    删除
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
