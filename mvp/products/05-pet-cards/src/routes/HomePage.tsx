import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, History as HistoryIcon, Info } from 'lucide-react';
import { AudioRecorder, type RecorderResult } from '@/components/AudioRecorder';
import { DualStatBadge } from '@/components/StatBadge';
import { DISCLAIMER, type PetSpecies } from '@/lib/types';
import { generatePetCard } from '@/lib/llm';
import { genId, saveResult } from '@/lib/storage';
import { bumpStat } from '@/lib/stats';
import { pickMockScenario } from '@/lib/mockScenarios';

const SPECIES_OPTIONS: Array<{
  value: PetSpecies;
  emoji: string;
  label: string;
  title: string;
}> = [
  { value: 'cat', emoji: '🐱', label: '猫咪', title: '你家猫到底在喵啥？' },
  { value: 'dog', emoji: '🐶', label: '狗子', title: '狗子在 BB 啥？' },
  { value: 'unknown', emoji: '🐾', label: '其他', title: '宠物在念叨啥？' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [species, setSpecies] = useState<PetSpecies>('cat');
  const [petName, setPetName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentTitle =
    SPECIES_OPTIONS.find((o) => o.value === species)?.title ?? '宠物在念叨啥？';

  const submit = useCallback(
    async (audioDurationSec: number, features: RecorderResult['features']) => {
      const name = petName.trim() || (species === 'dog' ? '狗子' : species === 'cat' ? '猫咪' : '宝贝');
      const id = genId();
      setSubmitting(true);
      setError(null);
      // 跳到 analyzing 页（带 state，避免 reload 丢失）
      navigate('/analyzing', { state: { id } });
      try {
        const llm = await generatePetCard({
          petType: species,
          petName: name,
          audioDurationSec,
          audioFeatures: features,
        });
        const result = {
          ...llm.card,
          id,
          petType: species,
          petName: name,
          audioDurationSec,
          createdAt: Date.now(),
        };
        saveResult(result);
        bumpStat('cardsGenerated', 1);
        navigate(`/result/${id}`, { replace: true });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`生成失败：${msg.slice(0, 80)}`);
        setSubmitting(false);
        navigate('/', { replace: true });
      }
    },
    [navigate, petName, species]
  );

  const onRecorded = useCallback(
    (r: RecorderResult) => {
      void submit(r.durationSec, r.features);
    },
    [submit]
  );

  const onUseSample = useCallback(() => {
    const name = petName.trim() || (species === 'dog' ? '狗子' : species === 'cat' ? '猫咪' : '宝贝');
    const id = genId();
    const card = pickMockScenario(species, name);
    const result = {
      ...card,
      id,
      petType: species,
      petName: name,
      audioDurationSec: 3,
      createdAt: Date.now(),
    };
    saveResult(result);
    bumpStat('cardsGenerated', 1);
    navigate(`/result/${id}`);
  }, [navigate, petName, species]);

  return (
    <div className="px-4 pt-5">
      {/* 顶栏 */}
      <header className="flex items-center justify-between">
        <DualStatBadge />
        <div className="flex items-center gap-2">
          <Link
            to="/history"
            aria-label="历史"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-soft"
          >
            <HistoryIcon className="h-4 w-4 text-ink-muted" />
          </Link>
          <Link
            to="/about"
            aria-label="关于"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-soft"
          >
            <Info className="h-4 w-4 text-ink-muted" />
          </Link>
        </div>
      </header>

      {/* Hero 标题 */}
      <section className="mt-6 text-center">
        <h1 className="text-[26px] font-bold leading-tight text-ink-dark">
          {currentTitle}
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          录段叫声，AI 帮宝宝说出心声
        </p>
      </section>

      {/* Disclaimer banner */}
      <div className="mt-5 rounded-card border border-amber-300 bg-amber-50 px-3 py-2 text-center text-[12px] font-medium text-amber-800">
        <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
        {DISCLAIMER}
      </div>

      {/* 宠物种类选择 */}
      <section className="mt-6">
        <div className="text-xs font-medium text-ink-muted">选个种类</div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {SPECIES_OPTIONS.map((o) => {
            const active = o.value === species;
            return (
              <button
                key={o.value}
                onClick={() => setSpecies(o.value)}
                className={`flex flex-col items-center justify-center rounded-card py-3 text-sm transition-all ${
                  active
                    ? 'bg-primary text-white shadow-bubble'
                    : 'bg-white text-ink shadow-soft'
                }`}
              >
                <span className="text-2xl">{o.emoji}</span>
                <span className="mt-1 font-medium">{o.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 名字输入 */}
      <section className="mt-5">
        <label className="text-xs font-medium text-ink-muted">起个名字（可选）</label>
        <input
          type="text"
          value={petName}
          maxLength={20}
          onChange={(e) => setPetName(e.target.value)}
          placeholder={species === 'cat' ? '比如：奶油 / 布丁' : species === 'dog' ? '比如：豆豆 / 大黄' : '宝贝的小名'}
          className="mt-1.5 w-full rounded-btn border border-ink-light/40 bg-white px-4 py-3 text-base outline-none focus:border-primary"
        />
      </section>

      {/* 录音按钮 */}
      <section className="mt-7">
        <AudioRecorder onResult={onRecorded} disabled={submitting} />
      </section>

      {error ? (
        <div className="mt-3 text-center text-xs text-tomato-dark">{error}</div>
      ) : null}

      {/* 备用：示例数据 */}
      <div className="mt-5 text-center">
        <button
          onClick={onUseSample}
          className="text-xs text-ink-muted underline underline-offset-2"
        >
          先用示例数据看效果 →
        </button>
      </div>
    </div>
  );
}
