import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Smartphone,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useCountdownStore } from '@/lib/store';
import { computeView, statusLabel } from '@/lib/dateMath';
import { getTheme } from '@/lib/themes';
import { ThemedSurface } from '@/components/ThemedSurface';
import { ThemeOrnaments } from '@/components/ThemeDecorations';
import { WidgetModal } from '@/components/WidgetModal';
import { SharePoster } from '@/components/SharePoster';
import { WidgetPreview } from '@/components/WidgetPreview';

export default function DetailPage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = params.id;
  const hydrated = useCountdownStore((s) => s.hydrated);
  const card = useCountdownStore((s) =>
    s.cards.find((c) => c.id === id),
  );
  const deleteCard = useCountdownStore((s) => s.deleteCard);
  const [widgetOpen, setWidgetOpen] = useState(false);

  const view = useMemo(() => (card ? computeView(card) : null), [card]);

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-12 text-center">
        <p className="text-sm opacity-70">加载中…</p>
      </main>
    );
  }

  if (!card || !view) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-12 text-center">
        <h1 className="text-xl font-semibold mb-2">找不到这条倒数日</h1>
        <p className="text-sm opacity-70 mb-4">
          可能已经被删除，或链接错了。
        </p>
        <Link to="/" className="btn btn-primary text-sm">
          返回列表
        </Link>
      </main>
    );
  }

  const theme = getTheme(card.theme);

  const numberStyle: React.CSSProperties = {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontWeight: 800,
    lineHeight: 1,
    fontSize: 'clamp(96px, 22vw, 180px)',
  };
  if (theme.id === 'cyber') {
    Object.assign(numberStyle, {
      textShadow:
        '0 0 8px #FF006E, 0 0 24px rgba(255,0,110,0.7), 0 0 56px rgba(255,0,110,0.45)',
    });
  }
  if (theme.id === 'pink') {
    Object.assign(numberStyle, {
      WebkitTextStroke: `2.5px ${theme.colors.accent}`,
    });
  }

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-4 sm:py-6 space-y-6">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
        >
          <ArrowLeft size={16} /> 返回
        </button>
        <div className="flex gap-2">
          <Link
            to={`/${card.id}/edit`}
            className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
            aria-label="编辑"
          >
            <Edit3 size={16} /> 编辑
          </Link>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`确认删除「${card.title}」？`)) {
                deleteCard(card.id);
                navigate('/');
              }
            }}
            className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
            style={{ color: theme.colors.accent }}
            aria-label="删除"
          >
            <Trash2 size={16} /> 删除
          </button>
        </div>
      </header>

      <ThemedSurface
        themeId={card.theme}
        className={`rounded-3xl ${theme.id === 'film' ? 'film-perforations' : ''}`}
        style={{ minHeight: 420 }}
      >
        <div className="absolute inset-0 flex flex-col px-6 py-8">
          <div
            className="text-xs uppercase tracking-[0.3em]"
            style={{ color: theme.colors.muted, fontFamily: theme.fonts.mono }}
          >
            {statusLabel(card, view)} · {theme.name}
          </div>
          <div
            className="text-2xl font-semibold mt-3 flex items-center gap-2"
            style={{ color: theme.colors.text, fontFamily: theme.fonts.sans }}
          >
            <span aria-hidden>{card.emoji}</span>
            <span>{card.title}</span>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-end">
              <div style={numberStyle} className={theme.id === 'cyber' ? 'cyber-glitch' : ''}>
                {view.value}
              </div>
              <div
                className="ml-2 mb-4 text-lg"
                style={{ color: theme.colors.muted, fontFamily: theme.fonts.mono }}
              >
                {view.unitLabel}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div
              className="text-xs flex justify-between"
              style={{ color: theme.colors.muted, fontFamily: theme.fonts.mono }}
            >
              <span>创建 · {card.createdAt.slice(0, 10)}</span>
              <span>目标 · {view.formattedTarget}</span>
            </div>
            <div
              className="h-2 rounded-full"
              style={{ background: `${theme.colors.muted}22` }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.round(view.progress * 100)}%`,
                  background: theme.colors.primary,
                  boxShadow: theme.id === 'cyber' ? '0 0 8px #FF006E' : undefined,
                }}
              />
            </div>
            {card.note && (
              <p
                className="text-sm mt-2"
                style={{
                  color: theme.colors.muted,
                  fontFamily: theme.fonts.sans,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {card.note}
              </p>
            )}
          </div>
        </div>

        <div className="pointer-events-none">
          <ThemeOrnaments theme={theme} />
        </div>
      </ThemedSurface>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">桌面小组件预览</h2>
          <button
            type="button"
            onClick={() => setWidgetOpen(true)}
            className="btn btn-ghost text-xs"
          >
            <Smartphone size={14} /> 添加到桌面?
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto py-2">
          <WidgetPreview card={card} size="small" />
          <WidgetPreview card={card} size="medium" />
        </div>
        <p className="text-xs opacity-60 mt-2">
          MVP 阶段仅展示视觉效果。iOS WidgetKit 实现见
          <code className="mx-1">ios-widget-todo.md</code>。
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-1">
          <Sparkles size={16} /> 分享海报
        </h2>
        <SharePoster card={card} />
      </section>

      <section className="text-sm space-y-2">
        <h2 className="text-base font-semibold flex items-center gap-1">
          <Calendar size={16} /> 日历对接
        </h2>
        <p className="opacity-70">
          MVP 阶段不接 Apple Calendar / Outlook / 飞书日历。iOS 原生壳启用后，本卡片会
          自动通过 EventKit 写入"日程提醒"。
        </p>
      </section>

      <WidgetModal card={card} open={widgetOpen} onClose={() => setWidgetOpen(false)} />
    </main>
  );
}
