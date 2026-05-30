import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Placeholder } from '@/components/Placeholder';
import { StatBadge } from '@/components/StatBadge';
import { PRODUCT_ORDER, PRODUCTS } from '@/lib/productTypes';

export default function HomePage() {
  return (
    <main className="max-w-5xl mx-auto px-5 sm:px-8 py-6 sm:py-10 space-y-10">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
            <BookOpen size={18} className="text-primary-dark" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-ink-dark">诗经起名</h1>
            <p className="text-[10px] text-ink-muted">AI · MVP</p>
          </div>
        </div>
        <StatBadge
          statKey="generated"
          prefix="已生成 "
          suffix=" 个通过 verify_quote 校验的名字"
          className="hidden sm:inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent-dark"
        />
      </header>

      <section className="relative rounded-card bg-gradient-to-br from-bg-paper to-bg-alt p-6 sm:p-10 border border-primary/15 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary-dark text-xs">
              <Sparkles size={12} /> 3 秒 · 10 个候选 · 真实诗经古籍出处
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-ink-dark leading-tight">
              再也不用查
              <br />
              《起名大全》
            </h2>
            <p className="text-sm text-ink leading-relaxed max-w-md">
              交给 AI 起一个有出处的名字 —— 每个候选都能在《诗经》《楚辞》《唐诗》原文里查到。
            </p>
            <div className="sm:hidden">
              <StatBadge
                statKey="generated"
                prefix="已生成 "
                suffix=" 个通过校验的名字"
              />
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                to="/baby"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-btn bg-accent text-white hover:bg-accent-dark shadow-soft"
              >
                免费起一个 <ArrowRight size={16} />
              </Link>
              <a
                href="#products"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-btn border border-primary/30 text-ink hover:bg-bg-alt"
              >
                看 5 个子产品
              </a>
            </div>
          </div>
          <Placeholder
            kind="hero-naming"
            aspect="4/3"
            caption="首页 hero 水墨插画"
            spec="毛笔在宣纸上书写'名'字 + 远山 + 兰花 + 暖琥珀色调（米色背景），1600x1200"
            className="w-full max-h-72"
          />
        </div>
      </section>

      <section id="products" className="space-y-3">
        <h3 className="text-lg font-bold text-ink-dark">5 个场景 · 同一工具</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRODUCT_ORDER.map((type) => {
            const product = PRODUCTS[type];
            return (
              <Link
                key={type}
                to={`/${type}`}
                className={`group rounded-card p-4 border bg-white hover:border-primary hover:shadow-card transition-all flex flex-col gap-3 ${
                  type === 'baby' ? 'border-primary md:col-span-2 lg:col-span-1' : 'border-primary/15'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-bg-alt flex items-center justify-center text-2xl">
                    {product.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-ink-dark">{product.title}</h4>
                      {type === 'baby' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-white">
                          MVP 主力
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted line-clamp-2 mt-0.5">
                      {product.description}
                    </p>
                  </div>
                </div>
                <Placeholder
                  kind={product.iconId}
                  aspect="3/2"
                  caption={product.iconCaption}
                  spec={product.iconSpec}
                  className="h-24"
                />
                <div className="text-xs text-primary-dark font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  开始起名 <ArrowRight size={12} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
