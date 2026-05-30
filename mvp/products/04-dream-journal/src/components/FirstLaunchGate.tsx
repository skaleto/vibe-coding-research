import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  ackFirstLaunch,
  hasAcknowledgedFirstLaunch,
} from '@/lib/storage';
import { DISCLAIMER_FIRST_LAUNCH } from '@/lib/disclaimer';

/**
 * 首次安装强制弹窗（detail-04 § D.2 模板 3）。
 *
 * 用户必须勾选确认才能继续使用，强阻断设计。
 */
export function FirstLaunchGate() {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!hasAcknowledgedFirstLaunch()) {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/80 backdrop-blur-sm px-4">
      <div className="surface-card max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3 text-primary">
          <ShieldCheck className="w-6 h-6" aria-hidden="true" />
          <h2 className="text-lg font-semibold">使用前请你知悉</h2>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-line text-ink">
          {DISCLAIMER_FIRST_LAUNCH}
        </p>
        <label className="flex items-start gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            className="mt-1"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>我已阅读并同意上述说明</span>
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              if (typeof window !== 'undefined') window.location.href = 'about:blank';
            }}
          >
            退出
          </button>
          <button
            type="button"
            className="btn-primary disabled:opacity-50"
            disabled={!checked}
            onClick={() => {
              ackFirstLaunch();
              setOpen(false);
            }}
          >
            开始使用
          </button>
        </div>
      </div>
    </div>
  );
}
