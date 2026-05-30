import type { ReactNode } from 'react';
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';

export function FormSection({
  title,
  children,
  onAdd,
  addLabel,
}: {
  title: string;
  children: ReactNode;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <section className="rounded-xl border border-canvas-DEFAULT bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-ink">{title}</h2>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1 rounded-md bg-brand-light px-2.5 py-1 text-[12px] font-medium text-brand transition hover:bg-brand hover:text-white"
          >
            <Plus size={13} />
            {addLabel ?? '添加'}
          </button>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

// 可重复条目的外壳：右上角带上移 / 下移 / 删除
export function ItemCard({
  children,
  onMoveUp,
  onMoveDown,
  onRemove,
  canMoveUp,
  canMoveDown,
  canRemove,
  index,
}: {
  children: ReactNode;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canRemove: boolean;
  index: number;
}) {
  return (
    <div className="relative rounded-lg border border-dashed border-ink-faint bg-canvas-DEFAULT/40 p-3">
      <div className="absolute right-2 top-2 flex items-center gap-0.5">
        <IconBtn disabled={!canMoveUp} onClick={onMoveUp} title="上移">
          <ChevronUp size={14} />
        </IconBtn>
        <IconBtn disabled={!canMoveDown} onClick={onMoveDown} title="下移">
          <ChevronDown size={14} />
        </IconBtn>
        <IconBtn disabled={!canRemove} onClick={onRemove} title="删除" danger>
          <Trash2 size={13} />
        </IconBtn>
      </div>
      <div className="mb-2 text-[11px] font-medium text-ink-light">条目 {index + 1}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  title,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex h-6 w-6 items-center justify-center rounded transition disabled:opacity-30',
        danger
          ? 'text-ink-light hover:bg-red-50 hover:text-red-500'
          : 'text-ink-light hover:bg-canvas-DEFAULT hover:text-ink',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
