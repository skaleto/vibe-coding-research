import { ArrowLeft } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { PosterPreview } from '@/components/PosterPreview';
import type { VerifiedName } from '@/lib/schema';

/**
 * 独立的海报预览页（按 OpenSpec proposal § 2.5 要求）。
 *
 * 结果页已内置 PosterPreview 弹窗，这个路由作为深链入口存在，
 * 接收 query string 中的 name / pinyin / source / quote / explanation 等参数渲染。
 */
export default function PosterPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  if (!id) {
    return (
      <main className="max-w-2xl mx-auto px-5 py-10 text-center space-y-4">
        <h2 className="text-xl font-bold text-ink-dark">海报不存在</h2>
        <Link to="/" className="inline-block px-5 py-2.5 rounded-btn bg-primary text-white">
          返回首页
        </Link>
      </main>
    );
  }

  const name: VerifiedName = {
    full_name: searchParams.get('full_name') ?? '陈知微',
    given_name: searchParams.get('given_name') ?? '知微',
    pinyin_full: searchParams.get('pinyin_full') ?? 'Chén Zhī Wēi',
    pinyin_tones: '2-1-1',
    source_book: searchParams.get('source_book') ?? '诗经',
    source_chapter: searchParams.get('source_chapter') ?? '小雅·节南山',
    original_quote: searchParams.get('original_quote') ?? '知微知章',
    char_meanings: {},
    explanation: searchParams.get('explanation') ?? '示例释义，海报深链测试。',
    style_tag: searchParams.get('style_tag') ?? '温润灵气',
    gender_fit: '女孩',
    stroke_count: 21,
    use_warning: '无',
    verified: true,
  };

  return (
    <main className="max-w-3xl mx-auto px-5 py-8 space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-primary-dark"
      >
        <ArrowLeft size={14} /> 返回首页
      </Link>
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-ink-dark">海报预览 · {name.full_name}</h1>
        <p className="text-sm text-ink-muted">深链 ID: {id}</p>
      </header>
      <PosterPreview name={name} />
    </main>
  );
}
