import { ArrowLeft, ImageIcon, RefreshCw, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { Loading } from '@/components/Loading';
import { MockPaymentDialog } from '@/components/MockPaymentDialog';
import { NameCard } from '@/components/NameCard';
import { PosterPreview } from '@/components/PosterPreview';
import { PricingModal } from '@/components/PricingModal';
import { callGenerateNames } from '@/lib/llm';
import { PRODUCTS } from '@/lib/productTypes';
import {
  NamingTypeSchema,
  type GenerateNamesResponse,
  type NamingType,
  type VerifiedName,
} from '@/lib/schema';
import { bumpStat } from '@/lib/stats';

const FREE_VIEWABLE = 3;

function humanizeWarning(w: string): string {
  if (w === 'no_api_key') return '未配置 LLM API key，已使用 mock 数据。';
  if (w === 'fallback_to_mock') return 'LLM 解析失败，已降级到 mock 数据。';
  if (w === 'supplemented_with_mock') return '校验通过的名字不足 5 个，已用 mock 补齐。';
  if (w.startsWith('deepseek_failed')) return 'DeepSeek 调用失败，已降级到 mock 数据。';
  if (w.startsWith('openai_failed')) return 'OpenAI 调用失败，已降级到 mock 数据。';
  if (w.startsWith('zhipu_failed')) return '智谱调用失败，已降级到 mock 数据。';
  if (w.startsWith('gateway_')) return '网关返回异常，已降级到本地 mock 数据。';
  return w;
}

export default function ResultPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const parsed = NamingTypeSchema.safeParse(params.type);

  if (!parsed.success) {
    return (
      <main className="max-w-2xl mx-auto px-5 py-10 text-center space-y-4">
        <h2 className="text-xl font-bold text-ink-dark">页面不存在</h2>
        <p className="text-sm text-ink-muted">未知的起名类型：{params.type}</p>
        <Link to="/" className="inline-block px-5 py-2.5 rounded-btn bg-primary text-white">
          返回首页
        </Link>
      </main>
    );
  }

  const type: NamingType = parsed.data;
  const surname = searchParams.get('surname') ?? (type === 'baby' ? '陈' : '·');
  const gender = (searchParams.get('gender') as '男孩' | '女孩') ?? '女孩';
  const vibeTags = useMemo(
    () => (searchParams.get('vibe_tags')?.split(',').filter(Boolean) ?? ['温润灵气']),
    [searchParams],
  );
  const sourcePreference = searchParams.get('source_preference') ?? '不限';
  const taboo = searchParams.get('taboo') ?? '';

  const product = PRODUCTS[type];
  const [data, setData] = useState<GenerateNamesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [paymentSku, setPaymentSku] = useState<'18' | '68' | '198' | null>(null);
  const [posterFor, setPosterFor] = useState<VerifiedName | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const fetchNames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await callGenerateNames({
        type,
        surname,
        gender,
        vibe_tags: vibeTags,
        source_preference: sourcePreference as never,
        taboo,
      });
      setData(json);
      const generatedThisRound = json.meta?.verified_count ?? json.names.length;
      if (generatedThisRound > 0) bumpStat('generated', generatedThisRound);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[fetch] failed', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [type, surname, gender, vibeTags, sourcePreference, taboo, retryKey]);

  useEffect(() => {
    fetchNames();
  }, [fetchNames]);

  const verifiedCount = data?.meta.verified_count ?? 0;

  const handleSelectTier = (sku: '18' | '68' | '198') => {
    setPaymentSku(sku);
    setPricingOpen(false);
    setUnlocked(true);
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-5 py-8">
        <header className="flex items-center gap-3 mb-6">
          <Link
            to={`/${type}`}
            className="text-sm text-ink-muted hover:text-primary-dark inline-flex items-center gap-1"
          >
            <ArrowLeft size={14} /> 修改信息
          </Link>
        </header>
        <Loading />
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-2xl mx-auto px-5 py-10 text-center space-y-4">
        <h2 className="text-xl font-bold text-ink-dark">生成失败</h2>
        <p className="text-sm text-orange-700">{error}</p>
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={() => setRetryKey((k) => k + 1)}
            className="px-5 py-2.5 rounded-btn bg-primary text-white hover:bg-primary-dark"
          >
            重试
          </button>
          <Link
            to={`/${type}`}
            className="px-5 py-2.5 rounded-btn border border-primary/30 text-ink hover:bg-bg-alt"
          >
            返回修改
          </Link>
        </div>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="max-w-3xl mx-auto px-5 py-6 sm:py-8 space-y-6 pb-32">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/${type}`}
          className="text-sm text-ink-muted hover:text-primary-dark inline-flex items-center gap-1"
        >
          <ArrowLeft size={14} /> 修改信息
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRetryKey((k) => k + 1)}
            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-btn border border-primary/30 hover:bg-bg-alt"
          >
            <RefreshCw size={12} /> 重新生成
          </button>
        </div>
      </header>

      <section className="rounded-card bg-white border border-primary/15 p-4 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-lg sm:text-xl font-bold text-ink-dark">
            为 <span className="text-primary-dark">{surname}</span>
            {type === 'baby' ? '宝宝' : ''} 起的 {data.names.length} 个名字
          </h1>
          <div className="text-xs text-ink-muted">
            {vibeTags.join(' · ')} · {gender} · {product.shortTitle}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary-dark">
            <ShieldCheck size={12} /> 校验通过 {verifiedCount}/{data.names.length}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-bg-alt text-ink-muted">
            <Sparkles size={12} />
            {data.provider === 'mock' ? 'Mock fallback' : `Provider: ${data.provider}`}
          </span>
          {data.meta.filtered_count > 0 && (
            <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700">
              过滤了 {data.meta.filtered_count} 个网红/不吉字名
            </span>
          )}
          <span className="px-2 py-1 rounded-full bg-bg-alt text-ink-muted">
            典故库 v{data.meta.db_version}
          </span>
        </div>
        {data.warning && (
          <p className="text-[11px] text-orange-700/80">
            ⚠ {humanizeWarning(data.warning)}
          </p>
        )}
        {!unlocked && (
          <p className="text-xs text-ink-muted">
            ✨ 已为您生成 {data.names.length} 个名字，免费查看前 {FREE_VIEWABLE} 个，付费 ¥68 解锁全部。
          </p>
        )}
      </section>

      <section className="space-y-4">
        {data.names.map((name, idx) => (
          <NameCard
            key={`${name.full_name}-${idx}`}
            name={name}
            index={idx}
            locked={!unlocked && idx >= FREE_VIEWABLE}
            onUnlock={() => setPricingOpen(true)}
            onMakePoster={() => setPosterFor(name)}
          />
        ))}
      </section>

      {posterFor && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-card max-w-2xl w-full max-h-[92dvh] overflow-y-auto shadow-card">
            <div className="sticky top-0 bg-white border-b border-primary/10 px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <ImageIcon size={16} className="text-primary-dark" />
                生成「{posterFor.full_name}」海报
              </h3>
              <button
                type="button"
                onClick={() => setPosterFor(null)}
                className="p-1.5 rounded-full hover:bg-bg-alt"
                aria-label="关闭"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5">
              <PosterPreview name={posterFor} />
            </div>
          </div>
        </div>
      )}

      {!unlocked && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-primary/15 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-ink-dark line-clamp-1">
              解锁全部 {data.names.length} 个 + 海报 + 终身查询
            </div>
            <div className="text-xs text-ink-muted">
              限时 <span className="text-accent font-bold">¥68</span>{' '}
              <span className="line-through ml-1">¥198</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPricingOpen(true)}
            className="px-5 py-2.5 rounded-btn bg-accent text-white font-medium hover:bg-accent-dark"
          >
            立即解锁
          </button>
        </div>
      )}

      <PricingModal
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        onSelectTier={handleSelectTier}
      />
      <MockPaymentDialog
        open={!!paymentSku}
        sku={paymentSku}
        onClose={() => setPaymentSku(null)}
      />
    </main>
  );
}
