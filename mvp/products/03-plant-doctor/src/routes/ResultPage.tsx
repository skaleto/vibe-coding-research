import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Camera, Leaf, Save, ShieldAlert } from 'lucide-react';

import { CareCalendar } from '@/components/CareCalendar';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import {
  getDiagnosis,
  saveDiagnosis,
  toggleCalendarDay,
  type SavedDiagnosis,
} from '@/lib/store';
import { isEdible } from '@/lib/schema';
import { lintDiagnosisResult } from '@/lib/lintAction';

const SEV_COLOR: Record<string, string> = {
  轻: 'bg-status-ok/15 text-status-ok',
  中: 'bg-status-warn/15 text-status-warn',
  重: 'bg-status-danger/15 text-status-danger',
};

const OUTLOOK_COLOR: Record<string, string> = {
  高: 'text-status-ok',
  中: 'text-accent-dark',
  低: 'text-status-danger',
};

/**
 * ResultPage —— "/result/:id"。
 *
 * 即使诊断已被 lintDiagnosisResult 清洗过，这里再 run 一次（防止 localStorage
 * 里残留旧版本的"未洗"诊断）。是 codex compliance-checklist 要求的双重保险。
 */
export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<SavedDiagnosis | null>(null);
  const [nickEdit, setNickEdit] = useState('');

  useEffect(() => {
    if (!id) return;
    const r = getDiagnosis(id);
    if (!r) {
      navigate('/my-plants', { replace: true });
      return;
    }
    setRecord(r);
    setNickEdit(r.nickname ?? r.result.plant_name);
  }, [id, navigate]);

  // 二次清洗：render-time safety belt（codex 强制要求 of compliance-checklist § 3.B）。
  const cleaned = useMemo(() => {
    if (!record) return null;
    const { result, report } = lintDiagnosisResult(record.result);
    if (report.hits > 0) {
      console.warn('[result] 二次清洗命中合规字段', report);
    }
    return result;
  }, [record]);

  if (!record || !cleaned) {
    return <div className="py-10 text-center text-sm text-ink-muted">读取诊断…</div>;
  }

  const top = cleaned.diagnosis[0];
  const edible = isEdible(cleaned.plant_name);

  function handleSaveNickname() {
    if (!record) return;
    const next: SavedDiagnosis = { ...record, nickname: nickEdit.trim() || record.result.plant_name };
    saveDiagnosis(next);
    setRecord(next);
  }

  function handleToggle(day: number) {
    if (!record) return;
    toggleCalendarDay(record.id, day);
    const fresh = getDiagnosis(record.id);
    if (fresh) setRecord(fresh);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/my-plants" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          我的植物
        </Link>
        <Link
          to="/capture"
          className="inline-flex items-center gap-1 rounded-btn bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent-dark hover:bg-accent/25"
        >
          <Camera className="h-3.5 w-3.5" />
          再来一次诊断
        </Link>
      </header>

      {record.fallbackUsed && (
        <div className="flex items-start gap-2 rounded-card border border-status-warn/40 bg-status-warn/10 px-4 py-3 text-sm text-ink">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-status-warn" />
          <div>
            <div className="font-medium text-status-warn">网络异常，以下为示例诊断</div>
            <div className="mt-1 text-xs text-ink-muted">
              未能连上诊断网关，下面展示的是一份示例结果，并非对你照片的真实分析。请检查网络后
              <Link to="/capture" className="font-medium text-primary hover:underline">补图重试</Link>
              ，或带照片咨询本地园艺师。
            </div>
          </div>
        </div>
      )}

      <section className="rounded-card border border-primary/10 bg-bg-paper p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-ink-muted">
              诊断结果 · {new Date(record.createdAt).toLocaleString('zh-CN')}
            </div>
            <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-ink">
              <Leaf className="h-5 w-5 text-primary" />
              {cleaned.plant_name || '未识别植物'}
            </h1>
            {cleaned.scientific_name && (
              <p className="mt-1 text-xs italic text-ink-muted">{cleaned.scientific_name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={nickEdit}
              onChange={(e) => setNickEdit(e.target.value)}
              placeholder="给它起个昵称"
              className="rounded-btn border border-primary/15 bg-white px-3 py-1.5 text-sm shadow-inner focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSaveNickname}
              className="inline-flex items-center gap-1 rounded-btn bg-primary px-3 py-1.5 text-xs font-medium text-white"
            >
              <Save className="h-3.5 w-3.5" /> 保存
            </button>
          </div>
        </div>

        {!cleaned.image_quality_ok && (
          <div className="mt-4 flex items-start gap-2 rounded-btn bg-status-warn/10 px-3 py-2 text-xs text-status-warn">
            <ShieldAlert className="mt-0.5 h-4 w-4" />
            <div>{cleaned.image_quality_feedback || '图片质量不足以做出准确诊断，建议补图重试。'}</div>
          </div>
        )}

        {top && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat
              label="最可能病因"
              value={top.cause}
              sub={`可能性 · ${top.likelihood}`}
            />
            <Stat
              label="严重程度"
              value={top.severity}
              valueClass={`inline-block rounded-btn px-2 py-0.5 ${SEV_COLOR[top.severity] ?? ''}`}
            />
            <Stat
              label="恢复展望"
              value={cleaned.prognosis.recovery_outlook}
              valueClass={`font-bold ${OUTLOOK_COLOR[cleaned.prognosis.recovery_outlook] ?? ''}`}
              sub={`观察 ${cleaned.prognosis.time_to_observe}`}
            />
          </div>
        )}
      </section>

      <DisclaimerBanner edible={edible} />

      {cleaned.diagnosis.length > 0 && (
        <section className="rounded-card border border-primary/10 bg-bg-paper p-5">
          <h2 className="font-semibold text-ink">三段诊断假设</h2>
          <ul className="mt-3 space-y-3">
            {cleaned.diagnosis.map((d, i) => (
              <li key={i} className="rounded-btn border border-primary/10 bg-white p-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-ink">{d.cause}</span>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary">
                    可能性 {d.likelihood}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] ${SEV_COLOR[d.severity] ?? ''}`}
                  >
                    严重 {d.severity}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-muted">{d.evidence}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {cleaned.action_steps.length > 0 && (
        <section className="rounded-card border border-primary/10 bg-bg-paper p-5">
          <h2 className="font-semibold text-ink">立即可做（非药物）</h2>
          <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-ink">
            {cleaned.action_steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-ink-muted">
            兜底建议：{cleaned.prognosis.fallback_if_fail}
          </p>
        </section>
      )}

      {cleaned.calendar_30d.length > 0 && (
        <section className="rounded-card border border-primary/10 bg-bg-paper p-5">
          <h2 className="font-semibold text-ink">30 天护理日历</h2>
          <p className="mt-1 text-xs text-ink-muted">
            勾选完成项；日历仅供参考，环境/季节差异较大时请按实际情况调整。
          </p>
          <div className="mt-4">
            <CareCalendar
              days={cleaned.calendar_30d}
              checked={record.calendarChecked}
              onToggle={handleToggle}
            />
          </div>
        </section>
      )}

      <p className="rounded-btn bg-bg-alt px-4 py-3 text-xs text-ink-muted">{cleaned.disclaimer}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  valueClass,
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-btn border border-primary/10 bg-white p-3">
      <div className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</div>
      <div className={`mt-1 text-sm text-ink ${valueClass ?? ''}`}>{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-ink-muted">{sub}</div>}
    </div>
  );
}
