import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 主色 古铜金 (文化感)
        primary: {
          DEFAULT: '#C8A56C',
          dark: '#B08D52',
          light: '#E5C99A',
        },
        // 强调 朱砂深棕 (付费/解锁按钮)
        accent: {
          DEFAULT: '#8B4513',
          dark: '#6B340F',
        },
        // 背景 米白宣纸
        bg: {
          DEFAULT: '#FFF8EE',
          paper: '#FAF6EE',
          alt: '#F5EEDF',
        },
        // 文字
        ink: {
          DEFAULT: '#3D2C2E',
          dark: '#2A2A2A',
          muted: '#888888',
          light: '#B8B8B8',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'PingFang SC', 'Source Han Sans CN', 'system-ui', 'sans-serif'],
        serif: ['"Times New Roman"', 'Songti SC', 'serif'],
      },
      borderRadius: {
        card: '16px',
        btn: '8px',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(61, 44, 46, 0.06)',
        card: '0 4px 20px rgba(200, 165, 108, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
