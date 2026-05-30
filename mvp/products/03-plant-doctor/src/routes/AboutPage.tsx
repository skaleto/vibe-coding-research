import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, AlertTriangle, Mail } from 'lucide-react';

/**
 * AboutPage —— "/about"。
 *
 * 完整免责声明 + 工具边界 + 联系方式。文案与 detail-03 +
 * compliance-checklist 一致；不能放任何"已治愈/已诊断"等暗示治疗结果的措辞。
 */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <div className="text-xs uppercase tracking-[0.3em] text-ink-muted">about</div>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-ink">
          <Leaf className="h-5 w-5 text-primary" /> 关于 AI 植物医生
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          一个面向家庭园艺的 AI 助手：拍 1-3 张叶子照片，得到病害分析 + 30 天非药物护理日历。
          所有结果仅供参考，不替代任何专业园艺师 / 农资人员的现场判断。
        </p>
      </header>

      <Section title="工具能做什么" icon={<Leaf className="h-4 w-4" />}>
        <ul className="list-inside list-disc space-y-1 text-sm">
          <li>识别常见家庭室内观叶植物（多肉、龟背竹、绿萝、文竹、君子兰）</li>
          <li>识别阳台果蔬（番茄、辣椒、草莓）和常见花卉（月季、兰花、仙人掌科）</li>
          <li>给出三段诊断假设（病因 / 证据 / 严重程度），按可能性高低排序</li>
          <li>生成 30 天非药物护理日历：浇水 / 施肥 / 光照 / 通风 / 观察 / 换盆 / 咨询</li>
          <li>当 AI 不确定时主动要求补图，不会强行下结论</li>
        </ul>
      </Section>

      <Section title="工具不会做什么" icon={<AlertTriangle className="h-4 w-4" />}>
        <ul className="list-inside list-disc space-y-1 text-sm">
          <li>不会推荐任何农药商品名、通用名、剂量或稀释比例</li>
          <li>不会给"按产品说明使用"这类隐含具体用药的话术</li>
          <li>不会诊断动物、宠物、人体疾病；只服务于植物</li>
          <li>不会在没有图像的情况下给确定性诊断</li>
          <li>不会推荐"中草药治病"或任何医疗用途的植物使用</li>
        </ul>
      </Section>

      <Section title="严重情况怎么办" icon={<ShieldCheck className="h-4 w-4" />}>
        <p className="text-sm">
          如果出现以下情况之一，强烈建议带照片到本地花卉店、园艺师或农资人员处咨询，
          并严格阅读相关产品说明 / 遵循当地法规：
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
          <li>诊断结果中 <b>恢复展望 = 低</b> 或 <b>严重程度 = 重</b></li>
          <li>14 天观察期内症状持续恶化或大面积扩散</li>
          <li>识别为食用作物（番茄、辣椒、草莓、生菜等），处理后建议咨询专业人员再食用</li>
          <li>家中有孕妇 / 婴幼儿 / 宠物时，请避免直接接触受影响部位</li>
        </ul>
      </Section>

      <Section title="数据与隐私">
        <ul className="list-inside list-disc space-y-1 text-sm">
          <li>所有图片在本机压缩到 ~200KB 并去除 EXIF / GPS 信息后再上传到诊断网关</li>
          <li>诊断历史与日历完成态仅保存在你的设备 localStorage，卸载即丢失</li>
          <li>不需要注册、不需要邮箱 / 手机号；不收集个人身份信息</li>
          <li>诊断网关使用第三方视觉模型；请勿上传涉及他人隐私的画面</li>
        </ul>
      </Section>

      <Section title="联系" icon={<Mail className="h-4 w-4" />}>
        <p className="text-sm text-ink-muted">
          反馈渠道与产品策略详见 research 仓库 detail-03 文档。本工具为 MVP 阶段，
          所有建议均可能因模型限制出错，请勿据此做高成本决策。
        </p>
      </Section>

      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          to="/capture"
          className="inline-flex items-center gap-2 rounded-btn bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          回到诊断
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-btn border border-primary/20 px-4 py-2 text-sm font-medium text-ink"
        >
          首页
        </Link>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-primary/10 bg-bg-paper p-5 shadow-soft">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
        {icon}
        {title}
      </h2>
      <div className="mt-3 text-ink">{children}</div>
    </section>
  );
}
