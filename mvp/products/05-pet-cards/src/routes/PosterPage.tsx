import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PosterRenderer } from '@/components/PosterRenderer';
import { PosterActions } from '@/components/PosterActions';
import { loadResult } from '@/lib/storage';
import { POSTER_STYLES, type PetCardResult, type PosterStyle } from '@/lib/types';

function isValidStyle(s: string | undefined): s is PosterStyle {
  return !!s && (POSTER_STYLES as readonly string[]).includes(s);
}

export default function PosterPage() {
  const { id, style } = useParams<{ id: string; style: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<PetCardResult | null>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !isValidStyle(style)) {
      navigate('/', { replace: true });
      return;
    }
    const r = loadResult(id);
    if (!r) {
      navigate('/', { replace: true });
      return;
    }
    setResult(r);
  }, [id, style, navigate]);

  if (!result || !isValidStyle(style)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-ink-muted">
        正在加载...
      </div>
    );
  }

  const fileName = `pet-card-${result.petName}-${style}`;

  return (
    <div className="flex min-h-screen flex-col bg-ink-dark/95 px-4 pt-3 pb-32 text-white">
      {/* 顶部操作栏 */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-ink-dark/95 py-2 backdrop-blur">
        <button
          onClick={() => navigate(`/result/${id}`)}
          aria-label="返回结果"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </button>
        <div className="text-sm font-medium text-white/90">长按保存到相册</div>
        <span className="h-9 w-9" />
      </header>

      {/* 全屏海报 —— 居中缩放至屏宽 */}
      <div className="mt-3 flex flex-1 items-start justify-center">
        <div
          style={{
            width: 540,
            transformOrigin: 'top center',
            transform: 'scale(calc((100vw - 32px) / 540))',
          }}
        >
          <PosterRenderer ref={posterRef} result={result} style={style} />
        </div>
      </div>

      {/* 固定底部：下载 / 复制 */}
      <div className="fixed bottom-16 left-0 right-0 z-20 px-4">
        <div className="mx-auto max-w-md rounded-card bg-white/95 p-3 shadow-card">
          <PosterActions getNode={() => posterRef.current} fileName={fileName} />
        </div>
      </div>
    </div>
  );
}
