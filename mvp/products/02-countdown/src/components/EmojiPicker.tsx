import { useMemo, useState } from 'react';
import { themes } from '@/lib/themes';
import type { ThemeId } from '@/lib/types';

const PRESET = [
  '🎯', '🎂', '💍', '💒', '🎓', '✈️', '🏖️', '🏠', '👶', '🐶',
  '🎄', '🎆', '📚', '💪', '💕', '🎀', '✨', '🌸', '🦄', '🍰',
  '📷', '✉️', '📮', '🗺️', '🕰️', '🍃', '🌙', '🪷', '🐉', '🏯',
  '⚡', '▲', '▼', '►', '◄', '█', '★', '♥', '♣', '◆',
];

interface EmojiPickerProps {
  value: string;
  onChange: (next: string) => void;
  /** Use the theme's recommended emoji pool first when selected */
  themeId?: ThemeId;
}

export function EmojiPicker({ value, onChange, themeId }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const list = useMemo(() => {
    if (themeId) {
      const pool = themes[themeId].emojiPool;
      return Array.from(new Set([...pool, ...PRESET]));
    }
    return PRESET;
  }, [themeId]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors"
        style={{ borderColor: 'var(--theme-muted)', color: 'var(--theme-text)' }}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="text-2xl leading-none" aria-hidden>
          {value || '🎯'}
        </span>
        <span className="text-xs uppercase tracking-widest opacity-70">
          换图标
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          className="absolute z-30 mt-2 w-72 rounded-2xl shadow-lg p-3 grid grid-cols-8 gap-1"
          style={{ background: 'var(--theme-surface)', border: '1px solid var(--theme-muted)' }}
        >
          {list.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onChange(emoji);
                setOpen(false);
              }}
              className="flex items-center justify-center h-9 w-9 rounded hover:bg-black/5 text-xl"
              aria-label={`选择 ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
