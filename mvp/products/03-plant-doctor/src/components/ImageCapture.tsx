import { useRef, useState, useCallback } from 'react';
import { Camera, ImagePlus, X, Loader2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';

import { compressImage, compressDataUrl, type CompressedImage } from '@/lib/imageCompress';

const MAX_IMAGES = 3;

const SLOT_HINTS = ['叶子特写', '全株照', '环境/盆土'];

export interface ImageCaptureProps {
  images: CompressedImage[];
  onChange: (next: CompressedImage[]) => void;
}

export function ImageCapture({ images, onChange }: ImageCaptureProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (arr.length === 0) {
        setError('请上传图片文件（jpg/png/heic）');
        return;
      }
      const room = MAX_IMAGES - images.length;
      const take = arr.slice(0, room);
      setBusy(true);
      try {
        const compressed: CompressedImage[] = [];
        for (const f of take) {
          const c = await compressImage(f);
          compressed.push(c);
        }
        onChange([...images, ...compressed].slice(0, MAX_IMAGES));
      } catch (e) {
        setError(e instanceof Error ? e.message : '图片处理失败');
      } finally {
        setBusy(false);
      }
    },
    [images, onChange],
  );

  /**
   * Native path: use Capacitor Camera plugin for nicer UX (system camera UI,
   * gallery picker, permission handling) rather than the legacy
   * `<input type="file" capture>` shim.
   *
   * Falls back automatically to the file input on web platforms.
   */
  const handlePickFromCamera = useCallback(async () => {
    setError(null);
    if (!Capacitor.isNativePlatform()) {
      inputRef.current?.click();
      return;
    }
    if (images.length >= MAX_IMAGES) return;
    setBusy(true);
    try {
      const photo = await CapCamera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // prompts user to pick "Camera" or "Photos"
        promptLabelHeader: '选择图片',
        promptLabelPhoto: '从相册选择',
        promptLabelPicture: '拍照',
        correctOrientation: true,
      });
      if (!photo.dataUrl) {
        setError('未获取到图片，请重试');
        return;
      }
      // Run the same 200KB JPEG canvas-compression pipeline as the file picker
      // so the gateway always sees normalized payloads.
      const compressed = await compressDataUrl(photo.dataUrl);
      onChange([...images, compressed].slice(0, MAX_IMAGES));
    } catch (e) {
      const message = e instanceof Error ? e.message : '相机调用失败';
      // 用户取消拍照（"User cancelled photos app"）不算错误
      if (/cancel/i.test(message)) return;
      setError(message);
    } finally {
      setBusy(false);
    }
  }, [images, onChange]);

  return (
    <div className="space-y-3">
      <div
        className={`rounded-card border-2 border-dashed p-6 text-center transition-colors ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-primary/30 bg-bg-paper'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) {
            void handleFiles(e.dataTransfer.files);
          }
        }}
      >
        <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
          {busy ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <Camera className="h-8 w-8 text-primary" />
          )}
          <p className="text-sm text-ink-muted">
            最多 3 张：建议拍叶子特写、全株、环境/盆土
          </p>
          <p className="text-xs text-ink-muted">
            iOS / Android 调用系统相机；浏览器/桌面端可点击或拖拽上传
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handlePickFromCamera}
              disabled={busy || images.length >= MAX_IMAGES}
              className="inline-flex items-center gap-1 rounded-btn bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              <ImagePlus className="h-4 w-4" />
              选择/拍照（{images.length}/{MAX_IMAGES}）
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) void handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-btn bg-status-danger/10 px-3 py-2 text-sm text-status-danger">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: MAX_IMAGES }).map((_, idx) => {
            const img = images[idx];
            return (
              <div
                key={idx}
                className="relative aspect-square overflow-hidden rounded-card border border-primary/10 bg-bg-paper"
              >
                {img ? (
                  <>
                    <img
                      src={img.dataUrl}
                      alt={`已上传图片 ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label="移除这张图"
                      onClick={() => {
                        const next = images.filter((_, i) => i !== idx);
                        onChange(next);
                      }}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <span className="absolute bottom-1 left-1 rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white">
                      {Math.round(img.bytes / 1024)} KB
                    </span>
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-xs text-ink-muted">
                    <span className="text-2xl opacity-30">+</span>
                    <span className="mt-1">{SLOT_HINTS[idx]}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
