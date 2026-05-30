import { Link } from 'react-router-dom';
import { Moon, BookOpen, BarChart3, Info } from 'lucide-react';
import { DreamInput } from '@/components/DreamInput';
import { Placeholder } from '@/components/Placeholder';
import { StatBadge } from '@/components/StatBadge';

export default function HomePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="pt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-primary">
            <Moon className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs uppercase tracking-widest text-ink-muted">
              Dream Journal
            </span>
          </div>
          <h1 className="text-2xl font-serif text-primary-dark mt-2">
            让心理学帮你看见自己
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            今晚做了什么梦？
          </p>
        </div>
        <StatBadge
          statKey="recorded"
          prefix="已记录 "
          suffix=" 个梦境"
          className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary shrink-0 mt-1"
        />
      </header>

      <Placeholder
        kind="hero-dream"
        aspect="16/7"
        caption="月亮 / 星空 / 梦境抽象"
        spec="深紫 #3D2C4A + 月白 #F5F1E8 + 金 #D4A574；柔和星云感；占位文案：「今晚，记录一个梦」"
      />

      {/* 移动端数字徽章 */}
      <div className="sm:hidden">
        <StatBadge
          statKey="recorded"
          prefix="已记录 "
          suffix=" 个梦境"
        />
      </div>

      <DreamInput />

      <nav className="grid grid-cols-3 gap-2">
        <Link
          to="/timeline"
          className="surface-card p-3 text-center text-xs text-ink-muted hover:text-primary transition"
        >
          <BookOpen className="w-4 h-4 mx-auto mb-1" aria-hidden="true" />
          时间轴
        </Link>
        <Link
          to="/monthly"
          className="surface-card p-3 text-center text-xs text-ink-muted hover:text-primary transition"
        >
          <BarChart3 className="w-4 h-4 mx-auto mb-1" aria-hidden="true" />
          月度报告
        </Link>
        <Link
          to="/about"
          className="surface-card p-3 text-center text-xs text-ink-muted hover:text-primary transition"
        >
          <Info className="w-4 h-4 mx-auto mb-1" aria-hidden="true" />
          关于
        </Link>
      </nav>

      <footer className="pt-6 text-center text-[11px] text-ink-light leading-relaxed">
        本应用提供心理学知识参考，不替代专业咨询。<br />
        AI 生成内容仅供反思参考。
      </footer>
    </div>
  );
}
