import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 主色 深紫 (梦境感)
        primary: {
          DEFAULT: '#3D2C4A',
          dark: '#281D33',
          light: '#5C4570',
        },
        // 强调 金色
        accent: {
          DEFAULT: '#D4A574',
          dark: '#B58859',
          light: '#E8C399',
        },
        // 背景 月白
        bg: {
          DEFAULT: '#F5F1E8',
          paper: '#FBF8EF',
          alt: '#ECE7DA',
        },
        // 文字
        ink: {
          DEFAULT: '#2A2030',
          dark: '#16101B',
          muted: '#6B5F75',
          light: '#A89EB2',
        },
        // 危机关怀色（暖色不刺眼）
        care: {
          warm: '#E8A87C',
          card: '#FCEFE5',
          accent: '#C57860',
        },
        // 状态色
        status: {
          ok: '#7AAA92',
          warn: '#E8A87C',
          info: '#9F8FB8',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'PingFang SC', 'Source Han Sans CN', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Source Han Serif CN', 'STSong', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(61, 44, 74, 0.08)',
        card: '0 4px 20px rgba(61, 44, 74, 0.12)',
        moon: '0 0 40px rgba(212, 165, 116, 0.15)',
      },
      animation: {
        'breath': 'breath 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
      },
      keyframes: {
        breath: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
