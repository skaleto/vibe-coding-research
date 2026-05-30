import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Leaf, Trash2 } from 'lucide-react';

import { deleteDiagnosis, listDiagnoses, type SavedDiagnosis } from '@/lib/store';

/**
 * MyPlantsPage —— "/my-plants"。
 *
 * localStorage 全量列表；按 createdAt 倒序，可删除。
 */
export default function MyPlantsPage() {
  const [items, setItems] = useState<SavedDiagnosis[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(listDiagnoses());
    setHydrated(true);
  }, []);

  function handleDelete(id: string) {
    if (!window.confirm('删除这个诊断记录？此操作不可恢复。')) return;
    deleteDiagnosis(id);
    setItems(listDiagnoses());
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-ink-muted">我的植物档案</div>
          <h1 className="mt-1 text-2xl font-bold text-ink">
            <span className="text-primary">{items.length}</span> 株正在追踪
          </h1>
          <p className="mt-1 text-xs text-ink-muted">
            仅保存在本机；卸载 / 清缓存会丢失。MVP 阶段没有云同步。
          </p>
        </div>
        <Link
          to="/capture"
          className="inline-flex items-center gap-2 rounded-btn bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft"
        >
          <Camera className="h-4 w-4" />
          新建诊断
        </Link>
      </header>

      {hydrated && items.length === 0 && <EmptyState />}

      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <li
            key={it.id}
            className="group rounded-card border border-primary/10 bg-bg-paper shadow-soft transition hover:border-primary/30"
          >
            <Link to={`/result/${it.id}`} className="block p-4">
              <div className="flex items-start gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-btn border border-primary/10 bg-white">
                  {it.thumb ? (
                    <img src={it.thumb} alt={it.nickname ?? '植物缩略图'} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-light">
                      <Leaf className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-ink">
                    {it.nickname || it.result.plant_name || '未命名植物'}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-muted">
                    {new Date(it.createdAt).toLocaleString('zh-CN')}
                  </div>
                  <PreviewTopCause record={it} />
                </div>
              </div>
            </Link>
            <div className="flex items-center justify-between border-t border-primary/5 px-4 py-2">
              <span className="text-[11px] text-ink-muted">
                完成 {Object.values(it.calendarChecked).filter(Boolean).length} /{' '}
                {it.result.calendar_30d.length} 项
              </span>
              <button
                type="button"
                onClick={() => handleDelete(it.id)}
                className="inline-flex items-center gap-1 rounded-btn px-2 py-1 text-[11px] text-ink-muted hover:bg-status-danger/10 hover:text-status-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
                删除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PreviewTopCause({ record }: { record: SavedDiagnosis }) {
  const top = record.result.diagnosis[0];
  if (!top) {
    return <div className="mt-1 text-xs text-ink-muted">暂无诊断假设</div>;
  }
  return (
    <div className="mt-1 line-clamp-2 text-xs text-ink-muted">
      <span className="font-medium text-ink">{top.cause}</span>
      <span className="ml-1 opacity-70">· 可能性 {top.likelihood} · 严重 {top.severity}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-card border border-dashed border-primary/30 bg-bg-paper px-6 py-10 text-center text-sm text-ink-muted">
      还没有诊断记录。
      <Link to="/capture" className="ml-2 font-medium text-primary hover:underline">
        现在拍叶子
      </Link>
    </div>
  );
}
