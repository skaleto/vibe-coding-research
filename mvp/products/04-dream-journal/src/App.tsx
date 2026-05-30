import { Routes, Route } from 'react-router-dom';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { FirstLaunchGate } from '@/components/FirstLaunchGate';
import { AntiAddictionGate } from '@/components/AntiAddictionGate';
import HomePage from '@/routes/HomePage';
import AnalyzingPage from '@/routes/AnalyzingPage';
import ResultPage from '@/routes/ResultPage';
import TimelinePage from '@/routes/TimelinePage';
import MonthlyPage from '@/routes/MonthlyPage';
import CrisisPage from '@/routes/CrisisPage';
import AboutPage from '@/routes/AboutPage';

export default function App() {
  return (
    <>
      <DisclaimerBanner />
      <FirstLaunchGate />
      <AntiAddictionGate />
      <main className="mx-auto max-w-2xl px-4 pb-20 pt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyzing" element={<AnalyzingPage />} />
          <Route path="/result/:id" element={<ResultPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/monthly" element={<MonthlyPage />} />
          <Route path="/crisis" element={<CrisisPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </>
  );
}
