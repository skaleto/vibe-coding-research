import { useEffect, useState } from 'react';

const STEPS = [
  '正在翻阅《诗经》…',
  '正在为您挑选 10 个好名字…',
  '正在撰写每个名字的释义…',
  '正在校验每条出处…',
];

export function Loading({ tip = 'AI 正在为宝宝选字…' }: { tip?: string }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
      setProgress((p) => Math.min(96, p + 16 + Math.random() * 8));
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-6">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        <span className="text-5xl font-serif text-primary">名</span>
      </div>
      <div className="text-lg text-ink-dark font-medium">{STEPS[step] ?? tip}</div>
      <div className="w-full max-w-md">
        <div className="h-1.5 rounded-full bg-bg-alt overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="text-xs text-ink-muted">
        首次使用可能稍慢，请稍候。无 LLM key 时会返回 mock 数据。
      </div>
    </div>
  );
}
