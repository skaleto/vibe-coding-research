import { useEffect, useState } from 'react';
import { X, Smartphone } from 'lucide-react';
import type { Countdown } from '@/lib/types';
import { WidgetPreview, type WidgetSize } from './WidgetPreview';

interface WidgetModalProps {
  card: Countdown;
  open: boolean;
  onClose: () => void;
}

const SIZES: WidgetSize[] = ['small', 'medium', 'large'];
const LABELS: Record<WidgetSize, string> = {
  small: 'systemSmall · 158pt',
  medium: 'systemMedium · 329×158pt',
  large: 'systemLarge · 329×345pt',
};

/**
 * "Add to Home Screen?" preview modal — shows the 3 WidgetKit families and
 * explains that the real native widget ships behind ios-widget-todo.md.
 */
export function WidgetModal({ card, open, onClose }: WidgetModalProps) {
  const [active, setActive] = useState<WidgetSize>('medium');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-4"
      style={{ background: 'rgba(10,14,39,0.55)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'var(--theme-surface)',
          color: 'var(--theme-text)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-black/5"
          aria-label="关闭"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Smartphone size={18} />
          <h2 className="text-lg font-semibold">添加到桌面</h2>
        </div>
        <p className="text-sm opacity-70 mb-4">
          下面是 iOS 桌面 / 锁屏可用的 3 个尺寸。下方"在 iOS 原生壳启用后可见"按钮指向
          WidgetKit 实现说明。
        </p>

        <div className="flex gap-2 flex-wrap mb-4">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setActive(s)}
              className="px-3 py-1.5 rounded-full text-xs transition-colors"
              style={{
                background: active === s ? 'var(--theme-primary)' : 'transparent',
                color: active === s ? 'var(--theme-surface)' : 'var(--theme-text)',
                border: `1px solid ${active === s ? 'var(--theme-primary)' : 'var(--theme-muted)'}`,
              }}
            >
              {LABELS[s]}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center py-4">
          <WidgetPreview card={card} size={active} fixedSize />
        </div>

        <div
          className="text-xs leading-relaxed rounded-xl p-3 mt-4 border"
          style={{ borderColor: 'var(--theme-muted)', color: 'var(--theme-muted)' }}
        >
          <strong className="block mb-1" style={{ color: 'var(--theme-text)' }}>
            iOS 原生壳启用后可见
          </strong>
          桌面 / 锁屏小组件需要 WidgetKit Extension。Web 端展示的视觉效果会在
          iOS 包内由 SwiftUI 1:1 还原（含 systemSmall / systemMedium / systemLarge /
          accessoryCircular / accessoryRectangular 5 个尺寸）。实现指引详见
          <code className="mx-1">ios-widget-todo.md</code>。
        </div>
      </div>
    </div>
  );
}
