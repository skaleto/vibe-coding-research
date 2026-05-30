import { Lock, Check } from 'lucide-react';
import { TEMPLATES } from '@/lib/templates';
import type { TemplateId } from '@/lib/types';

interface TemplatePickerProps {
  current: TemplateId;
  paid: boolean;
  onPick: (id: TemplateId) => void;
  /** 点了锁定模板时触发付费墙 */
  onLockedPick: () => void;
}

// 模板缩略选择：用迷你版式预览（纯 CSS 画，零图片资源），锁定模板显示锁标。
export function TemplatePicker({ current, paid, onPick, onLockedPick }: TemplatePickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {TEMPLATES.map((t) => {
        const locked = !t.free && !paid;
        const active = current === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => (locked ? onLockedPick() : onPick(t.id))}
            className={[
              'group relative overflow-hidden rounded-lg border-2 bg-white p-2 text-left transition',
              active ? 'border-brand shadow-card' : 'border-transparent hover:border-ink-faint',
            ].join(' ')}
            title={locked ? `${t.name}（¥9 解锁）` : t.name}
          >
            <Thumb id={t.id} accent={t.accent} />
            <div className="mt-1.5">
              <div className="flex items-center gap-1 text-[12px] font-semibold text-ink">
                {t.name}
                {t.free && (
                  <span className="rounded bg-green-100 px-1 text-[9px] font-medium text-green-700">
                    免费
                  </span>
                )}
              </div>
              <div className="truncate text-[10px] text-ink-light">{t.desc}</div>
            </div>

            {active && (
              <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white">
                <Check size={12} />
              </span>
            )}
            {locked && (
              <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-white">
                <Lock size={11} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// 用纯 CSS 画一个迷你版式骨架作缩略图，避免引入图片资源。
function Thumb({ id, accent }: { id: TemplateId; accent: string }) {
  if (id === 'blue') {
    return (
      <div className="flex aspect-[0.72] w-full overflow-hidden rounded bg-neutral-50">
        <div className="w-1/3" style={{ background: accent }} />
        <div className="flex-1 space-y-1 p-1.5">
          <div className="h-1.5 w-2/3 rounded" style={{ background: accent }} />
          <div className="h-1 w-full rounded bg-neutral-200" />
          <div className="h-1 w-5/6 rounded bg-neutral-200" />
          <div className="h-1 w-full rounded bg-neutral-200" />
        </div>
      </div>
    );
  }
  if (id === 'creative') {
    return (
      <div className="aspect-[0.72] w-full space-y-1 overflow-hidden rounded bg-neutral-50 p-1.5">
        <div className="h-3 w-full rounded" style={{ background: accent }} />
        <div className="ml-1.5 border-l-2 pl-1.5" style={{ borderColor: accent }}>
          <div className="h-1 w-2/3 rounded bg-neutral-300" />
          <div className="mt-0.5 h-1 w-full rounded bg-neutral-200" />
          <div className="mt-1 h-1 w-2/3 rounded bg-neutral-300" />
          <div className="mt-0.5 h-1 w-full rounded bg-neutral-200" />
        </div>
      </div>
    );
  }
  if (id === 'academic') {
    return (
      <div className="aspect-[0.72] w-full space-y-1 overflow-hidden rounded bg-neutral-50 p-1.5">
        <div className="mx-auto h-1.5 w-1/2 rounded bg-neutral-700" />
        <div className="mx-auto h-0.5 w-1/3 rounded bg-neutral-300" />
        <div className="mt-1 border-b border-neutral-400 pb-0.5">
          <div className="h-1 w-1/3 rounded bg-neutral-500" />
        </div>
        <div className="h-1 w-full rounded bg-neutral-200" />
        <div className="h-1 w-5/6 rounded bg-neutral-200" />
      </div>
    );
  }
  // minimal
  return (
    <div className="aspect-[0.72] w-full space-y-1 overflow-hidden rounded bg-neutral-50 p-1.5">
      <div className="flex items-center justify-between border-b-2 border-neutral-700 pb-1">
        <div className="h-1.5 w-1/3 rounded bg-neutral-700" />
        <div className="h-1 w-1/4 rounded bg-neutral-300" />
      </div>
      <div className="h-1 w-1/3 rounded bg-neutral-400" />
      <div className="h-1 w-full rounded bg-neutral-200" />
      <div className="h-1 w-5/6 rounded bg-neutral-200" />
      <div className="h-1 w-full rounded bg-neutral-200" />
    </div>
  );
}
