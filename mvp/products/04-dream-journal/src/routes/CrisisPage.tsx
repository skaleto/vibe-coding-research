/**
 * 危机干预页面（命脉）。
 *
 * 合规要求（不可妥协）：
 * 1. 不显示任何"继续分析 / 我现在还好"按钮 —— 禁止用户绕过危机干预
 * 2. 不展示梦境意象解读
 * 3. 不展示具体心理热线号码（所有号码都是 placeholder，上线前由合规人工核验填入）
 * 4. 三个唯一可点击的按钮：「打开拨号」「发送给信任的人」「稍后再记录」
 */

import { Link } from 'react-router-dom';
import { Heart, Phone, MessageSquare, Pause } from 'lucide-react';
import { Placeholder } from '@/components/Placeholder';
import { getHotlines, renderHotlineLine, GENERIC_CARE_FALLBACK } from '@/lib/crisisHotlines';

export default function CrisisPage() {
  const hotlines = getHotlines('zh-CN');

  return (
    <div className="space-y-6 animate-fade-in pt-2">
      <section className="bg-care-card border border-care-warm/40 rounded-card p-6 space-y-3">
        <div className="flex items-center gap-2 text-care-accent">
          <Heart className="w-5 h-5" aria-hidden="true" />
          <span className="text-sm font-medium">谢谢你愿意把这件事写下来</span>
        </div>
        <p className="text-ink leading-relaxed text-sm">
          我注意到你刚刚的描述里，可能有一些难以承受的感受。
          在我们继续之前，请允许我把这些放在最前面 —— 你不需要立刻解决任何事，
          也不必一个人扛。
        </p>
        <p className="text-ink leading-relaxed text-sm">
          下面是几个你现在可以走的小步骤。它们都很小，但都是真实有效的。
        </p>
      </section>

      <Placeholder
        kind="crisis-care"
        aspect="16/7"
        caption="温暖手势 / 灯光 / 一杯水"
        spec="温暖橙色 #E8A87C 主调；柔和、不刺眼；占位插画严禁悲伤、危险、跳跃、坠落等图像"
      />

      <section className="surface-card p-5 space-y-3">
        <div className="flex items-center gap-2 text-primary text-sm font-medium">
          <Phone className="w-4 h-4" aria-hidden="true" />
          <span>如果你现在愿意，请联系</span>
        </div>
        <ul className="space-y-2 text-sm text-ink leading-relaxed">
          {hotlines.map((h) => (
            <li key={h.placeholderKey} className="text-ink-muted">
              {renderHotlineLine(h)}
            </li>
          ))}
          <li className="text-ink-muted">{GENERIC_CARE_FALLBACK}</li>
        </ul>
        <p className="text-xs text-ink-light pt-1">
          上述号码上线前由人工核验填入；如配置缺失，请优先拨打你所在地区的紧急电话，
          或前往就近医院心理科。
        </p>
      </section>

      <section className="grid grid-cols-1 gap-2">
        {/* 注：tel: / sms: 号码都用 placeholder，**不**硬编码具体号码 */}
        <a
          href="tel:"
          className="btn-accent"
          aria-label="打开拨号界面"
        >
          <Phone className="w-4 h-4" aria-hidden="true" />
          打开拨号
        </a>
        <a
          href="sms:?body=%E6%88%91%E7%8E%B0%E5%9C%A8%E9%9C%80%E8%A6%81%E4%B8%80%E5%8F%A3%E6%B0%94%EF%BC%8C%E4%BD%A0%E6%9C%89%E7%A9%BA%E5%90%97%EF%BC%9F"
          className="btn-ghost"
          aria-label="发送短信给信任的人"
        >
          <MessageSquare className="w-4 h-4" aria-hidden="true" />
          发送给信任的人
        </a>
        <Link to="/" className="btn-ghost">
          <Pause className="w-4 h-4" aria-hidden="true" />
          稍后再记录
        </Link>
      </section>

      <section className="text-xs text-ink-light leading-relaxed text-center px-2 pt-2">
        本页面不会继续做梦境分析。如果你愿意，等情绪平复一些再回来记录，
        梦境会一直在这里等你。
      </section>
    </div>
  );
}
