import { useState } from 'react';
import symbolsDb from '@/lib/symbols-db.json';

interface SymbolEntry {
  id: string;
  name: string;
  emoji: string;
  category: string;
  freudian: string;
  jungian: string;
  gestalt: string;
  reflection: string[];
}

interface SymbolsDb {
  symbols: SymbolEntry[];
}

const DB = symbolsDb as unknown as SymbolsDb;

function findSymbol(label: string): SymbolEntry | null {
  // 精确 / 子串匹配
  const lower = label.trim();
  const direct = DB.symbols.find((s) => s.name === lower);
  if (direct) return direct;
  return DB.symbols.find((s) => lower.includes(s.name) || s.name.includes(lower)) ?? null;
}

interface Props {
  symbols: string[];
}

export function SymbolChips({ symbols }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {symbols.map((s, idx) => {
          const matched = findSymbol(s);
          const key = `${idx}-${s}`;
          return (
            <button
              key={key}
              type="button"
              onClick={() => matched && setOpenId(openId === matched.id ? null : matched.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition ${
                matched
                  ? 'border-accent/60 bg-accent/10 text-primary hover:bg-accent/20'
                  : 'border-ink-light/40 text-ink-muted cursor-default'
              }`}
              disabled={!matched}
            >
              <span>{matched?.emoji ?? '✦'}</span>
              <span>{s}</span>
            </button>
          );
        })}
      </div>
      {openId
        ? (() => {
            const entry = DB.symbols.find((s) => s.id === openId);
            if (!entry) return null;
            return (
              <div className="surface-card p-4 text-sm space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{entry.emoji}</span>
                  <h3 className="font-medium text-primary">{entry.name}</h3>
                  <span className="text-xs text-ink-light">{entry.category}</span>
                </div>
                <div className="space-y-2 text-ink leading-relaxed">
                  <p>
                    <span className="text-ink-muted text-xs mr-1">弗洛伊德视角：</span>
                    {entry.freudian}
                  </p>
                  <p>
                    <span className="text-ink-muted text-xs mr-1">荣格视角：</span>
                    {entry.jungian}
                  </p>
                  <p>
                    <span className="text-ink-muted text-xs mr-1">格式塔视角：</span>
                    {entry.gestalt}
                  </p>
                </div>
                <div className="pt-2 border-t border-ink-light/20">
                  <div className="text-xs text-ink-muted mb-1">可以问自己：</div>
                  <ul className="list-disc pl-5 text-ink space-y-1">
                    {entry.reflection.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })()
        : null}
    </div>
  );
}
