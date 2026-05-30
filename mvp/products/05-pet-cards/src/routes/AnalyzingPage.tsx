import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  '🎤 正在偷听宝宝的小心思…',
  '✨ AI 在脑补萌系对白…',
  '🎨 给卡片配上专属配色…',
  '💕 马上就好啦~',
];

// AnalyzingPage 仅作 loading 占位：
// HomePage 在调用 generatePetCard 后会直接 navigate 到 /result/:id；
// 用户若手动深链 /analyzing 进来则原地循环萌系动画 + 8s 超时回首页。
export default function AnalyzingPage() {
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setStepIdx((i) => (i + 1) % STEPS.length);
    }, 1200);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    // 防 deep-link 死循环：8 秒未跳转就回首页
    const fallback = window.setTimeout(() => navigate('/', { replace: true }), 12000);
    return () => window.clearTimeout(fallback);
  }, [navigate]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      {/* 萌系跳动 emoji 阵 */}
      <div className="flex items-end gap-2 text-5xl">
        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>🐾</span>
        <span className="animate-bounce" style={{ animationDelay: '120ms' }}>🐱</span>
        <span className="animate-bounce" style={{ animationDelay: '240ms' }}>💭</span>
      </div>
      <div className="mt-8 text-lg font-medium text-ink-dark">{STEPS[stepIdx] ?? STEPS[0]}</div>
      <div className="mt-6 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <div className="mt-6 text-xs text-ink-muted">大约 3-5 秒哦</div>
    </div>
  );
}
