import type { ThemeId } from './types';

/**
 * Structured theme definitions covering all 5 design directions from
 * light-products/detail-02-countdown.md § A.
 *
 * Each theme exposes:
 *  - colors:     5+ semantic tokens consumed by tailwind via CSS variables
 *  - fonts:      font-family stacks for body / display / accent
 *  - decorations: opt-in ornamental flags (grain noise, ribbons, scanlines…)
 *  - posterCSS:  background CSS used by the WidgetPreview + poster export
 *
 * The themes are intentionally non-interchangeable: pink uses a soft pastel
 * gradient + handwriting display font, minimal uses a stark white surface +
 * ultralight sans, film layers warm sepia + grain + film-perforations, ink
 * leans into rice-paper + serif + ink-wash, cyber goes neon glow + mono.
 */
export interface ThemeColors {
  /** Main hero color (大数字 / accent buttons) */
  primary: string;
  /** Supporting hue (titles, secondary text) */
  secondary: string;
  /** Background base */
  bg: string;
  /** Card / surface color sitting on top of bg */
  surface: string;
  /** Primary text */
  text: string;
  /** Muted text */
  muted: string;
  /** Loud highlight for "expired" / call-to-action chips */
  accent: string;
}

export interface ThemeFonts {
  /** Body font stack */
  sans: string;
  /** Display font (用于大数字) */
  display: string;
  /** Mono / accent font (备注 or 装饰文字) */
  mono: string;
}

export interface ThemeDecorations {
  /** Whether to overlay film-grain noise */
  grain: boolean;
  /** Whether to draw the cyber scanline overlay */
  scanlines: boolean;
  /** Whether to draw left/right film-perforation strips */
  filmPerforations: boolean;
  /** Whether to render girly ribbons + sparkles */
  ribbons: boolean;
  /** Whether to draw the red 朱砂 ink seal */
  inkSeal: boolean;
  /** Whether to apply CRT-style RGB glitch */
  glitch: boolean;
  /** Whether titles default to vertical writing mode */
  vertical: boolean;
  /** CSS gradient string used by hero background */
  bgGradient: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  /** One-sentence tagline used in the picker */
  tagline: string;
  /** Whether the theme prefers a dark-mode style aesthetic */
  isDark: boolean;
  colors: ThemeColors;
  fonts: ThemeFonts;
  decorations: ThemeDecorations;
  /** Cohort / emoji palette suggested to attach to new cards */
  emojiPool: string[];
}

// ----- 1. 少女心 - 千禧粉色 ------------------------------------------------
const pinkTheme: Theme = {
  id: 'pink',
  name: '少女心',
  tagline: '千禧粉色 · 蝴蝶结手写字',
  isDark: false,
  colors: {
    primary: '#FF6B9D',
    secondary: '#FFB3D1',
    bg: '#FFE0EC',
    surface: '#FFFAFC',
    text: '#5D2A4A',
    muted: '#B98AA0',
    accent: '#FFD700',
  },
  fonts: {
    sans: '"PingFang SC", "Source Han Sans CN", -apple-system, sans-serif',
    display:
      '"Caveat Brush", "Brush Script MT", "Source Han Serif CN", "Songti SC", cursive',
    mono: '"Snell Roundhand", "Apple Chancery", cursive',
  },
  decorations: {
    grain: false,
    scanlines: false,
    filmPerforations: false,
    ribbons: true,
    inkSeal: false,
    glitch: false,
    vertical: false,
    bgGradient:
      'radial-gradient(circle at 30% 20%, #FFE0EC 0%, #FFB3D1 60%, #FFCCDD 100%)',
  },
  emojiPool: ['💕', '🎀', '✨', '🌸', '🦄', '🍰', '🎂', '👑'],
};

// ----- 2. 极简 - 莫兰迪灰白 ------------------------------------------------
const minimalTheme: Theme = {
  id: 'minimal',
  name: '极简',
  tagline: '莫兰迪灰白 · Things 3 美学',
  isDark: false,
  colors: {
    primary: '#1A1A1A',
    secondary: '#666666',
    bg: '#FAFAFA',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    muted: '#999999',
    accent: '#FF3B30',
  },
  fonts: {
    sans: '-apple-system, "SF Pro Display", "PingFang SC", system-ui, sans-serif',
    display:
      '"SF Pro Display", "Helvetica Neue", "PingFang SC", "Inter", system-ui, sans-serif',
    mono: '"SF Mono", "JetBrains Mono", ui-monospace, monospace',
  },
  decorations: {
    grain: false,
    scanlines: false,
    filmPerforations: false,
    ribbons: false,
    inkSeal: false,
    glitch: false,
    vertical: false,
    bgGradient: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',
  },
  emojiPool: ['•', '▌', '/', '—', '◇', '○'],
};

// ----- 3. 复古胶片 - Kodak Gold 200 ---------------------------------------
const filmTheme: Theme = {
  id: 'film',
  name: '复古胶片',
  tagline: 'Kodak Gold 200 · 老打字机字体',
  isDark: false,
  colors: {
    primary: '#C84B31',
    secondary: '#8B5A3C',
    bg: '#F5E6D3',
    surface: '#FBF6EC',
    text: '#2D2418',
    muted: '#8B7355',
    accent: '#D4943F',
  },
  fonts: {
    sans: '"Source Han Serif CN", "Noto Serif SC", "Songti SC", serif',
    display:
      '"Courier New", "IBM Plex Mono", "Special Elite", ui-monospace, monospace',
    mono: '"Courier New", "Special Elite", "IBM Plex Mono", ui-monospace, monospace',
  },
  decorations: {
    grain: true,
    scanlines: false,
    filmPerforations: true,
    ribbons: false,
    inkSeal: false,
    glitch: false,
    vertical: false,
    bgGradient:
      'linear-gradient(135deg, #F5E6D3 0%, #E8D5B8 50%, #F5E6D3 100%)',
  },
  emojiPool: ['📷', '✉️', '📮', '🗺️', '🎞️', '🕰️'],
};

// ----- 4. 国风 - 水墨节气 -------------------------------------------------
const inkTheme: Theme = {
  id: 'ink',
  name: '国风',
  tagline: '水墨节气 · 宋体竖排 · 朱砂落款',
  isDark: false,
  colors: {
    primary: '#1C1C1C',
    secondary: '#7A1F1F',
    bg: '#F4F1E8',
    surface: '#FBF9F2',
    text: '#1C1C1C',
    muted: '#A89F8C',
    accent: '#5C7A3C',
  },
  fonts: {
    sans: '"Source Han Serif CN", "Noto Serif SC", "Songti SC", "STSong", serif',
    display:
      '"LXGW WenKai", "霞鹜文楷", "Source Han Serif CN", "STSong", "FangSong", serif',
    mono: '"FangSong", "STFangsong", "Source Han Serif CN", serif',
  },
  decorations: {
    grain: false,
    scanlines: false,
    filmPerforations: false,
    ribbons: false,
    inkSeal: true,
    glitch: false,
    vertical: true,
    bgGradient:
      'radial-gradient(ellipse at 80% 80%, rgba(168,159,140,0.18) 0%, transparent 60%), #F4F1E8',
  },
  emojiPool: ['🀄', '🍃', '🌙', '🪷', '🏯', '🐉'],
};

// ----- 5. 赛博朋克 - Neon Tokyo -------------------------------------------
const cyberTheme: Theme = {
  id: 'cyber',
  name: '赛博朋克',
  tagline: 'Neon Tokyo · 霓虹品红 · 故障字效',
  isDark: true,
  colors: {
    primary: '#FF006E',
    secondary: '#00F5FF',
    bg: '#0A0E27',
    surface: '#13183A',
    text: '#E0E0FF',
    muted: '#7A7FAE',
    accent: '#FFEE00',
  },
  fonts: {
    sans: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
    display:
      '"Orbitron", "JetBrains Mono", "Share Tech Mono", ui-monospace, monospace',
    mono: '"Share Tech Mono", "JetBrains Mono", ui-monospace, monospace',
  },
  decorations: {
    grain: false,
    scanlines: true,
    filmPerforations: false,
    ribbons: false,
    inkSeal: false,
    glitch: true,
    vertical: false,
    bgGradient:
      'linear-gradient(180deg, #0A0E27 0%, #13183A 50%, #1A1F4E 100%)',
  },
  emojiPool: ['▲', '▼', '►', '◄', '▒', '█'],
};

export const themes: Record<ThemeId, Theme> = {
  pink: pinkTheme,
  minimal: minimalTheme,
  film: filmTheme,
  ink: inkTheme,
  cyber: cyberTheme,
};

export const themeIds: ThemeId[] = ['pink', 'minimal', 'film', 'ink', 'cyber'];

export const themeList: Theme[] = themeIds.map((id) => themes[id]);

export function getTheme(id: ThemeId): Theme {
  return themes[id] ?? themes.minimal;
}

/**
 * Produce inline CSS variables consumed by tailwind theme-aware tokens.
 * Use as `style={themeCssVars(theme)}` on the topmost root of a themed subtree.
 */
export function themeCssVars(theme: Theme): React.CSSProperties {
  return {
    // Cast through unknown so we can stash CSS custom properties on the style obj.
    ...({
      '--theme-primary': theme.colors.primary,
      '--theme-secondary': theme.colors.secondary,
      '--theme-accent': theme.colors.accent,
      '--theme-bg': theme.colors.bg,
      '--theme-surface': theme.colors.surface,
      '--theme-text': theme.colors.text,
      '--theme-muted': theme.colors.muted,
      '--theme-font-sans': theme.fonts.sans,
      '--theme-font-display': theme.fonts.display,
      '--theme-font-mono': theme.fonts.mono,
    } as Record<string, string>),
  } as React.CSSProperties;
}
