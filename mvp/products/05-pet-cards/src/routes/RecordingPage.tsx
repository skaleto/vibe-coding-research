import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic } from 'lucide-react';

// RecordingPage 主要是为支持 /recording 直接深链时的过渡：
// 录音 UI 实质由 HomePage 内嵌的 AudioRecorder 承担。这里仅做一次重定向 +
// 波形装饰，避免 deep link 进来时是空白屏。
export default function RecordingPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = window.setTimeout(() => navigate('/', { replace: true }), 800);
    return () => window.clearTimeout(t);
  }, [navigate]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-white shadow-bubble">
        <span className="breathing-ring" />
        <span className="breathing-ring delay-1" />
        <span className="breathing-ring delay-2" />
        <Mic className="h-16 w-16" />
      </div>
      <div className="mt-6 text-base text-ink-muted">回到主页准备录音…</div>
      <div className="mt-3 flex h-16 items-center gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="wave-bar"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
    </div>
  );
}
