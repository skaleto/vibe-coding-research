import { Routes, Route } from 'react-router-dom';
import { DISCLAIMER } from '@/lib/types';
import HomePage from '@/routes/HomePage';
import RecordingPage from '@/routes/RecordingPage';
import AnalyzingPage from '@/routes/AnalyzingPage';
import ResultPage from '@/routes/ResultPage';
import PosterPage from '@/routes/PosterPage';
import HistoryPage from '@/routes/HistoryPage';
import AboutPage from '@/routes/AboutPage';

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-ink antialiased">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <main className="flex-1 pb-24">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/recording" element={<RecordingPage />} />
            <Route path="/analyzing" element={<AnalyzingPage />} />
            <Route path="/result/:id" element={<ResultPage />} />
            <Route path="/poster/:id/:style" element={<PosterPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <footer className="fixed bottom-0 left-0 right-0 z-30 bg-bg/95 backdrop-blur">
          <div className="mx-auto max-w-md border-t border-ink-light/30 px-4 py-2 text-center text-[11px] leading-tight text-ink-muted">
            {DISCLAIMER}，不承诺真实还原动物语言
          </div>
        </footer>
      </div>
    </div>
  );
}
