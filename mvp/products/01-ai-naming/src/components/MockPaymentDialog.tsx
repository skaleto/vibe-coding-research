import { X } from 'lucide-react';

import { Placeholder } from './Placeholder';

export function MockPaymentDialog({
  open,
  onClose,
  sku,
}: {
  open: boolean;
  onClose: () => void;
  sku: '18' | '68' | '198' | null;
}) {
  if (!open || !sku) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-card max-w-sm w-full shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">¥{sku} 支付（mock）</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-bg-alt"
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </div>

        <Placeholder
          kind="payment-qrcode"
          width={240}
          height={240}
          caption="微信 / 支付宝 二维码占位"
          spec="正方形 240x240，含品牌色边框，中央为模拟二维码点阵"
          className="mx-auto"
        />

        <div className="text-sm text-ink space-y-2">
          <p>1. 用微信 / 支付宝扫描上方二维码完成 ¥{sku} 支付。</p>
          <p>2. 支付完成后请添加客服微信 <span className="font-mono text-primary-dark">shijing_qiming_bot</span> 发送支付截图，我们将在 24 小时内为您开通会员权益。</p>
          <p className="text-xs text-orange-700/80 pt-2 border-t border-orange-200">
            ⚠ 本产品 MVP 阶段，付费链路待接通；正式版将接入 Apple IAP / 微信支付。
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-btn bg-primary text-white hover:bg-primary-dark"
        >
          我已联系客服 / 关闭
        </button>
      </div>
    </div>
  );
}
