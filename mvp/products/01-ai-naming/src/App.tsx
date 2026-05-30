import { Routes, Route } from 'react-router-dom';
import HomePage from '@/routes/HomePage';
import NamingFormPage from '@/routes/NamingFormPage';
import ResultPage from '@/routes/ResultPage';
import PosterPage from '@/routes/PosterPage';
import PricingPage from '@/routes/PricingPage';

export default function App() {
  return (
    <div className="min-h-dvh">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/poster/:id" element={<PosterPage />} />
        <Route path="/:type/result" element={<ResultPage />} />
        <Route path="/:type" element={<NamingFormPage />} />
      </Routes>
      <footer className="text-xs text-ink-muted/70 text-center py-4 border-t border-primary/10 mt-12">
        <p>本产品 MVP 阶段，付费链路与真实 LLM 调用均可走 mock fallback。</p>
        <p className="mt-1">
          所有 AI 生成内容仅供参考，正式起名建议家中长辈复核。© 2026 · AI Naming MVP
        </p>
      </footer>
    </div>
  );
}
