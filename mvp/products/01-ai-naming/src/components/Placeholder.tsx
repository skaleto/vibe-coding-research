import { useState } from 'react';

/**
 * 通用占位图组件。
 * codex 可以扫描 data-placeholder 属性，根据 caption + spec 生成真实插画/图标。
 * 详见同目录的 codex-todo-illustrations.md。
 */

type PlaceholderProps = {
  kind: string; // 例 "hero-naming"，对应 codex-todo 里的 ID
  width?: number;
  height?: number;
  aspect?: string; // 如 "16/9"
  caption: string; // 占位说明
  spec: string; // 给 codex 看的风格 spec
  className?: string;
};

export function Placeholder({
  kind,
  width,
  height,
  aspect,
  caption,
  spec,
  className,
}: PlaceholderProps) {
  const [imageMissing, setImageMissing] = useState(false);
  const imageSrc = `/placeholders/${kind}.png`;
  const style = {
    width: width ? `${width}px` : undefined,
    height: height ? `${height}px` : undefined,
    aspectRatio: aspect,
  };

  if (!imageMissing) {
    return (
      <img
        src={imageSrc}
        alt={caption}
        data-placeholder={kind}
        data-spec={spec}
        className={`rounded-card object-cover shadow-soft ${className || ''}`}
        style={style}
        onError={() => setImageMissing(true)}
      />
    );
  }

  return (
    <div
      data-placeholder={kind}
      data-spec={spec}
      className={`flex items-center justify-center bg-bg-alt border-2 border-dashed border-primary/40 rounded-card text-ink-muted text-sm ${className || ''}`}
      style={style}
    >
      <div className="text-center p-4 max-w-full">
        <div className="opacity-50 text-xs uppercase tracking-wider">Placeholder</div>
        <div className="font-medium mt-1 text-ink-dark">{caption}</div>
        <div className="text-xs opacity-50 mt-1">id: {kind}</div>
      </div>
    </div>
  );
}
