import { forwardRef } from 'react';
import type { PetCardResult } from '@/lib/types';
import { DISCLAIMER } from '@/lib/types';

type Props = {
  result: PetCardResult;
};

// 复古胶片：牛皮纸纹理 + 胶片框 + 复古字体
export const PosterStyle3 = forwardRef<HTMLDivElement, Props>(function PosterStyle3(
  { result },
  ref
) {
  const date = new Date(result.createdAt);
  const dateCN = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date
    .getDate()
    .toString()
    .padStart(2, '0')}`;
  const pageNum = ((date.getDate() + date.getMonth() * 31) % 99) + 1;

  // 中文小写序号
  const numerals = ['〇一、', '〇二、', '〇三、', '〇四、', '〇五、'];

  return (
    <div
      ref={ref}
      className="grain-overlay relative overflow-hidden"
      style={{
        width: 540,
        height: 960,
        background: '#F0E6D2',
        fontFamily: 'var(--font-serif)',
        color: '#2C2C2C',
      }}
    >
      {/* 外圈深色边框（胶片感） */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 0 6px #2C2C2C',
          borderRadius: 0,
        }}
      />

      {/* 页眉 */}
      <div className="absolute left-0 right-0 top-7 flex items-center justify-between px-7">
        <div className="text-[14px]" style={{ color: '#7A5C3D' }}>
          🐾 🐾 🐾
        </div>
        <div className="text-[16px] font-bold tracking-wide">
          宠物日记 · 第 {pageNum} 页
        </div>
        {/* 日期戳 */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full text-[9px] font-bold"
          style={{
            color: '#A63A33',
            border: '2px solid #A63A33',
            transform: 'rotate(-8deg)',
            lineHeight: 1.1,
            textAlign: 'center',
            padding: 4,
          }}
        >
          {dateCN}
        </div>
      </div>

      {/* 老照片区 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center overflow-hidden"
        style={{
          top: 96,
          width: 380,
          height: 280,
          background: '#E8DCC0',
          border: '3px solid #2C2C2C',
          boxShadow: '0 4px 0 #BFA886, 0 8px 16px rgba(0,0,0,0.15)',
        }}
      >
        <span style={{ fontSize: 160 }}>{result.emoji_set[0] ?? '🐾'}</span>
        {/* 4 个角的照片夹 */}
        <CornerTab style={{ top: 0, left: 0 }} dir="tl" />
        <CornerTab style={{ top: 0, right: 0 }} dir="tr" />
        <CornerTab style={{ bottom: 0, left: 0 }} dir="bl" />
        <CornerTab style={{ bottom: 0, right: 0 }} dir="br" />
      </div>

      {/* 摄于... 小字 */}
      <div
        className="absolute left-0 right-0 text-center text-[12px] italic"
        style={{ top: 386, color: '#7A5C3D' }}
      >
        — 摄于客厅 · {result.petName} 的{result.mood_tag}时刻 —
      </div>

      {/* 日记正文 */}
      <div className="absolute left-7 right-7" style={{ top: 432 }}>
        {result.translation.map((line, i) => (
          <div
            key={i}
            className="mb-3 text-[15px] leading-relaxed"
            style={{ color: '#2C2C2C' }}
          >
            <span style={{ color: '#A63A33' }}>{numerals[i] ?? '〇·'}</span>
            {line} <span style={{ opacity: 0.6 }}>🐾</span>
          </div>
        ))}
      </div>

      {/* 签名 + 印章 */}
      <div className="absolute bottom-32 right-7 text-right">
        <div
          className="italic text-[18px]"
          style={{ color: '#2C2C2C' }}
        >
          —— {result.petName} 留
        </div>
      </div>
      {/* mood 印章 */}
      <div
        className="absolute flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          bottom: 100,
          left: 32,
          border: '3px solid #A63A33',
          color: '#A63A33',
          fontFamily: 'var(--font-serif)',
          fontWeight: 'bold',
          fontSize: 14,
          transform: 'rotate(-12deg)',
          letterSpacing: 1,
        }}
      >
        {result.mood_tag}
      </div>

      {/* Disclaimer + 水印（强制嵌入，可读字号 ≥12px + 足够对比度） */}
      <div
        className="absolute bottom-7 left-7 text-[12px] font-semibold"
        style={{ color: '#5C4530' }}
      >
        {DISCLAIMER}
      </div>
      <div
        className="absolute bottom-7 right-7 flex items-end gap-2"
        style={{ color: '#7A5C3D' }}
      >
        <span className="text-[10px]">@宠物心情卡片</span>
        <QRCodePlaceholder />
      </div>
    </div>
  );
});

function CornerTab({
  style,
  dir,
}: {
  style: React.CSSProperties;
  dir: 'tl' | 'tr' | 'bl' | 'br';
}) {
  const borders: Record<typeof dir, React.CSSProperties> = {
    tl: { borderTop: '20px solid #2C2C2C', borderRight: '20px solid transparent' },
    tr: { borderTop: '20px solid #2C2C2C', borderLeft: '20px solid transparent' },
    bl: { borderBottom: '20px solid #2C2C2C', borderRight: '20px solid transparent' },
    br: { borderBottom: '20px solid #2C2C2C', borderLeft: '20px solid transparent' },
  };
  return (
    <div
      className="absolute"
      style={{
        width: 0,
        height: 0,
        opacity: 0.4,
        ...borders[dir],
        ...style,
      }}
    />
  );
}

function QRCodePlaceholder() {
  return (
    <div
      className="grid grid-cols-6 gap-[1px]"
      style={{
        width: 36,
        height: 36,
        background: '#F0E6D2',
        padding: 2,
        border: '1px solid #7A5C3D',
        borderRadius: 2,
      }}
    >
      {Array.from({ length: 36 }).map((_, i) => (
        <div
          key={i}
          style={{
            background: (i * 13) % 3 === 0 ? '#2C2C2C' : 'transparent',
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}
