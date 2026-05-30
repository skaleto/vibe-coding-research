import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { DISCLAIMER } from '@/lib/types';

// ⚠️ AboutPage 是全站**唯一**允许出现"翻译"二字的页面，且仅限免责语境。
// 任何此页面对"翻译"的引用都必须是"我们不是…"或"市面上一些 App 宣称…"风格的
// 否定/拒绝口吻，绝对禁止承诺翻译能力。
export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-4 pb-6">
      <header className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          aria-label="返回"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-soft"
        >
          <ArrowLeft className="h-4 w-4 text-ink-muted" />
        </button>
        <div className="text-sm font-medium text-ink-dark">关于</div>
        <span className="h-9 w-9" />
      </header>

      <section className="mt-6 space-y-3">
        <div className="text-center text-3xl">🐾 💕 🐱</div>
        <h1 className="text-center text-xl font-bold text-ink-dark">宠物心情卡片</h1>
        <p className="text-center text-sm text-ink-muted">萌宠对白生成器 · MVP</p>
      </section>

      {/* Hero Disclaimer */}
      <div className="mt-6 rounded-card border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            {DISCLAIMER}，不承诺真实还原动物语言。
          </div>
        </div>
      </div>

      {/* 这是什么 */}
      <section className="mt-6 rounded-card bg-white p-4 shadow-soft">
        <h2 className="text-base font-bold text-ink-dark">这是个什么 App？</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          一个让你<strong>笑、想分享、想给朋友看「我家宠物在说什么」</strong>的萌系娱乐工具。
          录段叫声，AI 帮你脑补 3-5 句拟人化对白 + 3 套可分享的萌系海报。
          仅此而已 —— 我们不做真实分析，不做行为学诊断，不做健康建议。
        </p>
      </section>

      {/* 重要：我们不是什么 */}
      <section className="mt-4 rounded-card border-2 border-tomato-light bg-white p-4 shadow-soft">
        <h2 className="flex items-center gap-2 text-base font-bold text-tomato-dark">
          <AlertTriangle className="h-4 w-4" />
          重要：我们不是动物语言翻译工具
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          市面上一些 App 宣称能"翻译"宠物叫声，把猫叫声翻译成"我想吃饭"或者"我爱你"。
          那是不科学的承诺 —— 现有技术做不到这件事。我们坚决不做这样的承诺，
          也不会在产品里使用"翻译""准确还原""真实意图"等暗示有真实识别能力的措辞。
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          我们做的事很简单：根据你录音的时长 + 一些粗略的声学特征（pitch、burst），
          让 AI 写一段萌系拟人化对白给你乐一乐、分享给朋友。
          就像给宠物配音的搞笑短视频，是娱乐内容创作，不是科学翻译。
        </p>
      </section>

      {/* 隐私 */}
      <section className="mt-4 rounded-card bg-white p-4 shadow-soft">
        <h2 className="text-base font-bold text-ink-dark">隐私 & 数据</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-ink">
          <li>· 录音文件仅在本地处理，不上传服务器</li>
          <li>· 只上传从录音中提取的时长 + 极简声学特征（4 个枚举值）</li>
          <li>· 生成的卡片仅保存在你设备的 localStorage，不同步</li>
          <li>· 没有账号系统，没有任何 PII 收集</li>
        </ul>
      </section>

      {/* 健康提醒 */}
      <section className="mt-4 rounded-card bg-white p-4 shadow-soft">
        <h2 className="text-base font-bold text-ink-dark">健康提醒</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          如果你担心宠物的健康状况、行为异常或心理问题，
          请联系正规的兽医或动物行为专家，而不是看一个娱乐性 App 生成的对白。
          我们生成的内容仅供娱乐，<strong>不能</strong>作为任何健康/行为/医疗判断的依据。
        </p>
      </section>

      {/* AI 标识 */}
      <section className="mt-4 rounded-card bg-white p-4 shadow-soft">
        <h2 className="text-base font-bold text-ink-dark">AI 生成内容标识</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          按《互联网信息服务深度合成管理规定》第 17 条，
          本 App 所有 AI 生成内容均显著标识"AI 生成"。
          海报底部、对白原文卡片底部、全屏分享视图底部均强制嵌入免责水印，
          且水印不可被用户隐藏或裁切。
        </p>
      </section>

      <div className="mt-6 text-center text-[11px] text-ink-muted">
        v0.1.0 · MVP · 萌系娱乐用途
      </div>
    </div>
  );
}
