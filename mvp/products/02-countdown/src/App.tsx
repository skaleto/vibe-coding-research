import { Routes, Route } from 'react-router-dom';
import { ThemeRoot } from '@/components/ThemeRoot';
import ListPage from '@/routes/ListPage';
import NewPage from '@/routes/NewPage';
import DetailPage from '@/routes/DetailPage';
import EditPage from '@/routes/EditPage';
import SettingsPage from '@/routes/SettingsPage';

export default function App() {
  return (
    <ThemeRoot>
      <Routes>
        <Route path="/" element={<ListPage />} />
        <Route path="/new" element={<NewPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/:id" element={<DetailPage />} />
        <Route path="/:id/edit" element={<EditPage />} />
      </Routes>
    </ThemeRoot>
  );
}
