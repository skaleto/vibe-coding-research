import { useState } from 'react';
import { X, Check, Sparkles, Loader2 } from 'lucide-react';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  /** mock 支付成功回调 */
  onPaid: () => void;
}

const PERKS = [
  '解锁全部 4 套精选模板',
  '导出去除水印',
  '高清 PDF / 打印',
  '一次买断 · 永久可用 · 不订阅',
];

// 付费墙（mock）：展示权益，点「支付」后假装走支付，1.2s 后置为已解锁。
export function PaywallModal({ open, onClose, onPaid }: PaywallModalProps) {
  const [paying, setPaying] = useState(false);
  if (!open) return null;

  function pay() {
    if (paying) return;
    setPaying(true);
    // 模拟支付收银台等待，真实环境此处接微信虚拟支付 / Apple 内购
    setTimeout(() => {
      setPaying(false);
      onPaid();
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-sheet">
        <div className="relative bg-gradient-to-br from-brand to-brand-dark px-6 py-7 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 text-white/80 hover:text-white"
            aria-label="关闭"
          >
            <X size={20} />
          </button>
          <Sparkles size={28} className="mb-2" />
          <h2 className="text-xl font-bold">解锁全部模板</h2>
          <p className="mt-1 text-sm text-white/85">¥9 一次买断，去水印 + 全部模板永久可用</p>
        </div>

        <div className="px-6 py-5">
          <ul className="space-y-2.5">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm text-ink">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Check size={13} />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-brand">¥9</span>
            <span className="text-sm text-ink-light line-through">¥39</span>
            <span className="rounded bg-brand-light px-1.5 py-0.5 text-[11px] font-medium text-brand">
              限时买断
            </span>
          </div>

          <button
            type="button"
            onClick={pay}
            disabled={paying}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-btn bg-brand py-3 text-base font-semibold text-white transition hover:bg-brand-dark disabled:opacity-70"
          >
            {paying ? (
              <>
                <Loader2 size={18} className="animate-spin" /> 支付中…
              </>
            ) : (
              '立即解锁（¥9）'
            )}
          </button>
          <p className="mt-2 text-center text-[11px] text-ink-light">
            演示版：点击即模拟支付成功，不会真实扣款
          </p>
        </div>
      </div>
    </div>
  );
}
