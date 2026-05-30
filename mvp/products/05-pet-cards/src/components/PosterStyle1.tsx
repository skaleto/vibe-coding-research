import { forwardRef } from 'react';
import type { PetCardResult } from '@/lib/types';
import { getMoodPalette } from '@/lib/moodColors';
import { DISCLAIMER } from '@/lib/types';

type Props = {
  result: PetCardResult;
};

// 萌系卡通：圆角粉色背景 + 大对话气泡 + emoji 贴纸
export const PosterStyle1 = forwardRef<HTMLDivElement, Props>(function PosterStyle1(
  { result },
  ref
) {
  const palette = getMoodPalette(result.mood_tag);
  const date = new Date(result.createdAt);
  const dateStr = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date
    .getDate()
    .toString()
    .padStart(2, '0')}`;

  return (
    <div
      ref={ref}
      className="relative overflow-hidden"
      style={{
        width: 540,
        height: 960,
        background: `radial-gradient(circle at 30% 20%, ${palette.secondary} 0%, ${palette.bg} 60%, ${palette.bg} 100%)`,
        fontFamily: 'var(--font-sans)',
        color: palette.text,
      }}
    >
      {/* 角落装饰：星星 / 爪印 / 心心 */}
      <CornerDecoration kind="star" style={{ top: 16, left: 16 }} color={palette.primary} />
      <CornerDecoration kind="paw" style={{ top: 24, right: 18 }} color={palette.accent} />
      <CornerDecoration kind="heart" style={{ bottom: 96, left: 24 }} color={palette.primary} />
      <CornerDecoration kind="star" style={{ bottom: 110, right: 30 }} color={palette.accent} />

      {/* 顶部：日期 + 名字 */}
      <div className="absolute left-0 right-0 top-8 text-center">
        <div className="text-[14px] tracking-widest" style={{ color: palette.text, opacity: 0.6 }}>
          {dateStr}
        </div>
        <div className="mt-1 text-[28px] font-bold">
          {result.petName}の心声
        </div>
      </div>

      {/* 宠物大 emoji 头像 */}
      <div
        className="absolute left-1/2 flex items-center justify-center rounded-full shadow-bubble"
        style={{
          top: 110,
          width: 120,
          height: 120,
          marginLeft: -60,
          background: 'white',
          border: `4px solid ${palette.primary}`,
        }}
      >
        <span style={{ fontSize: 60 }}>{result.emoji_set[0] ?? '🐾'}</span>
      </div>

      {/* mood_tag 徽章 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 transform rounded-full px-4 py-1 text-[13px] font-bold text-white"
        style={{ top: 242, background: palette.accent }}
      >
        {result.mood_tag} {palette.emoji}
      </div>

      {/* 对话气泡 */}
      <div
        className="absolute left-6 right-6 flex flex-col gap-3"
        style={{ top: 290 }}
      >
        {result.translation.map((line, i) => {
          const isLeft = i % 2 === 0;
          const bg = isLeft ? palette.primary : palette.secondary;
          const rotate = ((i % 2 === 0 ? -1 : 1) * (1 + (i % 3))) + 'deg';
          return (
            <div
              key={i}
              className="relative max-w-[90%] rounded-bubble px-4 py-3 shadow-bubble"
              style={{
                alignSelf: isLeft ? 'flex-start' : 'flex-end',
                background: bg,
                color: palette.text,
                transform: `rotate(${rotate})`,
                fontSize: 17,
                lineHeight: 1.45,
                fontWeight: 500,
              }}
            >
              {line}
              {/* emoji 贴纸 */}
              <span
                className="absolute -top-3"
                style={{
                  fontSize: 24,
                  [isLeft ? 'right' : 'left']: -8,
                }}
              >
                {result.emoji_set[i % result.emoji_set.length] ?? '✨'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Disclaimer + 水印（强制嵌入，可读字号 ≥12px + 足够对比度） */}
      <div className="absolute bottom-12 left-0 right-0 px-4 text-center">
        <div className="text-[12px] font-medium" style={{ color: palette.text, opacity: 0.75 }}>
          {DISCLAIMER}
        </div>
      </div>
      <div className="absolute bottom-3 left-0 right-0 flex items-end justify-between px-5">
        <div className="text-[10px] font-bold" style={{ color: palette.text, opacity: 0.4 }}>
          @宠物心情卡片
        </div>
        <QRCodePlaceholder color={palette.text} />
      </div>
    </div>
  );
});

function CornerDecoration({
  kind,
  style,
  color,
}: {
  kind: 'star' | 'paw' | 'heart';
  style: React.CSSProperties;
  color: string;
}) {
  const emojiMap = { star: '✨', paw: '🐾', heart: '💕' };
  return (
    <span
      className="absolute"
      style={{
        fontSize: 22,
        opacity: 0.55,
        filter: `drop-shadow(0 0 1px ${color})`,
        ...style,
      }}
    >
      {emojiMap[kind]}
    </span>
  );
}

function QRCodePlaceholder({ color }: { color: string }) {
  // 简单网格模拟二维码占位
  return (
    <div
      className="grid grid-cols-6 gap-[1px]"
      style={{
        width: 48,
        height: 48,
        background: 'white',
        padding: 3,
        border: `1px solid ${color}40`,
        borderRadius: 4,
      }}
    >
      {Array.from({ length: 36 }).map((_, i) => (
        <div
          key={i}
          style={{
            background: (i * 7) % 3 === 0 ? color : 'transparent',
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}
