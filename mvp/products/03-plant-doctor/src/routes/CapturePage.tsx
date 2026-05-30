import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sprout } from 'lucide-react';

import { ImageCapture } from '@/components/ImageCapture';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import type { CompressedImage } from '@/lib/imageCompress';

interface DraftForm {
  waterFreq: string;
  light: string;
  soil: string;
  description: string;
  plantSelfReport: string;
  city: string;
}

const EMPTY_FORM: DraftForm = {
  waterFreq: '',
  light: '',
  soil: '',
  description: '',
  plantSelfReport: '',
  city: '',
};

const PENDING_REQUEST_KEY = 'plant-doctor/pending-request';

/**
 * CapturePage —— "/capture"。
 *
 * 用户上传 1-3 张图片 + 必填浇水频率，可选光照/土壤/描述/植物名/所在地。
 * 点击"开始诊断" → 把请求 payload 写入 localStorage → 跳 /diagnose 处理。
 */
export default function CapturePage() {
  const navigate = useNavigate();
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [form, setForm] = useState<DraftForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = images.length >= 1 && form.waterFreq.trim().length > 0 && !submitting;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload = {
        images: images.map((i) => i.dataUrl),
        thumb: images[0]?.dataUrl ?? '',
        waterFreq: form.waterFreq.trim() || undefined,
        light: form.light.trim() || undefined,
        soil: form.soil.trim() || undefined,
        description: form.description.trim() || undefined,
        plantSelfReport: form.plantSelfReport.trim() || undefined,
        city: form.city.trim() || undefined,
      };
      window.localStorage.setItem(PENDING_REQUEST_KEY, JSON.stringify(payload));
      navigate('/diagnose');
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-[0.3em] text-ink-muted">
          step 1 / 2
        </div>
        <h1 className="mt-1 text-2xl font-bold text-ink">拍叶子 + 填几个小问题</h1>
        <p className="mt-1 text-sm text-ink-muted">
          建议 3 张图：叶子特写 / 全株 / 环境（盆土）。图片在本地压缩后发往诊断网关，
          不会上传原图 EXIF / GPS。
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-card border border-primary/10 bg-bg-paper p-4">
          <ImageCapture images={images} onChange={setImages} />
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <Field
            label="浇水频率"
            required
            placeholder="如：每周 2 次 / 凭手感 / 不记得了"
            value={form.waterFreq}
            onChange={(v) => setForm({ ...form, waterFreq: v })}
          />
          <Field
            label="光照条件"
            placeholder="全日照 / 散射光 / 室内补光灯 / 阴暗角落"
            value={form.light}
            onChange={(v) => setForm({ ...form, light: v })}
          />
          <Field
            label="土壤类型"
            placeholder="普通营养土 / 多肉颗粒土 / 自配土 / 不知道"
            value={form.soil}
            onChange={(v) => setForm({ ...form, soil: v })}
          />
          <Field
            label="你猜这是什么植物"
            placeholder="可选 —— 不确定可留空"
            value={form.plantSelfReport}
            onChange={(v) => setForm({ ...form, plantSelfReport: v })}
          />
          <Field
            label="所在地（城市）"
            placeholder="可选 —— 帮助节气判断"
            value={form.city}
            onChange={(v) => setForm({ ...form, city: v })}
          />
          <Field
            label="文字补充"
            placeholder="如：最近 2 周换了位置，叶子开始发软"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            asTextarea
          />
        </section>

        <DisclaimerBanner />

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center gap-2 rounded-btn bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft transition disabled:opacity-50"
        >
          <Sprout className="h-4 w-4" />
          {submitting ? '正在打包请求…' : '开始 AI 诊断'}
          <ArrowRight className="h-4 w-4" />
        </button>

        {!canSubmit && !submitting && (
          <p className="text-xs text-ink-muted">
            至少上传 1 张图片并填写浇水频率，才能开始诊断。
          </p>
        )}
      </form>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  asTextarea?: boolean;
}

function Field({ label, value, onChange, placeholder, required, asTextarea }: FieldProps) {
  const className =
    'mt-1 w-full rounded-btn border border-primary/15 bg-white px-3 py-2 text-sm text-ink shadow-inner focus:border-primary focus:outline-none';
  return (
    <label className="block text-sm">
      <span className="text-ink-muted">
        {label}
        {required && <span className="ml-1 text-status-danger">*</span>}
      </span>
      {asTextarea ? (
        <textarea
          rows={3}
          className={className}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          className={className}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
