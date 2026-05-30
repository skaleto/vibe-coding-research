import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // theme-aware tokens drive runtime CSS variables
        primary: 'var(--theme-primary)',
        secondary: 'var(--theme-secondary)',
        accent: 'var(--theme-accent)',
        bg: 'var(--theme-bg)',
        surface: 'var(--theme-surface)',
        text: 'var(--theme-text)',
        muted: 'var(--theme-muted)',

        // 少女心 - 千禧粉色
        pink: {
          50: '#FFFAFC',
          100: '#FFE0EC',
          200: '#FFB3D1',
          400: '#FF6B9D',
          800: '#5D2A4A',
        },
        // 极简 - 莫兰迪灰白
        minimal: {
          50: '#FAFAFA',
          200: '#E5E5E5',
          500: '#666666',
          900: '#1A1A1A',
        },
        // 复古胶片 - Kodak Gold 200
        film: {
          50: '#F5E6D3',
          100: '#FBF6EC',
          400: '#D4943F',
          600: '#8B5A3C',
          800: '#2D2418',
          accent: '#C84B31',
        },
        // 国风 - 水墨节气
        ink: {
          50: '#FBF9F2',
          100: '#F4F1E8',
          300: '#A89F8C',
          500: '#5C7A3C',
          700: '#7A1F1F',
          900: '#1C1C1C',
        },
        // 赛博朋克 - Neon Tokyo
        cyber: {
          50: '#E0E0FF',
          800: '#1A1F4E',
          900: '#0A0E27',
          magenta: '#FF006E',
          cyan: '#00F5FF',
          yellow: '#FFEE00',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        handwriting: ['"Caveat Brush"', '"Comic Sans MS"', 'cursive'],
      },
      backgroundImage: {
        'grain-noise':
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'neon-magenta': '0 0 4px #FF006E, 0 0 12px #FF006E, 0 0 24px rgba(255,0,110,0.4)',
        'neon-cyan': '0 0 4px #00F5FF, 0 0 12px #00F5FF, 0 0 24px rgba(0,245,255,0.4)',
        'card-soft': '0 2px 8px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
