import { forwardRef } from 'react';
import type { PetCardResult } from '@/lib/types';
import { getMoodPalette } from '@/lib/moodColors';
import { DISCLAIMER } from '@/lib/types';

type Props = {
  result: PetCardResult;
};

// 简约可爱：白底 + 极细线条 + 中性灰
export const PosterStyle2 = forwardRef<HTMLDivElement, Props>(function PosterStyle2(
  { result },
  ref
) {
  const palette = getMoodPalette(result.mood_tag);
  const date = new Date(result.createdAt);
  const timeStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
    .getDate()
    .toString()
    .padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  return (
    <div
      ref={ref}
      className="relative overflow-hidden"
      style={{
        width: 540,
        height: 960,
        background: '#FFFFFF',
        fontFamily: 'var(--font-sans)',
        color: '#1A1A1A',
      }}
    >
      {/* 顶部标题条 */}
      <div className="absolute left-6 right-6 top-7 flex items-center justify-between">
        <div className="text-[14px] font-medium" style={{ color: '#888' }}>
          {result.petName} · {timeStr}
        </div>
        <div className="text-[14px] font-bold" style={{ color: palette.accent }}>
          {result.mood_tag} {palette.emoji}
        </div>
      </div>
      <div
        className="absolute left-6 right-6"
        style={{ top: 64, height: 1, background: '#E5E5E5' }}
      />

      {/* 大图区：用 emoji 凑 */}
      <div
        className="absolute left-6 right-6 flex items-center justify-center overflow-hidden rounded-[12px]"
        style={{
          top: 96,
          height: 460,
          background: `linear-gradient(135deg, ${palette.bg} 0%, ${palette.secondary} 100%)`,
        }}
      >
        <span style={{ fontSize: 220 }}>{result.emoji_set[0] ?? '🐾'}</span>
        {/* 副 emoji */}
        <span
          className="absolute"
          style={{ fontSize: 56, top: 32, right: 30, opacity: 0.7 }}
        >
          {result.emoji_set[1] ?? '✨'}
        </span>
        <span
          className="absolute"
          style={{ fontSize: 56, bottom: 32, left: 30, opacity: 0.7 }}
        >
          {result.emoji_set[2] ?? '💕'}
        </span>
      </div>

      {/* 对话条区（极简） */}
      <div
        className="absolute left-6 right-6 flex flex-col"
        style={{ top: 580 }}
      >
        {result.translation.map((line, i) => (
          <div key={i} className="py-3">
            <div className="flex items-start gap-3">
              <span style={{ fontSize: 22 }}>
                {result.emoji_set[i % result.emoji_set.length] ?? '✨'}
              </span>
              <div
                className="flex-1 text-[16px] font-medium leading-snug"
                style={{ color: '#1A1A1A' }}
              >
                {line}
              </div>
            </div>
            {i < result.translation.length - 1 ? (
              <div
                style={{ width: 80, height: 1, background: '#E5E5E5', marginLeft: 34, marginTop: 12 }}
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* Disclaimer（强制嵌入，可读字号 ≥12px + 足够对比度，不可弱化） */}
      <div className="absolute bottom-12 left-0 right-0 text-center">
        <div className="text-[12px] font-medium" style={{ color: '#666' }}>
          {DISCLAIMER}
        </div>
      </div>
      {/* 水印 + QR */}
      <div className="absolute bottom-3 left-6 right-6 flex items-end justify-between">
        <div className="text-[11px] font-medium" style={{ color: '#CCC' }}>
          宠物心情卡片
        </div>
        <QRCodePlaceholder />
      </div>
    </div>
  );
});

function QRCodePlaceholder() {
  return (
    <div
      className="grid grid-cols-6 gap-[1px]"
      style={{
        width: 40,
        height: 40,
        background: 'white',
        padding: 2,
        border: '1px solid #DDD',
        borderRadius: 4,
      }}
    >
      {Array.from({ length: 36 }).map((_, i) => (
        <div
          key={i}
          style={{
            background: (i * 11) % 3 === 0 ? '#888' : 'transparent',
          }}
        />
      ))}
    </div>
  );
}
