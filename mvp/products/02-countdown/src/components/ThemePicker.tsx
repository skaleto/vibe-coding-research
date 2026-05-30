import { themeList } from '@/lib/themes';
import type { ThemeId } from '@/lib/types';

interface ThemePickerProps {
  value: ThemeId;
  onChange: (next: ThemeId) => void;
  /** Compact = horizontal mini-chips. Otherwise gallery cards. */
  compact?: boolean;
  className?: string;
}

/**
 * Visual theme picker that previews all 5 themes side-by-side. The compact
 * variant is suited to the new/edit form; the gallery variant is suited to
 * Settings and the marketing page.
 */
export function ThemePicker({ value, onChange, compact = false, className = '' }: ThemePickerProps) {
  if (compact) {
    return (
      <div className={`flex gap-2 overflow-x-auto py-1 ${className}`}>
        {themeList.map((theme) => {
          const active = theme.id === value;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChange(theme.id)}
              className="shrink-0 rounded-2xl border transition-all"
              aria-pressed={active}
              style={{
                borderColor: active ? theme.colors.primary : 'transparent',
                outline: active ? `2px solid ${theme.colors.primary}` : 'none',
                outlineOffset: 2,
                background: theme.colors.bg,
                color: theme.colors.text,
                padding: '0.55rem 0.9rem',
                fontFamily: theme.fonts.sans,
                minWidth: 116,
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-6 w-6 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    boxShadow:
                      theme.id === 'cyber'
                        ? '0 0 6px #FF006E, 0 0 12px rgba(0,245,255,0.5)'
                        : undefined,
                  }}
                />
                <div className="text-left">
                  <div className="text-sm font-medium">{theme.name}</div>
                  <div
                    className="text-[10px] uppercase tracking-widest"
                    style={{ color: theme.colors.muted }}
                  >
                    {theme.id}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${className}`}>
      {themeList.map((theme) => {
        const active = theme.id === value;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => onChange(theme.id)}
            aria-pressed={active}
            className="rounded-2xl border-2 transition-all text-left"
            style={{
              borderColor: active ? theme.colors.primary : 'transparent',
              background: theme.decorations.bgGradient,
              color: theme.colors.text,
              padding: '0.9rem',
              fontFamily: theme.fonts.sans,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-base">{theme.name}</span>
              <span
                className="text-[10px] uppercase tracking-widest"
                style={{ color: theme.colors.muted }}
              >
                {theme.id}
              </span>
            </div>
            <div
              className="text-xs mb-3"
              style={{ color: theme.colors.muted }}
            >
              {theme.tagline}
            </div>
            <div className="flex gap-1.5">
              {[
                theme.colors.primary,
                theme.colors.secondary,
                theme.colors.surface,
                theme.colors.accent,
                theme.colors.text,
              ].map((c) => (
                <span
                  key={c}
                  className="h-5 w-5 rounded-full border border-white/40"
                  style={{ background: c }}
                />
              ))}
            </div>
            <div
              className="mt-3 text-[28px] font-display"
              style={{
                color: theme.colors.primary,
                fontFamily: theme.fonts.display,
                textShadow:
                  theme.id === 'cyber'
                    ? '0 0 6px #FF006E, 0 0 12px rgba(255,0,110,0.5)'
                    : undefined,
                WebkitTextStroke:
                  theme.id === 'pink' ? `1px ${theme.colors.accent}` : undefined,
              }}
            >
              32 {theme.id === 'ink' ? '日' : '天'}
            </div>
          </button>
        );
      })}
    </div>
  );
}
