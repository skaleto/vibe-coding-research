import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Pencil, Eye, RotateCcw, Crown, Sparkles } from 'lucide-react';
import type { ResumeData, TemplateId } from '@/lib/types';
import {
  loadResume,
  saveResume,
  loadTemplateId,
  saveTemplateId,
  loadPaid,
  savePaid,
  debounce,
} from '@/lib/storage';
import { createEmptyData } from '@/lib/sampleData';
import { isFreeTemplate, getTemplate } from '@/lib/templates';
import { ResumeForm } from '@/components/ResumeForm';
import { TemplatePicker } from '@/components/TemplatePicker';
import { PreviewPane } from '@/components/PreviewPane';
import { ExportBar } from '@/components/ExportBar';
import { PaywallModal } from '@/components/PaywallModal';

type MobileTab = 'edit' | 'preview';

export default function App() {
  const [data, setData] = useState<ResumeData>(() => loadResume());
  const [templateId, setTemplateId] = useState<TemplateId>(() => loadTemplateId());
  const [paid, setPaid] = useState<boolean>(() => loadPaid());
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [tab, setTab] = useState<MobileTab>('edit');
  const [savedFlash, setSavedFlash] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);

  // 防抖自动保存简历数据
  const persist = useMemo(
    () =>
      debounce((d: ResumeData) => {
        saveResume(d);
        setSavedFlash(true);
        window.setTimeout(() => setSavedFlash(false), 1200);
      }, 500),
    [],
  );

  useEffect(() => {
    persist(data);
  }, [data, persist]);

  useEffect(() => {
    saveTemplateId(templateId);
  }, [templateId]);

  // 水印：未付费 且 当前用的是付费模板时不会发生（付费模板已被 gate）；
  // 规则——免费用户始终带水印（即便用免费模板），付费后去水印。
  const watermark = !paid;

  const handlePickTemplate = useCallback((id: TemplateId) => {
    setTemplateId(id);
  }, []);

  const handleLockedPick = useCallback(() => {
    setPaywallOpen(true);
  }, []);

  const handlePaid = useCallback(() => {
    setPaid(true);
    savePaid(true);
    setPaywallOpen(false);
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm('确定清空当前内容、重新填写吗？此操作不可撤销。')) {
      const empty = createEmptyData();
      setData(empty);
      saveResume(empty);
    }
  }, []);

  const fileName = (data.basics.name || '我的简历') + '-简历';
  const currentTpl = getTemplate(templateId);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        paid={paid}
        savedFlash={savedFlash}
        onReset={handleReset}
        onUpgrade={() => setPaywallOpen(true)}
        sheetRef={sheetRef}
        fileName={fileName}
      />

      {/* 移动端 tab 切换 */}
      <div className="no-print sticky top-[57px] z-20 flex border-b border-canvas-DEFAULT bg-white lg:hidden">
        <TabBtn active={tab === 'edit'} onClick={() => setTab('edit')} icon={<Pencil size={15} />}>
          编辑
        </TabBtn>
        <TabBtn active={tab === 'preview'} onClick={() => setTab('preview')} icon={<Eye size={15} />}>
          预览
        </TabBtn>
      </div>

      <main className="mx-auto flex w-full max-w-[1400px] flex-1 gap-5 px-3 py-4 lg:px-5">
        {/* 左：编辑区 */}
        <section
          className={[
            'no-print w-full min-w-0 lg:block lg:w-[44%] lg:max-w-[560px]',
            tab === 'edit' ? 'block' : 'hidden',
          ].join(' ')}
        >
          {/* 模板选择 */}
          <div className="mb-4 rounded-xl border border-canvas-DEFAULT bg-white p-4 shadow-card">
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-ink">选择模板</h2>
              <span className="text-[12px] text-ink-light">
                当前：{currentTpl.name}
                {!isFreeTemplate(templateId) && (
                  <span className="ml-1 text-brand">· 已解锁</span>
                )}
              </span>
            </div>
            <TemplatePicker
              current={templateId}
              paid={paid}
              onPick={handlePickTemplate}
              onLockedPick={handleLockedPick}
            />
            {!paid && (
              <button
                type="button"
                onClick={() => setPaywallOpen(true)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-btn bg-brand-light py-2 text-[13px] font-medium text-brand transition hover:bg-brand hover:text-white"
              >
                <Sparkles size={14} />
                ¥9 解锁全部模板 + 去水印
              </button>
            )}
          </div>

          <ResumeForm data={data} onChange={setData} />
        </section>

        {/* 右：预览区 */}
        <section
          className={[
            'w-full min-w-0 flex-1 lg:block',
            tab === 'preview' ? 'block' : 'hidden',
          ].join(' ')}
        >
          <div className="sticky top-[72px]">
            <div className="no-print mb-3 flex items-center justify-between lg:hidden">
              <span className="text-[13px] font-medium text-ink-muted">实时预览</span>
              <ExportBar sheetRef={sheetRef} fileName={fileName} />
            </div>
            <div className="overflow-auto rounded-xl bg-canvas-DEFAULT p-3 lg:max-h-[calc(100vh-96px)] scroll-thin">
              <PreviewPane
                data={data}
                templateId={templateId}
                watermark={watermark}
                sheetRef={sheetRef}
              />
            </div>
            {watermark && (
              <p className="no-print mt-2 text-center text-[12px] text-ink-light">
                试用版导出带水印 ·{' '}
                <button
                  type="button"
                  onClick={() => setPaywallOpen(true)}
                  className="font-medium text-brand underline-offset-2 hover:underline"
                >
                  ¥9 去水印
                </button>
              </p>
            )}
          </div>
        </section>
      </main>

      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} onPaid={handlePaid} />
    </div>
  );
}

function Header({
  paid,
  savedFlash,
  onReset,
  onUpgrade,
  sheetRef,
  fileName,
}: {
  paid: boolean;
  savedFlash: boolean;
  onReset: () => void;
  onUpgrade: () => void;
  sheetRef: React.RefObject<HTMLDivElement>;
  fileName: string;
}) {
  return (
    <header className="no-print sticky top-0 z-30 flex h-[57px] items-center justify-between border-b border-canvas-DEFAULT bg-white/90 px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
          <FileText size={18} />
        </span>
        <div>
          <h1 className="text-[15px] font-bold leading-none text-ink">简历模板</h1>
          <p className="text-[10.5px] leading-none text-ink-light">填表单 · 一键导 PDF</p>
        </div>
        {savedFlash && (
          <span className="ml-2 hidden text-[11px] text-green-600 sm:inline">已自动保存</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onReset}
          className="hidden items-center gap-1 rounded-md px-2.5 py-1.5 text-[12px] text-ink-light transition hover:bg-canvas-DEFAULT hover:text-ink sm:inline-flex"
          title="清空重填"
        >
          <RotateCcw size={13} /> 清空
        </button>
        {paid ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1.5 text-[12px] font-medium text-amber-600">
            <Crown size={13} /> 已解锁
          </span>
        ) : (
          <button
            type="button"
            onClick={onUpgrade}
            className="inline-flex items-center gap-1 rounded-btn bg-amber-400 px-3 py-1.5 text-[12px] font-semibold text-amber-950 transition hover:bg-amber-300"
          >
            <Crown size={13} /> ¥9 解锁
          </button>
        )}
        {/* 桌面端导出按钮放 header 右侧；移动端在预览顶部 */}
        <div className="hidden lg:block">
          <ExportBar sheetRef={sheetRef} fileName={fileName} />
        </div>
      </div>
    </header>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition',
        active ? 'border-b-2 border-brand text-brand' : 'text-ink-light',
      ].join(' ')}
    >
      {icon}
      {children}
    </button>
  );
}
