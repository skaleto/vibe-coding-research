import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-5 animate-fade-in pt-2 pb-12">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-xs text-ink-muted hover:text-primary inline-flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> 回到首页
        </Link>
        <h1 className="text-lg font-serif text-primary">关于</h1>
        <span />
      </div>

      <section className="surface-card p-5 space-y-3 text-sm leading-relaxed text-ink">
        <h2 className="font-medium text-primary">这是什么</h2>
        <p>
          梦境心理学日记是一个自我反思工具。你可以记录梦境，由 AI 用弗洛伊德、荣格、格式塔
          等心理学流派提供反思角度，帮助你更了解自己。
        </p>
        <p className="text-ink-muted">
          它<strong>不是</strong>算命、占卜、运势、灵性服务，也<strong>不</strong>提供任何形式的预测、
          吉凶判断或医疗诊断。AI 的输出是「心理学知识科普」性质的反思参考，
          不替代专业心理咨询。
        </p>
      </section>

      <section className="surface-card p-5 space-y-3 text-sm leading-relaxed">
        <h2 className="font-medium text-primary">我们怎么处理你的梦境</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-ink">
          <li>MVP 阶段所有数据仅存储在你的浏览器本地（localStorage），不上传服务器。</li>
          <li>未来正式版本：默认端到端加密本地存储，可选 iCloud 同步。</li>
          <li>梦境数据不用于训练 AI 模型。</li>
        </ul>
      </section>

      <section className="surface-card p-5 space-y-3 text-sm leading-relaxed">
        <h2 className="font-medium text-primary">如果你正在经历困难</h2>
        <p className="text-ink">
          如果你的描述里出现某些严重情绪关键词，我们会暂停常规的梦境分析，
          优先向你展示心理援助入口。如果你已经看到了那个页面 ——
          请优先照顾自己。
        </p>
        <p className="text-ink-muted">
          热线号码在上线前由合规人员人工核验填入；如果你看到「待人工核验」字样，
          请优先拨打你所在地区的紧急电话，或联系一个你信任的人，
          或前往就近的医院心理科 / 社区心理服务中心。
        </p>
        <Link to="/crisis" className="btn-ghost mt-2 inline-flex">
          查看求助入口
        </Link>
      </section>

      <section className="surface-card p-5 space-y-2 text-xs text-ink-muted leading-relaxed">
        <h2 className="font-medium text-primary text-sm mb-1">技术说明</h2>
        <p>MVP 版本：Vite + React + TypeScript + Tailwind + Capacitor。LLM 走远端 gateway，失败 fallback 到 mock。</p>
        <p>本应用为「健康记录 / 生活记录」类工具，<strong>不</strong>提供专业心理咨询服务。</p>
      </section>
    </div>
  );
}
