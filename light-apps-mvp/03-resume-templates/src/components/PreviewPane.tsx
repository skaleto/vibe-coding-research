import { useEffect, useRef, useState, type RefObject } from 'react';
import type { ResumeData, TemplateId } from '@/lib/types';
import { ResumeRenderer } from '@/components/ResumeRenderer';

interface PreviewPaneProps {
  data: ResumeData;
  templateId: TemplateId;
  watermark: boolean;
  /** 暴露给导出：真实 A4 节点（scale=1，不受预览缩放影响） */
  sheetRef: RefObject<HTMLDivElement>;
}

const A4_PX = 794; // A4 宽度 @96dpi

/**
 * 预览面板：把 794px 的真实 A4 节点按容器宽度等比缩放展示，
 * 但导出抓取的仍是未缩放的原始节点（保证 PDF 清晰、尺寸正确）。
 */
export function PreviewPane({ data, templateId, watermark, sheetRef }: PreviewPaneProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [sheetHeight, setSheetHeight] = useState(0);

  // 监听容器宽度，算缩放比
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => {
      const avail = wrap.clientWidth;
      const next = Math.min(1, avail / A4_PX);
      setScale(next > 0 ? next : 1);
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // 缩放后实际占位高度，避免底部留白 / 被截断
  useEffect(() => {
    if (sheetRef.current) {
      setSheetHeight(sheetRef.current.offsetHeight * scale);
    }
  }, [scale, data, templateId, watermark, sheetRef]);

  return (
    <div ref={wrapRef} className="flex w-full justify-center">
      <div style={{ height: sheetHeight || undefined }}>
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
          className="shadow-sheet"
        >
          <ResumeRenderer
            ref={sheetRef}
            data={data}
            templateId={templateId}
            watermark={watermark}
          />
        </div>
      </div>
    </div>
  );
}
