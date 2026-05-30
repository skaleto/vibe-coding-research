import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { PosterRenderer } from '@/components/PosterRenderer';
import { PosterActions } from '@/components/PosterActions';
import { loadResult } from '@/lib/storage';
import {
  DISCLAIMER,
  POSTER_STYLES,
  POSTER_STYLE_NAMES,
  type PetCardResult,
  type PosterStyle,
} from '@/lib/types';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<PetCardResult | null>(null);
  const [styleTab, setStyleTab] = useState<PosterStyle>('style1');
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) {
      navigate('/', { replace: true });
      return;
    }
    const r = loadResult(id);
    if (!r) {
      navigate('/', { replace: true });
      return;
    }
    setResult(r);
  }, [id, navigate]);

  const fileName = useMemo(() => {
    if (!result) return 'pet-card';
    return `pet-card-${result.petName}-${styleTab}`;
  }, [result, styleTab]);

  if (!result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-ink-muted">
        正在加载...
      </div>
    );
  }

  return (
    <div className="px-4 pb-6 pt-4">
      <header className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          aria-label="返回"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-soft"
        >
          <ArrowLeft className="h-4 w-4 text-ink-muted" />
        </button>
        <div className="text-sm font-medium text-ink-dark">{result.petName} 的心情</div>
        <Link
          to="/"
          aria-label="再录一次"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-soft"
        >
          <RotateCcw className="h-4 w-4 text-ink-muted" />
        </Link>
      </header>

      {/* 风格 tab */}
      <div className="mt-4 grid grid-cols-3 rounded-btn bg-white p-1 shadow-soft">
        {POSTER_STYLES.map((s) => {
          const active = s === styleTab;
          return (
            <button
              key={s}
              onClick={() => setStyleTab(s)}
              className={`rounded-btn py-1.5 text-xs font-medium transition-colors ${
                active ? 'bg-primary text-white' : 'text-ink-muted'
              }`}
            >
              {POSTER_STYLE_NAMES[s]}
            </button>
          );
        })}
      </div>

      {/* 海报预览 —— 缩放到屏宽 */}
      <div className="mt-4 overflow-hidden rounded-card bg-white p-3 shadow-card">
        <div className="poster-thumb">
          <div
            style={{
              width: 540,
              transformOrigin: 'top left',
              transform: 'scale(calc((100vw - 56px) / 540))',
            }}
          >
            <PosterRenderer ref={posterRef} result={result} style={styleTab} />
          </div>
        </div>
      </div>

      {/* 下载 / 复制 */}
      <div className="mt-4">
        <PosterActions getNode={() => posterRef.current} fileName={fileName} />
      </div>

      {/* 全屏海报入口 */}
      <Link
        to={`/poster/${result.id}/${styleTab}`}
        className="mt-3 block rounded-btn border border-primary/30 bg-white py-2.5 text-center text-sm font-medium text-primary-dark"
      >
        🔍 全屏查看 / 长按保存
      </Link>

      {/* 对白原文 */}
      <section className="mt-5 rounded-card bg-white p-4 shadow-soft">
        <div className="text-xs font-medium text-ink-muted">对白原文</div>
        <div className="mt-2 text-[15px] leading-relaxed text-ink-dark">
          {result.translation.map((line, i) => (
            <div key={i} className="py-1">
              {line}
            </div>
          ))}
        </div>
        <div className="mt-3 text-[11px] text-ink-muted">
          {DISCLAIMER}
        </div>
      </section>

      {/* mood + emoji 装饰 */}
      <div className="mt-4 flex items-center justify-center gap-2 text-2xl">
        {result.emoji_set.map((e, i) => (
          <span key={i}>{e}</span>
        ))}
      </div>
    </div>
  );
}
