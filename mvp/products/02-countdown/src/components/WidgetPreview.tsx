import { forwardRef } from 'react';
import type { Countdown } from '@/lib/types';
import { computeView, statusLabel } from '@/lib/dateMath';
import { ThemedSurface } from './ThemedSurface';
import { ThemeOrnaments } from './ThemeDecorations';
import { getTheme } from '@/lib/themes';

export type WidgetSize = 'small' | 'medium' | 'large';

const SIZE_PX: Record<WidgetSize, { width: number; height: number }> = {
  small: { width: 168, height: 168 },
  medium: { width: 348, height: 168 },
  large: { width: 348, height: 364 },
};

interface WidgetPreviewProps {
  card: Countdown;
  size: WidgetSize;
  /** Override theme; falls back to card.theme */
  themeOverride?: Countdown['theme'];
  /** When true, render at intrinsic px size; otherwise responsive max */
  fixedSize?: boolean;
  /** id forwarded to the surface — handy for html2canvas targeting */
  id?: string;
  className?: string;
}

/**
 * Faithful web-side preview of the iOS WidgetKit families.
 * Sizes are derived from detail-02 § A small/medium/large pt specs (×1.06 px).
 * The actual iOS implementation lives in ios-widget-todo.md — this component
 * is purely a marketing/teaching tool until the native shell ships.
 */
export const WidgetPreview = forwardRef<HTMLDivElement, WidgetPreviewProps>(
  function WidgetPreview(
    { card, size, themeOverride, fixedSize = true, id, className = '' },
    ref,
  ) {
    const themeId = themeOverride ?? card.theme;
    const theme = getTheme(themeId);
    const view = computeView(card);
    const { width, height } = SIZE_PX[size];

    const baseStyle: React.CSSProperties = fixedSize
      ? { width, height }
      : { aspectRatio: `${width}/${height}`, width: '100%', maxWidth: width };

    const isCyber = theme.id === 'cyber';
    const isFilm = theme.id === 'film';
    const isInk = theme.id === 'ink';
    const isPink = theme.id === 'pink';
    const isMin = theme.id === 'minimal';

    return (
      <ThemedSurface
        ref={ref}
        themeId={themeId}
        id={id}
        className={`rounded-[22px] shadow-card-soft ${isFilm ? 'film-perforations' : ''} ${className}`}
        style={baseStyle}
      >
        {size === 'small' && (
          <SmallView card={card} view={view} theme={theme} />
        )}
        {size === 'medium' && (
          <MediumView card={card} view={view} theme={theme} />
        )}
        {size === 'large' && (
          <LargeView card={card} view={view} theme={theme} />
        )}

        {/* Decorations live above content, but pointer-events:none */}
        <div className="pointer-events-none">
          <ThemeOrnaments theme={theme} />
        </div>

        {/* Theme-specific overlay tags */}
        {isCyber && (
          <div
            className="pointer-events-none absolute top-2 right-4 text-[10px] tracking-widest font-typewriter"
            style={{ color: theme.colors.secondary }}
          >
            [COUNTDOWN.EXE]
          </div>
        )}
        {isFilm && size !== 'small' && (
          <div
            className="pointer-events-none absolute top-2 right-6 text-[10px] tracking-[0.2em] font-typewriter"
            style={{ color: theme.colors.secondary }}
          >
            KODAK GOLD 200
          </div>
        )}
        {isInk && size === 'large' && (
          <div
            className="pointer-events-none absolute top-3 left-6 text-xs ink-vertical font-display"
            style={{ color: theme.colors.muted }}
          >
            丙午仲夏
          </div>
        )}
        {isPink && size !== 'small' && (
          <div className="pointer-events-none absolute top-3 left-3 text-xs font-display">
            <span style={{ color: theme.colors.primary }}>♡ {card.emoji}</span>
          </div>
        )}
        {isMin && size !== 'small' && (
          <div className="pointer-events-none absolute top-3 right-3 text-[10px] uppercase tracking-[0.2em] text-muted">
            {view.direction === 'past' ? 'past' : 'live'}
          </div>
        )}
      </ThemedSurface>
    );
  },
);

/* ----------------------- subviews per family ----------------------- */

function SmallView({
  card,
  view,
  theme,
}: {
  card: Countdown;
  view: ReturnType<typeof computeView>;
  theme: ReturnType<typeof getTheme>;
}) {
  const numberStyle: React.CSSProperties = {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontWeight: 800,
    lineHeight: 1,
    fontSize: 56,
  };
  if (theme.id === 'cyber') {
    Object.assign(numberStyle, { textShadow: '0 0 4px #FF006E, 0 0 12px rgba(255,0,110,0.7)' });
  }
  return (
    <div
      className="absolute inset-0 flex flex-col justify-between p-3"
      style={theme.id === 'film' ? { paddingLeft: 22, paddingRight: 22 } : undefined}
    >
      <div
        className="text-[11px] font-medium truncate"
        style={{ color: theme.colors.secondary }}
      >
        {card.emoji ? `${card.emoji} ` : ''}{card.title}
      </div>
      <div className="flex items-end justify-center">
        <div className={theme.id === 'cyber' ? 'cyber-glitch' : ''} style={numberStyle}>
          {view.value}
        </div>
        <span
          className="ml-1 mb-1 text-xs"
          style={{
            color: theme.colors.muted,
            fontFamily: theme.fonts.mono,
          }}
        >
          {view.unitLabel}
        </span>
      </div>
      <div
        className="text-[10px] flex justify-between"
        style={{
          color: theme.colors.muted,
          fontFamily: theme.fonts.mono,
        }}
      >
        <span>{statusLabel(card, view)}</span>
        <span>{view.formattedTarget}</span>
      </div>
    </div>
  );
}

function MediumView({
  card,
  view,
  theme,
}: {
  card: Countdown;
  view: ReturnType<typeof computeView>;
  theme: ReturnType<typeof getTheme>;
}) {
  const numberStyle: React.CSSProperties = {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontWeight: 800,
    lineHeight: 1,
    fontSize: 80,
  };
  if (theme.id === 'cyber') {
    Object.assign(numberStyle, {
      textShadow: '0 0 4px #FF006E, 0 0 12px rgba(255,0,110,0.7), 0 0 24px rgba(255,0,110,0.45)',
    });
  }
  if (theme.id === 'pink') {
    Object.assign(numberStyle, {
      WebkitTextStroke: `1.5px ${theme.colors.accent}`,
    });
  }
  return (
    <div
      className="absolute inset-0 flex p-4"
      style={theme.id === 'film' ? { paddingLeft: 24, paddingRight: 24 } : undefined}
    >
      <div className="flex-1 flex flex-col justify-between pr-2">
        <div className="text-sm font-medium truncate" style={{ color: theme.colors.secondary }}>
          {card.title}
        </div>
        <div
          className="text-[10px] uppercase tracking-[0.25em]"
          style={{ color: theme.colors.muted, fontFamily: theme.fonts.mono }}
        >
          {statusLabel(card, view)}
        </div>
        <div
          className="text-[11px]"
          style={{ color: theme.colors.muted, fontFamily: theme.fonts.mono }}
        >
          目标 · {view.formattedTarget}
        </div>
      </div>
      <div className="flex flex-col items-end justify-center">
        <div className={theme.id === 'cyber' ? 'cyber-glitch' : ''} style={numberStyle}>
          {view.value}
        </div>
        <div
          className="text-[11px] mt-1"
          style={{ color: theme.colors.muted, fontFamily: theme.fonts.mono }}
        >
          {view.unitLabel}
        </div>
      </div>
    </div>
  );
}

function LargeView({
  card,
  view,
  theme,
}: {
  card: Countdown;
  view: ReturnType<typeof computeView>;
  theme: ReturnType<typeof getTheme>;
}) {
  const numberStyle: React.CSSProperties = {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontWeight: 800,
    lineHeight: 1,
    fontSize: 120,
    letterSpacing: theme.id === 'cyber' ? '0.04em' : undefined,
  };
  if (theme.id === 'cyber') {
    Object.assign(numberStyle, {
      textShadow:
        '0 0 6px #FF006E, 0 0 20px rgba(255,0,110,0.8), 0 0 40px rgba(255,0,110,0.5)',
    });
  }
  if (theme.id === 'pink') {
    Object.assign(numberStyle, {
      WebkitTextStroke: `2px ${theme.colors.accent}`,
    });
  }
  const progressWidth = `${Math.round(view.progress * 100)}%`;

  return (
    <div
      className="absolute inset-0 flex flex-col items-center px-6 py-7"
      style={theme.id === 'film' ? { paddingLeft: 28, paddingRight: 28 } : undefined}
    >
      <div
        className={`text-base font-medium tracking-wide ${theme.id === 'ink' ? 'ink-vertical' : ''}`}
        style={{ color: theme.colors.secondary, fontFamily: theme.fonts.sans }}
      >
        {card.emoji} {card.title}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className={theme.id === 'cyber' ? 'cyber-glitch' : ''} style={numberStyle}>
          {view.value}
        </div>
        <div
          className="ml-3 mb-2 self-end text-base"
          style={{ color: theme.colors.muted, fontFamily: theme.fonts.mono }}
        >
          {view.unitLabel}
        </div>
      </div>

      <div className="w-full flex flex-col gap-2">
        <div
          className="text-[11px] flex justify-between"
          style={{ color: theme.colors.muted, fontFamily: theme.fonts.mono }}
        >
          <span>{statusLabel(card, view)}</span>
          <span>{view.formattedTarget}</span>
        </div>
        <div
          className="h-2 rounded-full"
          style={{ background: `${theme.colors.muted}22` }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: progressWidth,
              background: theme.colors.primary,
              boxShadow: theme.id === 'cyber' ? '0 0 8px #FF006E' : undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}
