import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Countdown, CountdownDraft, CountdownType, ThemeId, TimeUnit } from '@/lib/types';
import { useCountdownStore } from '@/lib/store';
import { bumpStat } from '@/lib/stats';
import { ThemePicker } from './ThemePicker';
import { EmojiPicker } from './EmojiPicker';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

interface CountdownFormProps {
  mode: 'create' | 'edit';
  initial?: Countdown;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function plusOneMonthIso(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export function CountdownForm({ mode, initial }: CountdownFormProps) {
  const navigate = useNavigate();
  const addCard = useCountdownStore((s) => s.addCard);
  const updateCard = useCountdownStore((s) => s.updateCard);
  const deleteCard = useCountdownStore((s) => s.deleteCard);
  const defaultTheme = useCountdownStore((s) => s.settings.defaultTheme);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [targetDate, setTargetDate] = useState(
    initial?.targetDate ?? plusOneMonthIso(),
  );
  const [type, setType] = useState<CountdownType>(initial?.type ?? 'countdown');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🎯');
  const [theme, setTheme] = useState<ThemeId>(initial?.theme ?? defaultTheme);
  const [unit, setUnit] = useState<TimeUnit>(initial?.unit ?? 'day');
  const [note, setNote] = useState(initial?.note ?? '');
  const [notify, setNotify] = useState(initial?.notify ?? false);
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('请填写标题');
      return;
    }
    if (!targetDate) {
      setError('请选择日期');
      return;
    }
    const draft: CountdownDraft = {
      title: title.trim(),
      targetDate,
      type,
      emoji,
      theme,
      unit,
      note: note.trim(),
      notify,
    };
    if (mode === 'create') {
      const created = addCard(draft);
      bumpStat('createdTotal', 1);
      navigate(`/${created.id}`);
    } else if (initial) {
      updateCard(initial.id, draft);
      navigate(`/${initial.id}`);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-2xl px-4 sm:px-6 py-6 space-y-6"
      style={{ color: 'var(--theme-text)' }}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
        >
          <ArrowLeft size={16} /> 返回
        </button>
        <h1 className="text-base font-semibold">
          {mode === 'create' ? '新建倒数日' : '编辑倒数日'}
        </h1>
        <button
          type="submit"
          className="btn btn-primary text-sm"
          aria-label="保存"
        >
          <Save size={16} /> 保存
        </button>
      </div>

      <div className="flex items-center gap-3">
        <EmojiPicker value={emoji} onChange={setEmoji} themeId={theme} />
        <div className="flex-1">
          <label htmlFor="title" className="sr-only">标题</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="填一件值得期待的事"
            className="w-full bg-transparent border-b py-2 text-xl font-semibold focus:outline-none"
            style={{ borderColor: 'var(--theme-muted)' }}
            maxLength={60}
            required
          />
        </div>
      </div>

      <Section title="日期">
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          min="1970-01-01"
          max="2100-12-31"
          className="w-full rounded-xl border px-3 py-2 bg-transparent"
          style={{ borderColor: 'var(--theme-muted)' }}
        />
        <div className="flex items-center gap-2 text-xs opacity-70 mt-1">
          <button
            type="button"
            className="underline"
            onClick={() => setTargetDate(todayIso())}
          >
            今天
          </button>
          <span>·</span>
          <button
            type="button"
            className="underline"
            onClick={() => setTargetDate(plusOneMonthIso())}
          >
            一个月后
          </button>
        </div>
      </Section>

      <Section title="类型">
        <div className="flex gap-2">
          <Chip active={type === 'countdown'} onClick={() => setType('countdown')}>
            倒数（未来）
          </Chip>
          <Chip active={type === 'countup'} onClick={() => setType('countup')}>
            正数（已过）
          </Chip>
        </div>
      </Section>

      <Section title="单位">
        <div className="flex flex-wrap gap-2">
          {(['day', 'week', 'month', 'year'] as TimeUnit[]).map((u) => (
            <Chip key={u} active={unit === u} onClick={() => setUnit(u)}>
              {{ day: '天', week: '周', month: '月', year: '年' }[u]}
            </Chip>
          ))}
        </div>
      </Section>

      <Section title="主题">
        <ThemePicker value={theme} onChange={setTheme} compact />
        <p className="text-xs opacity-60 mt-2">
          MVP 阶段 5 套主题全部免费。正式版会按 PRD 启用 ¥18 永久解锁付费墙。
        </p>
      </Section>

      <Section title="备注">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={400}
          placeholder="写下你想记得的事，最多 400 字"
          className="w-full rounded-xl border px-3 py-2 bg-transparent resize-none"
          style={{ borderColor: 'var(--theme-muted)' }}
        />
      </Section>

      <Section title="提醒">
        <label className="flex items-center justify-between text-sm">
          <span>开启系统提醒（iOS 原生壳启用后生效）</span>
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
            className="h-5 w-5"
          />
        </label>
        <p className="text-xs opacity-60 mt-1">
          MVP 阶段仅记录偏好；真实提醒需要 iOS Capacitor 壳 / WidgetKit 实现，见
          <code className="mx-1">ios-widget-todo.md</code>。
        </p>
      </Section>

      {error && (
        <div
          className="rounded-xl border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--theme-accent)', color: 'var(--theme-accent)' }}
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        {mode === 'edit' && initial ? (
          <button
            type="button"
            className="btn btn-ghost text-sm"
            style={{ color: 'var(--theme-accent)', borderColor: 'var(--theme-accent)' }}
            onClick={() => {
              if (window.confirm(`确认删除「${initial.title}」？此操作无法撤销。`)) {
                deleteCard(initial.id);
                navigate('/');
              }
            }}
          >
            <Trash2 size={16} /> 删除
          </button>
        ) : (
          <span />
        )}
        <button type="submit" className="btn btn-primary text-sm">
          <Save size={16} /> 保存倒数日
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-2">
        {title}
      </div>
      {children}
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-sm transition-colors"
      style={{
        background: active ? 'var(--theme-primary)' : 'transparent',
        color: active ? 'var(--theme-surface)' : 'var(--theme-text)',
        border: `1px solid ${active ? 'var(--theme-primary)' : 'var(--theme-muted)'}`,
      }}
    >
      {children}
    </button>
  );
}
