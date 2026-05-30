interface MultilineProps {
  text: string;
  className?: string;
  /** 是否以「· 」作为每行项目符号（适合工作/项目业绩） */
  bullet?: boolean;
}

/**
 * 把多行文本按 \n 拆分渲染。空文本返回 null。
 * 模板组件复用，避免各处重复 split 逻辑。
 */
export function Multiline({ text, className, bullet = false }: MultilineProps) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <div className={className}>
      {lines.map((line, i) => (
        <div key={i} className={bullet ? 'flex gap-1.5' : undefined}>
          {bullet && <span className="select-none opacity-60">·</span>}
          <span>{line}</span>
        </div>
      ))}
    </div>
  );
}
