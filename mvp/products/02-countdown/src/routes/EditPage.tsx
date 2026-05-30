import { Link, useParams } from 'react-router-dom';
import { useCountdownStore } from '@/lib/store';
import { CountdownForm } from '@/components/CountdownForm';

export default function EditPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const card = useCountdownStore((s) => s.cards.find((c) => c.id === id));
  const hydrated = useCountdownStore((s) => s.hydrated);

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-12 text-center">
        <p className="text-sm opacity-70">加载中…</p>
      </main>
    );
  }

  if (!card) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-12 text-center">
        <h1 className="text-xl font-semibold mb-2">找不到这条倒数日</h1>
        <Link to="/" className="btn btn-primary text-sm">
          返回列表
        </Link>
      </main>
    );
  }

  return <CountdownForm mode="edit" initial={card} />;
}
