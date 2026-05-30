import { useMemo } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

import type { CalendarDay, CalendarType } from '@/lib/schema';

const TYPE_META: Record<CalendarType, { icon: string; label: string; color: string }> = {
  watering: { icon: '💧', label: '浇水', color: 'bg-blue-100 text-blue-700' },
  fertilizing: { icon: '🌱', label: '施肥', color: 'bg-green-100 text-green-700' },
  lighting: { icon: '☀️', label: '光照', color: 'bg-yellow-100 text-yellow-800' },
  ventilation: { icon: '💨', label: '通风', color: 'bg-sky-100 text-sky-700' },
  observation: { icon: '👁', label: '观察', color: 'bg-stone-100 text-stone-700' },
  repotting: { icon: '🪴', label: '换盆', color: 'bg-amber-100 text-amber-800' },
  consult: { icon: '💬', label: '咨询', color: 'bg-rose-100 text-rose-700' },
};

export interface CareCalendarProps {
  days: CalendarDay[];
  /** day -> 是否已完成 */
  checked: Record<number, boolean>;
  onToggle: (day: number) => void;
}

export function CareCalendar({ days, checked, onToggle }: CareCalendarProps) {
  // 把 1-30 天填满；用户日历可能只有几个关键节点。
  const byDay = useMemo(() => {
    const m = new Map<number, CalendarDay>();
    for (const d of days) m.set(d.day, d);
    return m;
  }, [days]);

  const completedCount = Object.values(checked).filter(Boolean).length;
  const totalTasks = days.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-ink-muted">
        <span>
          完成 <b className="text-primary">{completedCount}</b> / {totalTasks} 项任务
        </span>
        <span className="text-xs">7×5 网格 · 30 天</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {/* 7×5 = 35 格，1..30 用得到，剩 5 格留白 */}
        {Array.from({ length: 35 }).map((_, idx) => {
          const day = idx + 1;
          if (day > 30) {
            return <div key={idx} className="aspect-square rounded-btn bg-transparent" />;
          }
          const entry = byDay.get(day);
          const isChecked = !!checked[day];

          if (!entry) {
            return (
              <div
                key={idx}
                className="flex aspect-square flex-col items-center justify-center rounded-btn bg-bg-paper text-[10px] text-ink-light"
              >
                <span className="text-[10px] opacity-50">{day}</span>
                <span className="opacity-40">—</span>
              </div>
            );
          }
          const meta = TYPE_META[entry.type];

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onToggle(day)}
              className={`group relative flex aspect-square flex-col items-center justify-center rounded-btn border text-[10px] transition ${
                isChecked
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-primary/15 bg-bg-paper hover:bg-bg-alt'
              }`}
              title={`Day ${day}：${entry.action}`}
              aria-pressed={isChecked}
            >
              <span className="absolute left-1 top-0.5 text-[9px] text-ink-muted">
                {day}
              </span>
              <span className="text-lg leading-none">{meta.icon}</span>
              <span className="mt-0.5 text-[9px]">{meta.label}</span>
              {isChecked && (
                <span className="absolute right-0.5 top-0.5 text-primary">
                  <CheckCircle2 className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-card border border-primary/10 bg-bg-paper">
        <div className="border-b border-primary/10 px-4 py-3 text-sm font-medium">
          完整任务列表（按天序）
        </div>
        <ul className="divide-y divide-primary/5">
          {days.map((d) => {
            const meta = TYPE_META[d.type];
            const isChecked = !!checked[d.day];
            return (
              <li key={d.day} className="flex items-start gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => onToggle(d.day)}
                  className="mt-0.5 text-primary"
                  aria-label={isChecked ? '标记为未完成' : '标记为已完成'}
                >
                  {isChecked ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5 text-ink-light" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                      Day {d.day}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${meta.color}`}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </span>
                  </div>
                  <p
                    className={`mt-1 text-sm ${
                      isChecked ? 'text-ink-muted line-through' : 'text-ink'
                    }`}
                  >
                    {d.action}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
