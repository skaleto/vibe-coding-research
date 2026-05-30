import { forwardRef, useMemo } from 'react';
import { getTheme, themeCssVars, type Theme } from '@/lib/themes';
import type { ThemeId } from '@/lib/types';

interface ThemedSurfaceProps {
  themeId: ThemeId;
  /** Render-prop or children. Theme is also exposed via CSS vars. */
  children: React.ReactNode | ((theme: Theme) => React.ReactNode);
  /** Apply theme background gradient. Default true. */
  withBackground?: boolean;
  /** Apply decoration overlays (grain / scanlines / perforations). */
  withDecorations?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** HTML id, used by html2canvas to target. */
  id?: string;
  /** Force inline color (some html2canvas runs strip CSS vars). */
  inlineFallback?: boolean;
}

/**
 * Wraps any subtree in a fully-themed container.
 * Decorations are theme-aware:
 *  - pink: pastel paper, ribbons (rendered by children if desired)
 *  - minimal: no decoration
 *  - film: grain + perforations
 *  - ink: rice-paper wash
 *  - cyber: scanlines + cyber-grid
 */
export const ThemedSurface = forwardRef<HTMLDivElement, ThemedSurfaceProps>(
  function ThemedSurface(
    {
      themeId,
      children,
      withBackground = true,
      withDecorations = true,
      className = '',
      style,
      id,
      inlineFallback = false,
    },
    ref,
  ) {
    const theme = getTheme(themeId);
    const vars = themeCssVars(theme) as Record<string, string>;

    const decorationClasses: string[] = [];
    const extraStyle: React.CSSProperties = {};

    if (withDecorations) {
      if (theme.id === 'cyber') decorationClasses.push('cyber-scanlines', 'cyber-grid');
      if (theme.decorations.grain) decorationClasses.push('film-grain');
      if (theme.id === 'pink') decorationClasses.push('pink-paper');
      if (theme.id === 'ink') decorationClasses.push('ink-paper');
    }
    if (withBackground) {
      extraStyle.background = theme.decorations.bgGradient;
    }

    const mergedStyle: React.CSSProperties = {
      ...vars,
      ...extraStyle,
      color: theme.colors.text,
      fontFamily: theme.fonts.sans,
      ...(inlineFallback
        ? { backgroundColor: theme.colors.bg }
        : null),
      ...style,
    };

    const content = useMemo(
      () => (typeof children === 'function' ? children(theme) : children),
      [children, theme],
    );

    return (
      <div
        ref={ref}
        id={id}
        data-theme={theme.id}
        className={`relative overflow-hidden ${decorationClasses.join(' ')} ${className}`}
        style={mergedStyle}
      >
        {content}
      </div>
    );
  },
);
