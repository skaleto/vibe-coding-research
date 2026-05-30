type PlaceholderProps = {
  /** 对应 codex-todo 的 ID */
  kind: string;
  width?: number;
  height?: number;
  aspect?: string;
  caption: string;
  spec: string;
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
  return (
    <div
      data-placeholder={kind}
      data-spec={spec}
      className={`flex items-center justify-center bg-bg-alt/60 border-2 border-dashed border-ink-light/40 rounded-card text-ink-muted text-sm ${className ?? ''}`}
      style={{
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
        aspectRatio: aspect,
      }}
    >
      <div className="text-center p-4">
        <div className="opacity-50 text-xs uppercase tracking-wider">Placeholder</div>
        <div className="font-medium mt-1 text-ink">{caption}</div>
        <div className="text-xs opacity-50 mt-1 font-mono">id: {kind}</div>
      </div>
    </div>
  );
}
