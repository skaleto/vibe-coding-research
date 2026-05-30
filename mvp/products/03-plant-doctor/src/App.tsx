import { Link, Routes, Route } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import HomePage from '@/routes/HomePage';
import CapturePage from '@/routes/CapturePage';
import DiagnosePage from '@/routes/DiagnosePage';
import ResultPage from '@/routes/ResultPage';
import MyPlantsPage from '@/routes/MyPlantsPage';
import AboutPage from '@/routes/AboutPage';

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-primary/10 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
              <Leaf className="h-4 w-4" />
            </span>
            <span className="font-semibold tracking-wide">植物医生</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-ink-muted">
            <Link to="/my-plants" className="hover:text-primary">
              我的植物
            </Link>
            <Link to="/about" className="hover:text-primary">
              关于
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/capture" element={<CapturePage />} />
          <Route path="/diagnose" element={<DiagnosePage />} />
          <Route path="/result/:id" element={<ResultPage />} />
          <Route path="/my-plants" element={<MyPlantsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <footer className="border-t border-primary/10 bg-bg-paper">
        <div className="mx-auto max-w-3xl px-4 py-4 text-xs text-ink-muted">
          本工具由 AI 提供建议，仅供家庭园艺参考，不替代专业园艺师或农资人员的现场判断。严重病害请带照片咨询本地花卉店、园艺师或农资人员。
        </div>
      </footer>
    </div>
  );
}
