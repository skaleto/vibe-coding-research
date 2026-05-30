import { useEffect } from 'react';
import { getTheme, themeCssVars } from '@/lib/themes';
import { useCountdownStore } from '@/lib/store';

/**
 * Mounts the zustand store hydration once + injects the **global** theme CSS
 * variables onto the body. Per-card themes can re-inject via ThemedSurface.
 */
export function ThemeRoot({ children }: { children: React.ReactNode }) {
  const hydrate = useCountdownStore((s) => s.hydrate);
  const settings = useCountdownStore((s) => s.settings);
  const hydrated = useCountdownStore((s) => s.hydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const theme = getTheme(settings.defaultTheme);
  const vars = themeCssVars(theme) as Record<string, string>;

  return (
    <div
      data-theme={theme.id}
      data-hydrated={hydrated ? '1' : '0'}
      style={vars}
      className="min-h-screen"
    >
      {children}
    </div>
  );
}
