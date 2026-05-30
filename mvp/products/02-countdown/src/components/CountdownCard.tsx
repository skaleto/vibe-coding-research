import { Link } from 'react-router-dom';
import type { Countdown } from '@/lib/types';
import { computeView, statusLabel } from '@/lib/dateMath';
import { getTheme } from '@/lib/themes';
import { ThemedSurface } from './ThemedSurface';
import { ThemeOrnaments } from './ThemeDecorations';

interface CountdownCardProps {
  card: Countdown;
}

/**
 * Compact list-page card. Acts like a mini medium widget: shows emoji, title,
 * big number, status, target date — all themed.
 */
export function CountdownCard({ card }: CountdownCardProps) {
  const theme = getTheme(card.theme);
  const view = computeView(card);

  const numberStyle: React.CSSProperties = {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontWeight: 800,
    lineHeight: 1,
    fontSize: 56,
  };
  if (theme.id === 'cyber') {
    Object.assign(numberStyle, {
      textShadow: '0 0 4px #FF006E, 0 0 12px rgba(255,0,110,0.6)',
    });
  }
  if (theme.id === 'pink') {
    Object.assign(numberStyle, {
      WebkitTextStroke: `1.4px ${theme.colors.accent}`,
    });
  }

  return (
    <Link
      to={`/${card.id}`}
      className="block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent rounded-2xl"
      style={{
        // Use offset color so it works on both light + dark themes
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        ['--tw-ring-color' as string]: theme.colors.primary,
      } as React.CSSProperties}
    >
      <ThemedSurface
        themeId={card.theme}
        className={`rounded-2xl shadow-card-soft p-4 transition-transform hover:-translate-y-0.5 hover:shadow-lg ${theme.id === 'film' ? 'film-perforations' : ''}`}
        style={{ minHeight: 132 }}
      >
        <div className="relative z-10 flex h-full items-stretch gap-4">
          <div className="flex flex-col justify-between flex-1 min-w-0">
            <div
              className="text-xs uppercase tracking-[0.18em]"
              style={{ color: theme.colors.muted, fontFamily: theme.fonts.mono }}
            >
              {statusLabel(card, view)}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg shrink-0" aria-hidden>
                {card.emoji}
              </span>
              <h3
                className="text-base font-semibold truncate"
                style={{ color: theme.colors.text }}
              >
                {card.title}
              </h3>
            </div>
            <div
              className="text-[11px]"
              style={{ color: theme.colors.muted, fontFamily: theme.fonts.mono }}
            >
              {card.type === 'countdown' ? '目标 · ' : '起始 · '}
              {view.formattedTarget}
            </div>
          </div>

          <div className="flex flex-col items-end justify-center min-w-[80px]">
            <div style={numberStyle} className={theme.id === 'cyber' ? 'cyber-glitch' : ''}>
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

        {/* themed decorations live above background but below the link's hit area */}
        <div className="pointer-events-none">
          <ThemeOrnaments theme={theme} />
        </div>
      </ThemedSurface>
    </Link>
  );
}
