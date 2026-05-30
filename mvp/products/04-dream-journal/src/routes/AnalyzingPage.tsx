import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { loadDream, saveDream } from '@/lib/storage';
import { detectCrisis } from '@/lib/detectCrisis';
import { analyzeDream } from '@/lib/llm';

const STEPS = [
  '正在阅读你描述的梦境…',
  '正在提取其中的核心意象…',
  '正在用所选流派的心理学视角理解…',
  '正在准备 3 个反思问题…',
];

export default function AnalyzingPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const id = sp.get('id');
  const [step, setStep] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 1800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!id || ranRef.current) return;
    ranRef.current = true;
    const record = loadDream(id);
    if (!record) {
      setErr('找不到对应的梦境记录');
      return;
    }

    // 客户端再跑一次危机检测（兜底，避免有人手动跳到这一页）
    const crisis = detectCrisis(record.text);
    if (crisis.level === 1) {
      navigate('/crisis', { replace: true });
      return;
    }

    void (async () => {
      try {
        const data = await analyzeDream({
          dreamText: record.text,
          mood: record.mood,
          school: record.school,
        });
        if (data.redirectToCrisis) {
          navigate('/crisis', { replace: true });
          return;
        }
        if (!data.analysis) {
          throw new Error('分析结果为空');
        }
        const updated = {
          ...record,
          crisisLevel: data.crisisLevel,
          analysis: data.analysis,
        };
        saveDream(updated);
        navigate(`/result/${id}`, { replace: true });
      } catch (e) {
        console.error(e);
        setErr('分析失败，请稍后重试。');
      }
    })();
  }, [id, navigate]);

  if (err) {
    return (
      <div className="surface-card p-8 text-center space-y-4">
        <p className="text-status-warn">{err}</p>
        <button type="button" className="btn-ghost" onClick={() => navigate('/')}>
          回到首页
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6 animate-fade-in">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-primary animate-spin" aria-hidden="true" />
        <div className="absolute inset-0 rounded-full bg-accent/20 animate-breath -z-10" />
      </div>
      <p className="text-ink-muted text-sm transition-opacity">
        {STEPS[step]}
      </p>
      <p className="text-xs text-ink-light">
        这通常需要 8 – 10 秒，谢谢你的耐心。
      </p>
    </div>
  );
}
