import { AlertTriangle, BookOpen, Copy, Heart, Image as ImageIcon, Share2 } from 'lucide-react';
import { useState } from 'react';

import type { VerifiedName } from '@/lib/schema';

type NameCardProps = {
  name: VerifiedName;
  index: number;
  locked?: boolean;
  onUnlock?: () => void;
  onMakePoster?: () => void;
};

export function NameCard({ name, index, locked = false, onUnlock, onMakePoster }: NameCardProps) {
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${name.full_name} ${name.pinyin_full}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <article className="relative rounded-card bg-white shadow-soft p-5 border border-primary/15 overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className={`flex items-baseline gap-3 ${locked ? 'blur-locked' : ''}`}>
            <h3 className="text-3xl font-serif font-bold text-ink-dark tracking-wider">
              {name.full_name}
            </h3>
            <span className="text-sm text-ink-muted font-serif italic">
              {name.pinyin_full}
            </span>
          </div>
          <div className={`mt-2 flex flex-wrap items-center gap-2 text-xs ${locked ? 'blur-locked' : ''}`}>
            <span className="inline-flex items-center gap-1 text-primary-dark">
              <BookOpen size={12} />
              《{name.source_book}·{name.source_chapter}》
            </span>
            <span className="px-2 py-0.5 rounded-full bg-bg-alt text-ink-muted">
              {name.style_tag}
            </span>
            <span className="text-ink-muted">{name.gender_fit}</span>
          </div>
        </div>
        <div className="text-xs text-ink-muted shrink-0">#{index + 1}</div>
      </div>

      {!locked && (
        <>
          {/* 校验警告 */}
          {!name.verified && (
            <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-700">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">出处待人工核验</span>：未在本地典故白名单中匹配到该引文。{name.verify_reason}
              </div>
            </div>
          )}
          {/* 软黑名单警告 */}
          {name.warning_chars && name.warning_chars.length > 0 && (
            <div className="mt-2 text-xs text-orange-600">
              ⚠ 含网红字 {name.warning_chars.join('、')}，2020-2025 出生宝宝中重名率较高。
            </div>
          )}

          {/* 原文 */}
          <blockquote className="mt-3 p-3 rounded-lg bg-bg-alt border-l-2 border-primary text-sm text-ink font-serif italic">
            「{name.original_quote}」
          </blockquote>

          {/* 单字释义 */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(name.char_meanings).map(([ch, meaning]) => (
              <div key={ch} className="flex gap-2 text-sm">
                <span className="font-serif font-bold text-primary-dark w-6 shrink-0">{ch}</span>
                <span className="text-ink">{meaning}</span>
              </div>
            ))}
          </div>

          {/* 释义 */}
          <p
            className={`mt-3 text-sm text-ink leading-7 ${expanded ? '' : 'line-clamp-4'} whitespace-pre-line`}
          >
            {name.explanation}
          </p>
          {name.explanation.length > 120 && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="mt-1 text-xs text-primary-dark hover:underline"
            >
              {expanded ? '收起' : '展开释义'}
            </button>
          )}

          {/* 操作按钮 */}
          <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-primary/10">
            <button
              type="button"
              onClick={() => setFavorited((f) => !f)}
              className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-btn border ${
                favorited
                  ? 'border-primary bg-primary/10 text-primary-dark'
                  : 'border-ink-muted/30 text-ink-muted hover:border-primary'
              }`}
            >
              <Heart size={12} fill={favorited ? 'currentColor' : 'none'} />
              {favorited ? '已收藏' : '收藏'}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-btn border border-ink-muted/30 text-ink-muted hover:border-primary"
            >
              <Copy size={12} />
              {copied ? '已复制' : '复制'}
            </button>
            <button
              type="button"
              onClick={onMakePoster}
              disabled={!name.verified}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-btn border border-primary bg-primary/10 text-primary-dark hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
              title={name.verified ? '生成海报' : '校验未通过，无法生成海报'}
            >
              <ImageIcon size={12} />
              生成海报
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-btn border border-ink-muted/30 text-ink-muted hover:border-primary"
            >
              <Share2 size={12} />
              分享
            </button>
          </div>
        </>
      )}

      {/* 付费遮罩 */}
      {locked && (
        <div className="mt-4 flex flex-col items-center justify-center gap-3 py-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-card border border-primary/20">
          <div className="text-sm text-ink-muted">🔒 解锁查看完整名字与详细释义</div>
          <button
            type="button"
            onClick={onUnlock}
            className="px-5 py-2 rounded-btn bg-accent text-white text-sm hover:bg-accent-dark"
          >
            💎 ¥68 解锁全部 10 个
          </button>
        </div>
      )}
    </article>
  );
}
