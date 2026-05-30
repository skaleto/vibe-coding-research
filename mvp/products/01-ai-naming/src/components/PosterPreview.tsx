import { Download, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { VerifiedName } from '@/lib/schema';

import { Placeholder } from './Placeholder';

type Style = 'shuimo' | 'xuanzhi' | 'modern';

const STYLES: { id: Style; label: string; description: string }[] = [
  { id: 'shuimo', label: '中国水墨', description: '宣纸 + 书法' },
  { id: 'xuanzhi', label: '古典宣纸', description: '竖排 + 印章' },
  { id: 'modern', label: '现代简约', description: '极简 + 拼音' },
];

export function PosterPreview({ name }: { name: VerifiedName }) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<Style>('shuimo');
  const [busy, setBusy] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setBusy(true);
    try {
      // dynamic import 避免 SSR
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
      });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        // 自动触发下载
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.full_name}-海报-${style}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, 'image/png');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[poster] export failed', err);
      alert('海报导出失败，请稍后重试');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 风格切换 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStyle(s.id)}
            className={`shrink-0 px-4 py-2 rounded-btn border text-sm ${
              style === s.id
                ? 'bg-primary text-white border-primary'
                : 'bg-white border-primary/30 text-ink hover:border-primary'
            }`}
          >
            <div className="font-medium">{s.label}</div>
            <div className="text-[10px] opacity-70">{s.description}</div>
          </button>
        ))}
      </div>

      {/* 预览区 */}
      <div className="flex justify-center bg-bg-alt rounded-card p-4 overflow-auto">
        <div
          ref={posterRef}
          className="relative shrink-0"
          style={{ width: '320px', height: '480px' }}
        >
          {style === 'shuimo' && <ShuimoPoster name={name} />}
          {style === 'xuanzhi' && <XuanzhiPoster name={name} />}
          {style === 'modern' && <ModernPoster name={name} />}
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-btn bg-accent text-white hover:bg-accent-dark disabled:opacity-50"
        >
          <Download size={16} />
          {busy ? '生成中…' : '下载海报 PNG'}
        </button>
        <button
          type="button"
          onClick={() => setStyle((s) => (s === 'shuimo' ? 'xuanzhi' : s === 'xuanzhi' ? 'modern' : 'shuimo'))}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-btn border border-primary/30 text-ink hover:bg-bg-alt"
        >
          <RefreshCw size={16} />
          换一张风格
        </button>
      </div>

      <p className="text-xs text-ink-muted text-center">
        MVP 版本：海报含品牌水印；¥18+ 套餐可去水印。下载后可分享到朋友圈 / 小红书。
      </p>
    </div>
  );
}

function ShuimoPoster({ name }: { name: VerifiedName }) {
  return (
    <div className="absolute inset-0 bg-bg-paper rounded-2xl overflow-hidden shadow-card flex flex-col items-center justify-between p-6 border border-primary/20">
      <div className="text-center">
        <div className="text-[10px] tracking-[0.4em] text-primary-dark uppercase">name</div>
        <div className="mt-1 ink-divider w-12 mx-auto" />
      </div>

      <div className="text-center space-y-3">
        <div className="text-6xl font-serif font-bold text-ink-dark tracking-widest">
          {name.full_name}
        </div>
        <div className="text-xs text-ink-muted font-serif italic tracking-wider">
          {name.pinyin_full}
        </div>
      </div>

      <div className="text-center max-w-full space-y-2">
        <div className="text-xs text-primary-dark">《{name.source_book}·{name.source_chapter}》</div>
        <blockquote className="text-[11px] text-ink leading-relaxed font-serif italic px-2">
          「{name.original_quote}」
        </blockquote>
      </div>

      <div className="text-[9px] text-ink-muted/70 text-center max-w-full leading-snug">
        {truncate(name.explanation, 88)}
      </div>

      <div className="w-full border-t border-primary/20 pt-2 flex justify-between items-center text-[9px] text-ink-muted">
        <span>诗经起名 · AI</span>
        <span className="text-primary-dark">{name.style_tag}</span>
      </div>
    </div>
  );
}

function XuanzhiPoster({ name }: { name: VerifiedName }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#f5ecd6] to-[#ede0c0] rounded-2xl overflow-hidden shadow-card flex p-5 border border-accent/30">
      {/* 印章占位 */}
      <div className="absolute top-4 right-4 w-12 h-12 border-2 border-accent rounded-md flex items-center justify-center text-accent text-xs font-bold opacity-70">
        印章
      </div>

      {/* 竖排文字 */}
      <div className="flex-1 flex items-center justify-center gap-4">
        <div className="vertical-text text-[10px] text-ink-muted leading-relaxed">
          {name.source_book}·{name.source_chapter}
        </div>
        <div className="vertical-text text-5xl font-serif font-bold text-ink-dark leading-none tracking-widest">
          {name.full_name}
        </div>
        <div className="vertical-text text-xs text-ink leading-loose">
          {name.original_quote}
        </div>
      </div>

      <div className="absolute bottom-3 left-5 right-5 text-[9px] text-ink-muted/70 text-center">
        诗经起名 · 古典宣纸版
      </div>
    </div>
  );
}

function ModernPoster({ name }: { name: VerifiedName }) {
  return (
    <div className="absolute inset-0 bg-white rounded-2xl overflow-hidden shadow-card flex flex-col p-7 border border-ink/10">
      <div className="text-[10px] tracking-[0.3em] text-ink-muted">A POETIC NAME</div>

      <div className="flex-1 flex flex-col justify-center space-y-4">
        <div className="text-7xl font-bold text-ink-dark tracking-tight leading-none">
          {name.given_name}
        </div>
        <div className="text-sm font-mono text-primary-dark">
          {name.pinyin_full}
        </div>
        <div className="w-12 h-px bg-accent" />
        <div className="text-xs text-ink-muted leading-relaxed">
          《{name.source_book}·{name.source_chapter}》
        </div>
        <blockquote className="text-xs text-ink italic leading-relaxed">
          「{name.original_quote}」
        </blockquote>
      </div>

      <div className="flex justify-between items-end pt-4 border-t border-ink/10">
        <div className="text-[9px] text-ink-muted leading-tight max-w-[60%]">
          {truncate(name.explanation, 60)}
        </div>
        <div className="text-[9px] text-ink-muted text-right">
          诗经起名<br />Shijing Naming
        </div>
      </div>
    </div>
  );
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

/** 占位图组件未用，但保留 import 防止 tree-shake 报警 */
export function _poster_placeholder_demo() {
  return (
    <Placeholder
      kind="poster-decoration"
      aspect="3/4"
      caption="海报装饰花纹 PNG"
      spec="水墨远山 + 兰花 + 透明背景，1080x1440"
    />
  );
}
