import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 主色 暖绿 (健康植物感)
        primary: {
          DEFAULT: '#527064',
          dark: '#3E5650',
          light: '#7A917F',
        },
        // 强调 暖橙 (诊断/付费按钮)
        accent: {
          DEFAULT: '#E8A45E',
          dark: '#CC8745',
          light: '#F4C083',
        },
        // 背景 米黄
        bg: {
          DEFAULT: '#FFF8EE',
          paper: '#FAF3E4',
          alt: '#F5EBD6',
        },
        // 文字
        ink: {
          DEFAULT: '#2E3D33',
          dark: '#1A241D',
          muted: '#7B857E',
          light: '#B8C2BB',
        },
        // 状态色
        status: {
          ok: '#5BAA73',
          warn: '#E8A45E',
          danger: '#D87060',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'PingFang SC', 'Source Han Sans CN', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(46, 61, 51, 0.06)',
        card: '0 4px 20px rgba(82, 112, 100, 0.10)',
      },
    },
  },
  plugins: [],
};

export default config;
