/**
 * 客户端图像压缩到 ~200KB 以内
 *
 * - 长边 1024px
 * - JPEG 质量自适应（从 0.85 起步逐步下调）
 * - 同时剥离 EXIF（canvas 重绘自动丢弃所有 EXIF / GPS）
 */

const TARGET_BYTES = 200 * 1024; // 200KB
const MAX_LONG_EDGE = 1024;
const MIN_QUALITY = 0.5;

export interface CompressedImage {
  dataUrl: string;
  bytes: number;
  width: number;
  height: number;
}

/**
 * 压缩一张图片到 200KB 以内，返回 data URL。
 * 浏览器端调用，依赖 HTMLCanvasElement。
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  const dataUrl = await readAsDataUrl(file);
  return compressDataUrl(dataUrl);
}

/**
 * 把已有的 data URL（来自 Capacitor Camera plugin 等）跑同一套
 * canvas-rescale + JPEG 自适应质量管线，统一压到 ~200KB。
 */
export async function compressDataUrl(dataUrl: string): Promise<CompressedImage> {
  const img = await loadImage(dataUrl);
  const { width, height } = scaleDown(img.width, img.height, MAX_LONG_EDGE);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法获取 canvas 2d 上下文');
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.85;
  let out = canvas.toDataURL('image/jpeg', quality);

  // 估算字节数（base64 字符数 * 3/4）
  while (estimateBytes(out) > TARGET_BYTES && quality > MIN_QUALITY) {
    quality = Math.max(MIN_QUALITY, quality - 0.1);
    out = canvas.toDataURL('image/jpeg', quality);
  }

  return {
    dataUrl: out,
    bytes: estimateBytes(out),
    width,
    height,
  };
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function scaleDown(w: number, h: number, max: number): { width: number; height: number } {
  const long = Math.max(w, h);
  if (long <= max) return { width: w, height: h };
  const ratio = max / long;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

function estimateBytes(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(',');
  const b64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  return Math.ceil((b64.length * 3) / 4);
}
