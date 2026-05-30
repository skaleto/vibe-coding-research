import html2canvas from 'html2canvas';

export interface PosterExportResult {
  blob: Blob;
  dataUrl: string;
  filename: string;
}

export interface PosterExportOptions {
  filename?: string;
  /** Background color used by html2canvas. Defaults to null (transparent). */
  backgroundColor?: string | null;
  scale?: number;
}

/**
 * Render a DOM node as a PNG. Uses html2canvas (web-only).
 * NOTE: Don't run on iOS native shell — call iOS-side image renderer there.
 */
export async function exportNodeToPng(
  node: HTMLElement,
  options: PosterExportOptions = {},
): Promise<PosterExportResult> {
  const { filename = `countdown-${Date.now()}.png`, backgroundColor = null, scale = 2 } =
    options;
  const canvas = await html2canvas(node, {
    backgroundColor,
    scale,
    useCORS: true,
    logging: false,
  });
  const blob = await canvasToBlob(canvas);
  const dataUrl = canvas.toDataURL('image/png');
  return { blob, dataUrl, filename };
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('canvas.toBlob 失败'));
      },
      'image/png',
      1,
    );
  });
}

/** Trigger browser download for the rendered poster. */
export function downloadPoster(result: PosterExportResult): void {
  const url = URL.createObjectURL(result.blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = result.filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1000);
}

/**
 * Attempt to copy a poster blob to the system clipboard.
 * Returns true if the browser supports image/png ClipboardItem and the copy
 * succeeded; false otherwise (caller should fall back to download).
 */
export async function copyPosterToClipboard(
  result: PosterExportResult,
): Promise<boolean> {
  try {
    const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : null;
    if (
      clipboard &&
      typeof window !== 'undefined' &&
      'ClipboardItem' in window &&
      typeof clipboard.write === 'function'
    ) {
      const item = new ClipboardItem({ 'image/png': result.blob });
      await clipboard.write([item]);
      return true;
    }
  } catch (err) {
    console.warn('[exportPoster] clipboard copy failed', err);
  }
  return false;
}
