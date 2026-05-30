import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Upload, RefreshCw, Heart } from 'lucide-react';
import { useState } from 'react';
import { useCountdownStore } from '@/lib/store';
import { ThemePicker } from '@/components/ThemePicker';
import { exportBackup, importBackup } from '@/lib/storage';

export default function SettingsPage() {
  const settings = useCountdownStore((s) => s.settings);
  const setSettings = useCountdownStore((s) => s.setSettings);
  const setDefaultTheme = useCountdownStore((s) => s.setDefaultTheme);
  const replaceAll = useCountdownStore((s) => s.replaceAll);
  const resetWithDemo = useCountdownStore((s) => s.resetWithDemo);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = () => {
    const blob = new Blob([exportBackup()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `countdown-pro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = importBackup(text);
      replaceAll(parsed.cards, parsed.settings);
      setImportStatus(`导入成功，共 ${parsed.cards.length} 条`);
    } catch (err) {
      setImportStatus(`导入失败：${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-6 space-y-8">
      <header className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
        >
          <ArrowLeft size={16} /> 返回
        </Link>
        <h1 className="text-base font-semibold">设置</h1>
        <span />
      </header>

      <section>
        <h2 className="text-xs uppercase tracking-[0.2em] opacity-60 mb-3">
          默认主题
        </h2>
        <ThemePicker
          value={settings.defaultTheme}
          onChange={(t) => setDefaultTheme(t)}
        />
        <p className="text-xs opacity-60 mt-3">
          新建倒数日的默认配色，可在每张卡片单独覆盖。MVP 阶段 5 套主题全部免费。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-[0.2em] opacity-60">显示</h2>

        <Toggle
          label="显示农历日期（详情页）"
          description="MVP 仅存储偏好；农历计算待 V2"
          checked={settings.showLunar}
          onChange={(v) => setSettings({ showLunar: v })}
        />
        <Toggle
          label="首次启动已完成"
          description="关闭后下次会看到欢迎提示"
          checked={settings.onboardingDismissed}
          onChange={(v) => setSettings({ onboardingDismissed: v })}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-[0.2em] opacity-60">数据备份</h2>
        <p className="text-xs opacity-70">
          所有数据都存在浏览器 localStorage。换设备 / 换浏览器请使用导出 JSON 备份。
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary text-sm" onClick={handleExport}>
            <Download size={16} /> 导出备份
          </button>
          <label className="btn btn-ghost text-sm cursor-pointer">
            <Upload size={16} /> 导入备份
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImport}
            />
          </label>
          <button
            type="button"
            className="btn btn-ghost text-sm"
            onClick={() => {
              if (window.confirm('重置为演示数据？现有自定义倒数日将被覆盖。')) {
                resetWithDemo();
                setImportStatus('已重置为演示数据');
              }
            }}
          >
            <RefreshCw size={16} /> 重置演示数据
          </button>
        </div>
        {importStatus && (
          <div className="text-xs opacity-80" role="status">{importStatus}</div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-[0.2em] opacity-60">关于</h2>
        <div className="rounded-2xl p-4 text-sm leading-relaxed"
          style={{ background: 'var(--theme-surface)' }}>
          <div className="flex items-center gap-2 text-base font-semibold mb-2">
            <Heart size={16} style={{ color: 'var(--theme-primary)' }} />
            倒数日 Pro · Vite + Capacitor
          </div>
          <p className="opacity-80">
            5 套主题 · 25+ 桌面小组件视觉 · 一次买断 ¥18 永久（MVP 暂不启用付费墙）。
          </p>
          <ul className="mt-3 space-y-1 opacity-80 list-disc pl-5">
            <li>本地 localStorage 持久化，刷新页面数据保留</li>
            <li>html2canvas 海报截图分享（下载 + 复制图片）</li>
            <li>WidgetKit 实现见 <code>ios-widget-todo.md</code></li>
            <li>合规：见 <code>compliance-checklist.md § 2</code></li>
          </ul>
        </div>
      </section>
    </main>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label
      className="flex items-center justify-between gap-3 rounded-2xl p-3"
      style={{ background: 'var(--theme-surface)' }}
    >
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && (
          <span className="block text-xs opacity-60 mt-0.5">{description}</span>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5"
        style={{ accentColor: 'var(--theme-primary)' }}
      />
    </label>
  );
}
