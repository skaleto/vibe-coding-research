import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { MockPaymentDialog } from '@/components/MockPaymentDialog';
import { PricingModal } from '@/components/PricingModal';

export default function PricingPage() {
  const [open, setOpen] = useState(true);
  const [paymentSku, setPaymentSku] = useState<'18' | '68' | '198' | null>(null);

  return (
    <main className="max-w-3xl mx-auto px-5 py-10 space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary-dark"
      >
        <ArrowLeft size={14} /> 返回首页
      </Link>
      <header className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-ink-dark">付费墙（MVP mock）</h1>
        <p className="text-sm text-ink-muted">
          三档 SKU 卡片如下；MVP 不接真实支付，点击任意档将弹出 mock 支付二维码。
        </p>
      </header>
      <PricingModal
        open={open}
        onClose={() => setOpen(false)}
        onSelectTier={(sku) => {
          setPaymentSku(sku);
          setOpen(false);
        }}
      />
      <MockPaymentDialog
        open={!!paymentSku}
        sku={paymentSku}
        onClose={() => {
          setPaymentSku(null);
          setOpen(true);
        }}
      />
      {!open && !paymentSku && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="px-5 py-2.5 rounded-btn bg-primary text-white"
          >
            再看一次付费墙
          </button>
        </div>
      )}
    </main>
  );
}
