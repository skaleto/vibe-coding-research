'use client';

import { useCallback, useState } from 'react';
import { Download, Copy, Check, Loader2 } from 'lucide-react';
import { bumpStat } from '@/lib/stats';

type Props = {
  // 用 getter 函数避免引用过早绑定
  getNode: () => HTMLElement | null;
  fileName?: string;
};

type Status = 'idle' | 'saving' | 'saved' | 'copying' | 'copied' | 'error';

export function PosterActions({ getNode, fileName = 'pet-card' }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const renderNode = useCallback(async () => {
    const node = getNode();
    if (!node) throw new Error('找不到海报节点');
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(node, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
    });
    return canvas;
  }, [getNode]);

  const handleDownload = useCallback(async () => {
    setStatus('saving');
    setError(null);
    try {
      const canvas = await renderNode();
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      bumpStat('cardsShared', 1);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1800);
    } catch (e) {
      setError(e instanceof Error ? e.message : '导出失败');
      setStatus('error');
    }
  }, [renderNode, fileName]);

  const handleCopy = useCallback(async () => {
    setStatus('copying');
    setError(null);
    try {
      const canvas = await renderNode();
      const blob: Blob = await new Promise((res, rej) => {
        canvas.toBlob((b) => (b ? res(b) : rej(new Error('canvas toBlob 失败'))), 'image/png');
      });
      // 部分浏览器（iOS Safari < 16）没有 ClipboardItem
      if (typeof window !== 'undefined' && 'ClipboardItem' in window && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new (window as unknown as { ClipboardItem: typeof ClipboardItem }).ClipboardItem({
            'image/png': blob,
          }),
        ]);
        bumpStat('cardsShared', 1);
        setStatus('copied');
        setTimeout(() => setStatus('idle'), 1800);
      } else {
        // 不支持就退化为下载
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        setStatus('saved');
        setError('当前浏览器不支持复制到剪贴板，已自动下载');
        setTimeout(() => setStatus('idle'), 2400);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '复制失败');
      setStatus('error');
    }
  }, [renderNode, fileName]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleDownload}
          disabled={status === 'saving' || status === 'copying'}
          className="flex items-center justify-center gap-1.5 rounded-btn bg-primary py-2.5 text-sm font-medium text-white shadow-bubble disabled:opacity-60"
        >
          {status === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {status === 'saved' ? <Check className="h-4 w-4" /> : null}
          {status !== 'saving' && status !== 'saved' ? <Download className="h-4 w-4" /> : null}
          {status === 'saving' ? '生成中...' : status === 'saved' ? '已保存' : '下载 PNG'}
        </button>
        <button
          onClick={handleCopy}
          disabled={status === 'saving' || status === 'copying'}
          className="flex items-center justify-center gap-1.5 rounded-btn border-2 border-primary bg-white py-2.5 text-sm font-medium text-primary-dark disabled:opacity-60"
        >
          {status === 'copying' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {status === 'copied' ? <Check className="h-4 w-4" /> : null}
          {status !== 'copying' && status !== 'copied' ? <Copy className="h-4 w-4" /> : null}
          {status === 'copying' ? '复制中...' : status === 'copied' ? '已复制' : '复制图片'}
        </button>
      </div>
      {error ? <div className="mt-2 text-center text-[11px] text-tomato-dark">{error}</div> : null}
    </div>
  );
}
