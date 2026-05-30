import { Check, X } from 'lucide-react';

import { Placeholder } from './Placeholder';

type Tier = {
  sku: '18' | '68' | '198';
  title: string;
  tag: string;
  price: number;
  originalPrice?: number;
  features: string[];
  highlight?: boolean;
};

const TIERS: Tier[] = [
  {
    sku: '18',
    title: '冲动尝试包',
    tag: '冲动尝试',
    price: 18,
    features: ['解锁当前 10 个名字', '海报去水印', '终身查询本次结果'],
  },
  {
    sku: '68',
    title: '标准包',
    tag: '90% 用户选择',
    price: 68,
    originalPrice: 198,
    highlight: true,
    features: [
      '解锁全部 10 个名字',
      '5 种海报风格',
      '详细释义 + 单字解析',
      '终身可查询本次结果',
      '海报去水印 + 高清 4K',
    ],
  },
  {
    sku: '198',
    title: '大师包',
    tag: '送给重要的 TA',
    price: 198,
    features: [
      '30 个候选名字（多生成 2 轮）',
      '8 种海报风格',
      '小红书 9 宫格套图',
      '朋友圈横版海报',
      '终身重新生成不限次',
    ],
  },
];

export function PricingModal({
  open,
  onClose,
  onSelectTier,
}: {
  open: boolean;
  onClose: () => void;
  onSelectTier: (sku: Tier['sku']) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-card w-full max-w-2xl max-h-[92dvh] overflow-y-auto shadow-card">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-primary/10 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-ink-dark">解锁完整体验</h2>
            <p className="text-xs text-ink-muted mt-1">为人生重要的一刻，起一个有出处的名字</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-bg-alt"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        {/* Decoration */}
        <div className="px-6 pt-4">
          <Placeholder
            kind="pricing-bg"
            aspect="3/1"
            caption="付费墙顶部水墨装饰"
            spec="水墨'名'字毛笔书法 + 远山轮廓 + 米色底"
            className="h-24"
          />
        </div>

        {/* Tiers */}
        <div className="px-6 py-5 space-y-3">
          {TIERS.map((tier) => (
            <button
              key={tier.sku}
              type="button"
              onClick={() => onSelectTier(tier.sku)}
              className={`w-full text-left rounded-card p-4 border-2 transition-all ${
                tier.highlight
                  ? 'border-accent bg-gradient-to-br from-accent/5 to-primary/5 shadow-card'
                  : 'border-primary/20 hover:border-primary bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-ink-dark">{tier.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        tier.highlight
                          ? 'bg-accent text-white'
                          : 'bg-bg-alt text-ink-muted'
                      }`}
                    >
                      {tier.tag}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {tier.features.map((f) => (
                      <li key={f} className="text-xs text-ink flex items-start gap-1.5">
                        <Check size={12} className="text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-xs text-ink-muted">¥</span>
                    <span
                      className={`text-3xl font-bold ${
                        tier.highlight ? 'text-accent' : 'text-ink-dark'
                      }`}
                    >
                      {tier.price}
                    </span>
                  </div>
                  {tier.originalPrice && (
                    <div className="text-xs text-ink-muted line-through">
                      原价 ¥{tier.originalPrice}
                    </div>
                  )}
                  <div
                    className={`mt-2 inline-block px-3 py-1 rounded-btn text-xs font-medium ${
                      tier.highlight
                        ? 'bg-accent text-white'
                        : 'bg-primary/10 text-primary-dark'
                    }`}
                  >
                    立即解锁
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Trust footer */}
        <div className="px-6 pb-6 text-xs text-ink-muted space-y-1.5">
          <p>🔒 微信支付 / Apple Pay 加密 · 为人生重要的一刻起名</p>
          <p className="text-orange-700/80">
            ⚠ 本产品 MVP 阶段，付费链路待接通：点击任一档将弹出 mock 支付二维码占位图。
          </p>
        </div>
      </div>
    </div>
  );
}
