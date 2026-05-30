import { useState, type RefObject } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download, Printer, Loader2 } from 'lucide-react';
import { exportNodeToPdf } from '@/lib/exportPdf';

interface ExportBarProps {
  /** A4 简历根节点 ref，html2canvas / 打印都从这里抓 */
  sheetRef: RefObject<HTMLDivElement>;
  /** 文件名（取自姓名） */
  fileName: string;
}

// 提供两种导出：①下载 PDF（html2canvas+jsPDF，一键直接下载）②打印/高清（react-to-print，矢量）。
export function ExportBar({ sheetRef, fileName }: ExportBarProps) {
  const [busy, setBusy] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: sheetRef,
    documentTitle: fileName,
    pageStyle: '@page { size: A4; margin: 0; }',
  });

  async function handleDownload() {
    if (!sheetRef.current || busy) return;
    setBusy(true);
    try {
      await exportNodeToPdf(sheetRef.current, fileName);
    } catch (err) {
      // 极少数浏览器 / 跨域字体会失败，给出可读提示而非静默
      console.error('导出 PDF 失败:', err);
      window.alert('导出失败，请改用「打印 / 高清」按钮，或刷新后重试。');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-btn bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-60"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        下载 PDF
      </button>
      <button
        type="button"
        onClick={() => handlePrint()}
        className="inline-flex items-center gap-1.5 rounded-btn border border-ink-faint bg-white px-3 py-2 text-sm font-medium text-ink-muted transition hover:border-brand hover:text-brand"
        title="走浏览器打印，可「另存为 PDF」，文本为矢量、更清晰"
      >
        <Printer size={16} />
        打印 / 高清
      </button>
    </div>
  );
}
