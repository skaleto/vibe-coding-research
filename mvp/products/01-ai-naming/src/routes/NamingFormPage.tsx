import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { PRODUCTS } from '@/lib/productTypes';
import { NamingTypeSchema, type NamingType } from '@/lib/schema';

export default function NamingFormPage() {
  const params = useParams();
  const navigate = useNavigate();

  const parsed = NamingTypeSchema.safeParse(params.type);
  if (!parsed.success) {
    return (
      <main className="max-w-2xl mx-auto px-5 py-10 text-center space-y-4">
        <h2 className="text-xl font-bold text-ink-dark">页面不存在</h2>
        <p className="text-sm text-ink-muted">未知的起名类型：{params.type}</p>
        <Link to="/" className="inline-block px-5 py-2.5 rounded-btn bg-primary text-white">
          返回首页
        </Link>
      </main>
    );
  }

  const type: NamingType = parsed.data;
  const product = PRODUCTS[type];

  const [surname, setSurname] = useState('');
  const [gender, setGender] = useState<'男孩' | '女孩'>('女孩');
  const [vibeTags, setVibeTags] = useState<string[]>([]);
  const [sourcePref, setSourcePref] = useState<string>('不限');
  const [taboo, setTaboo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const toggleVibe = (v: string) => {
    setVibeTags((prev) => {
      if (prev.includes(v)) return prev.filter((x) => x !== v);
      if (prev.length >= 3) {
        setError('最多选择 3 个意境标签');
        return prev;
      }
      setError(null);
      return [...prev, v];
    });
  };

  const handleSubmit = () => {
    if (!surname.trim() && type === 'baby') {
      setError('请填写宝宝的姓氏');
      return;
    }
    if (vibeTags.length === 0) {
      setError('请至少选择 1 个意境标签');
      return;
    }
    setError(null);
    const search = new URLSearchParams({
      surname: surname.trim() || (type === 'baby' ? '陈' : '·'),
      gender,
      vibe_tags: vibeTags.join(','),
      source_preference: sourcePref,
      taboo,
    });
    navigate(`/${type}/result?${search.toString()}`);
  };

  return (
    <main className="max-w-2xl mx-auto px-5 sm:px-8 py-6 sm:py-10 space-y-6">
      <header className="flex items-center justify-between">
        <Link to="/" className="text-sm text-ink-muted hover:text-primary-dark">
          ← 返回首页
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{product.emoji}</span>
          <h1 className="text-lg font-bold text-ink-dark">{product.title}</h1>
        </div>
      </header>

      <div className="rounded-card bg-gradient-to-br from-bg-paper to-white border border-primary/15 p-6 sm:p-8">
        <p className="text-sm text-ink-muted mb-6">{product.description}</p>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-dark">{product.surnameLabel}</label>
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value.slice(0, 4))}
              placeholder={product.surnamePlaceholder}
              className="w-full px-4 py-2.5 rounded-btn border border-ink-muted/30 focus:border-primary focus:outline-none bg-white text-ink-dark"
            />
            {type === 'baby' && (
              <p className="text-xs text-ink-muted">支持复姓如欧阳、司马（1-4 字）</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-dark">{product.genderLabel}</label>
            <div className="grid grid-cols-2 gap-3">
              {product.genderOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGender(opt.value)}
                  className={`py-3 px-4 rounded-btn border-2 text-sm transition-all ${
                    gender === opt.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white border-ink-muted/20 text-ink hover:border-primary/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-dark">{product.vibeOptionLabel}</label>
            <div className="flex flex-wrap gap-2">
              {product.vibeOptions.map((tag) => {
                const selected = vibeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleVibe(tag)}
                    className={`px-4 py-1.5 rounded-full border text-sm transition-all ${
                      selected
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white border-primary/30 text-ink hover:border-primary'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {type === 'baby' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-dark">希望从哪本古籍选字（可选）</label>
              <div className="flex flex-wrap gap-2">
                {['不限', '诗经', '楚辞', '唐诗', '宋词', '论语', '周易'].map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setSourcePref(src)}
                    className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                      sourcePref === src
                        ? 'bg-accent text-white border-accent'
                        : 'bg-white border-primary/30 text-ink hover:border-primary'
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-dark">
              有什么字不能用？（可选 · 家族重名 / 长辈忌讳）
            </label>
            <textarea
              value={taboo}
              onChange={(e) => setTaboo(e.target.value.slice(0, 200))}
              placeholder="如：堂兄'子涵'已用涵字；爷爷名'国华'，需避国/华"
              rows={2}
              className="w-full px-4 py-2.5 rounded-btn border border-ink-muted/30 focus:border-primary focus:outline-none bg-white text-ink-dark text-sm resize-none"
            />
          </div>

          {error && (
            <div className="text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-btn px-3 py-2">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-3.5 rounded-btn bg-accent text-white font-medium hover:bg-accent-dark shadow-soft"
            >
              {product.cta}
            </button>
            <p className="text-center text-xs text-ink-muted mt-2">
              免费看 3 个名字，无需注册 · 由远端 LLM gateway / mock 提供
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-ink-muted text-center">
        ⚠ MVP：本产品不涉及"算命/八字/吉凶/打分"内容，纯粹基于国学经典的 AI 名字推荐工具。
      </p>
    </main>
  );
}
