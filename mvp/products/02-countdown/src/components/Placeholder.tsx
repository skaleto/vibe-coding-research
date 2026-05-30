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
      className={`flex items-center justify-center bg-stone-100 border-2 border-dashed border-stone-300 rounded-lg text-stone-500 text-sm ${className || ''}`}
      style={{
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
        aspectRatio: aspect,
      }}
    >
      <div className="text-center p-4">
        <div className="opacity-50 text-xs uppercase">Placeholder</div>
        <div className="font-medium mt-1">{caption}</div>
        <div className="text-xs opacity-50 mt-1">id: {kind}</div>
      </div>
    </div>
  );
}
