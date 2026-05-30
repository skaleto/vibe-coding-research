import { Link } from 'react-router-dom';
import { Camera, Leaf, ListChecks, ShieldCheck } from 'lucide-react';
import { StatBadge } from '@/components/StatBadge';

/**
 * HomePage —— "/" 首页。
 *
 * Hero 文案完全照 detail-03 + compliance-checklist：
 *  - "Fire your 花店老板" 反差挂角
 *  - 数字 banner 走 StatBadge，从 localStorage 真实计数
 *  - 主 CTA "拍叶子，看看怎么了" 跳 /capture
 *  - 三段卖点：图片诊断 + 30 天日历 + 合规免责
 */
export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-card bg-primary px-6 py-10 text-white shadow-card sm:px-10 sm:py-14">
        <div className="text-xs uppercase tracking-[0.32em] opacity-70">
          Fire your 花店老板
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-snug sm:text-4xl">
          拍叶子，看看怎么了。
        </h1>
        <p className="mt-3 max-w-lg text-sm text-white/85 sm:text-base">
          上传 1-3 张植物照片，30 秒内得到病害诊断、30 天非药物护理日历，
          并附 AI 局限性的明确说明。严重病害我们会推你去找本地园艺师。
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <StatBadge
            statKey="analyzed"
            prefix="已分析 "
            suffix="+ 张照片"
          />
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/80">
            AI 诊断仅供参考，不替代专业园艺师
          </span>
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/capture"
            className="inline-flex items-center gap-2 rounded-btn bg-accent px-5 py-3 text-sm font-semibold text-ink-dark shadow-soft hover:bg-accent-dark"
          >
            <Camera className="h-4 w-4" />
            拍叶子，看看怎么了
          </Link>
          <Link
            to="/my-plants"
            className="inline-flex items-center gap-2 rounded-btn bg-white/15 px-5 py-3 text-sm font-medium text-white hover:bg-white/25"
          >
            <ListChecks className="h-4 w-4" />
            我的植物档案
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <FeatureCard
          icon={<Camera className="h-5 w-5" />}
          title="拍照即诊断"
          body="叶子特写 + 全株 + 环境，3 张照片足够 AI 出一份结构化诊断"
        />
        <FeatureCard
          icon={<Leaf className="h-5 w-5" />}
          title="30 天护理日历"
          body="非药物为主：浇水 / 通风 / 光照 / 观察 / 换盆 + 何时建议咨询"
        />
        <FeatureCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="合规友好"
          body="不给具体药名、不给剂量稀释比例，严重情况引导线下问花卉店或园艺师"
        />
      </section>

      <section className="rounded-card border border-primary/15 bg-bg-paper px-6 py-5 text-sm leading-relaxed text-ink-muted">
        <div className="font-medium text-ink">这个工具不做什么</div>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>不推荐任何农药商品名 / 通用名 / 剂量 / 稀释比例</li>
          <li>不诊断动物 / 宠物 / 人体疾病</li>
          <li>不在没有图片的情况下给"确定性"判断</li>
          <li>不替代本地花卉店、园艺师、农资人员的现场判断</li>
        </ul>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-card border border-primary/10 bg-bg-paper p-5 shadow-soft">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="mt-3 font-semibold text-ink">{title}</div>
      <p className="mt-1 text-sm text-ink-muted">{body}</p>
    </div>
  );
}
