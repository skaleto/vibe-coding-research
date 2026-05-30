type PlaceholderProps = {
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
      className={`flex items-center justify-center rounded-lg border-2 border-dashed border-primary/30 bg-bg-alt text-sm text-ink-muted ${
        className || ''
      }`}
      style={{
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
        aspectRatio: aspect,
      }}
    >
      <div className="p-4 text-center">
        <div className="text-xs uppercase opacity-50">Placeholder</div>
        <div className="mt-1 font-medium">{caption}</div>
        <div className="mt-1 text-xs opacity-50">id: {kind}</div>
      </div>
    </div>
  );
}
