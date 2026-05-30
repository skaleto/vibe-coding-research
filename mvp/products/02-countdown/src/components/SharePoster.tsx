import { useRef, useState } from 'react';
import { Download, ClipboardCopy, ImageDown } from 'lucide-react';
import type { Countdown } from '@/lib/types';
import { computeView, statusLabel } from '@/lib/dateMath';
import { getTheme } from '@/lib/themes';
import { ThemedSurface } from './ThemedSurface';
import { ThemeOrnaments } from './ThemeDecorations';
import {
  copyPosterToClipboard,
  downloadPoster,
  exportNodeToPng,
} from '@/lib/exportPoster';

/**
 * Tall poster suited for 小红书 9-grid share. Rendered hidden + offscreen-ready;
 * the user only sees the rendered PNG via download / clipboard.
 */
export function SharePoster({ card }: { card: Countdown }) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const theme = getTheme(card.theme);
  const view = computeView(card);

  const doExport = async () => {
    if (!nodeRef.current) return null;
    setBusy(true);
    setStatus('正在生成海报…');
    try {
      const safeTitle = (card.title || '倒数日').replace(/[^\p{L}\p{N}_-]+/gu, '_');
      const result = await exportNodeToPng(nodeRef.current, {
        filename: `${safeTitle}-${Date.now()}.png`,
        backgroundColor: theme.colors.bg,
        scale: 2,
      });
      return result;
    } catch (err) {
      console.error(err);
      setStatus(`导出失败：${err instanceof Error ? err.message : '未知错误'}`);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async () => {
    const result = await doExport();
    if (!result) return;
    downloadPoster(result);
    setStatus('已下载到本地，记得发小红书～');
  };

  const handleCopy = async () => {
    const result = await doExport();
    if (!result) return;
    const ok = await copyPosterToClipboard(result);
    if (ok) {
      setStatus('已复制到剪贴板 ✓ 直接粘贴即可分享');
    } else {
      downloadPoster(result);
      setStatus('当前浏览器不支持复制图片，已自动下载');
    }
  };

  const numberStyle: React.CSSProperties = {
    color: theme.colors.primary,
    fontFamily: theme.fonts.display,
    fontWeight: 800,
    lineHeight: 1,
    fontSize: 160,
  };
  if (theme.id === 'cyber') {
    Object.assign(numberStyle, {
      textShadow:
        '0 0 8px #FF006E, 0 0 24px rgba(255,0,110,0.7), 0 0 48px rgba(255,0,110,0.45)',
    });
  }
  if (theme.id === 'pink') {
    Object.assign(numberStyle, {
      WebkitTextStroke: `2.5px ${theme.colors.accent}`,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy}
          className="btn btn-primary text-sm disabled:opacity-50"
        >
          <Download size={16} /> 下载海报
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={busy}
          className="btn btn-ghost text-sm disabled:opacity-50"
        >
          <ClipboardCopy size={16} /> 复制图片
        </button>
      </div>

      {status && (
        <div className="text-xs opacity-80" role="status">{status}</div>
      )}

      <div
        className="flex justify-center overflow-x-auto py-2"
        aria-live="polite"
      >
        <ThemedSurface
          ref={nodeRef}
          themeId={card.theme}
          className={`rounded-[28px] ${theme.id === 'film' ? 'film-perforations' : ''}`}
          style={{ width: 360, height: 540 }}
          inlineFallback
        >
          <div className="absolute inset-0 flex flex-col px-6 py-8">
            <div className="flex justify-between text-[11px] uppercase tracking-[0.25em]"
              style={{ color: theme.colors.muted, fontFamily: theme.fonts.mono }}>
              <span>倒数日 PRO</span>
              <span>{theme.name}</span>
            </div>

            <div
              className="text-2xl font-semibold mt-6 flex items-center gap-2"
              style={{ color: theme.colors.text, fontFamily: theme.fonts.sans }}
            >
              <span>{card.emoji}</span>
              <span>{card.title}</span>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-end">
                <div style={numberStyle} className={theme.id === 'cyber' ? 'cyber-glitch' : ''}>
                  {view.value}
                </div>
                <div
                  className="ml-2 mb-3 text-base"
                  style={{ color: theme.colors.muted, fontFamily: theme.fonts.mono }}
                >
                  {view.unitLabel}
                </div>
              </div>
            </div>

            <div
              className="text-[11px] uppercase tracking-[0.25em]"
              style={{ color: theme.colors.muted, fontFamily: theme.fonts.mono }}
            >
              {statusLabel(card, view)} · {view.formattedTarget}
            </div>

            {card.note && (
              <div
                className="text-sm mt-3"
                style={{ color: theme.colors.muted, fontFamily: theme.fonts.sans }}
              >
                {card.note}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between text-[11px]"
              style={{ color: theme.colors.muted, fontFamily: theme.fonts.mono }}>
              <span>made with 倒数日 Pro</span>
              <span className="flex items-center gap-1"><ImageDown size={12} /> mvp.web</span>
            </div>
          </div>

          <div className="pointer-events-none">
            <ThemeOrnaments theme={theme} />
          </div>
        </ThemedSurface>
      </div>
    </div>
  );
}
