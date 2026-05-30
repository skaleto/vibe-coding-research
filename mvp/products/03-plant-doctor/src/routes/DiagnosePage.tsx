import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react';

import { diagnose, type LLMInput } from '@/lib/llm';
import { lintDiagnosisResult } from '@/lib/lintAction';
import { newId, saveDiagnosis, type SavedDiagnosis } from '@/lib/store';
import { bumpStat } from '@/lib/stats';

const PENDING_REQUEST_KEY = 'plant-doctor/pending-request';

interface PendingRequest extends Omit<LLMInput, 'images'> {
  images: string[];
  thumb?: string;
}

/**
 * DiagnosePage —— "/diagnose"。
 *
 * 桥接页：读 localStorage 里 CapturePage 暂存的 payload → 调 diagnose() →
 * 把结果交给 lintDiagnosisResult 做双重保险合规清洗 → saveDiagnosis →
 * 跳转 /result/:id。失败 / 缺少 payload → 退回 /capture。
 */
export default function DiagnosePage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'loading' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const raw = window.localStorage.getItem(PENDING_REQUEST_KEY);
      if (!raw) {
        navigate('/capture', { replace: true });
        return;
      }

      let payload: PendingRequest;
      try {
        payload = JSON.parse(raw) as PendingRequest;
      } catch {
        navigate('/capture', { replace: true });
        return;
      }

      if (!payload.images?.length) {
        navigate('/capture', { replace: true });
        return;
      }

      // 读到 payload 后立即清掉一次性 key（无论后续成败），避免：
      //  - 异常路径 / 中途退出后陈旧请求残留 + 占配额；
      //  - 下次进 /diagnose 复用上一次旧图重新诊断（A3-03-7）。
      window.localStorage.removeItem(PENDING_REQUEST_KEY);

      try {
        const llm = await diagnose(payload);
        if (cancelled) return;

        // 双重保险：即使 LLM 漏了网，lintAction 也会把农药名 / 剂量 /
        // 稀释比例的字段整段换成 "请咨询本地园艺师或农资人员"。
        const { result, report } = lintDiagnosisResult(llm.result);

        const id = newId();
        const saved: SavedDiagnosis = {
          id,
          createdAt: Date.now(),
          nickname: result.plant_name,
          thumb: payload.thumb,
          result,
          calendarChecked: {},
          // gateway 失败走了 mock 兜底 → 结果页须提示"示例诊断"。
          fallbackUsed: llm.provider === 'mock',
        };
        saveDiagnosis(saved);
        bumpStat('analyzed', 1);

        if (report.hits > 0) {
          console.warn('[lintAction] 命中合规字段', report);
        }
        if (llm.fallbackReason) {
          console.warn('[diagnose] gateway fallback', llm.fallbackReason);
        }

        navigate(`/result/${id}`, { replace: true });
      } catch (e) {
        if (cancelled) return;
        setPhase('error');
        setError(e instanceof Error ? e.message : '诊断流程失败，请重试');
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (phase === 'error') {
    return (
      <div className="mx-auto max-w-md rounded-card border border-status-danger/30 bg-status-danger/5 p-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-status-danger" />
        <h2 className="mt-3 font-semibold text-ink">诊断没完成</h2>
        <p className="mt-1 text-sm text-ink-muted">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/capture', { replace: true })}
          className="mt-4 inline-flex rounded-btn bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          回上一步重试
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-card border border-primary/10 bg-bg-paper px-6 py-10 text-center shadow-soft">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-accent" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-ink">AI 正在看你的植物…</h2>
      <p className="mt-1 text-sm text-ink-muted">
        通常 20-40 秒；正在做病害判断 + 生成 30 天护理日历。
      </p>
      <ul className="mt-4 w-full space-y-2 text-left text-xs text-ink-muted">
        <Step ok label="本地压缩图片到 ~200KB" />
        <Step ok label="加密发送到诊断网关" />
        <Step label="模型识别植物 + 病因" />
        <Step label="生成 30 天非药物护理日历" />
        <Step label="合规清洗 + 落库" />
      </ul>
    </div>
  );
}

function Step({ label, ok }: { label: string; ok?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
          ok ? 'bg-primary/15 text-primary' : 'bg-ink-light/20 text-ink-muted'
        }`}
        aria-hidden="true"
      >
        {ok ? '✓' : '·'}
      </span>
      <span>{label}</span>
    </li>
  );
}
