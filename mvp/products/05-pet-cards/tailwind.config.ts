import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 萌粉
        primary: {
          DEFAULT: '#FFB6C1',
          dark: '#FF8FA3',
          light: '#FFD6E0',
        },
        // 奶黄强调
        accent: {
          DEFAULT: '#FFE5B4',
          dark: '#FFD27A',
          light: '#FFF3D6',
        },
        // 背景米黄
        bg: {
          DEFAULT: '#FFF8E1',
          paper: '#FFF6E5',
          alt: '#FAF0D4',
        },
        // 深咖啡文字
        ink: {
          DEFAULT: '#3D2C2E',
          dark: '#2A1E1F',
          muted: '#8B6F47',
          light: '#C9B8A5',
        },
        // 薄荷绿副气泡
        mint: {
          DEFAULT: '#B5EAD7',
          dark: '#7BC8A4',
          light: '#D4F1E4',
        },
        // 番茄红强调
        tomato: {
          DEFAULT: '#FF6B6B',
          dark: '#E04D4D',
          light: '#FF9B9B',
        },
        // 复古胶片色
        vintage: {
          paper: '#F0E6D2',
          ink: '#2C2C2C',
          stamp: '#A63A33',
          leather: '#7A5C3D',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'PingFang SC', 'Source Han Sans CN', 'system-ui', 'sans-serif'],
        cute: ['"Hiragino Sans GB"', 'PingFang SC', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'PingFang SC', 'Songti SC', 'serif'],
      },
      borderRadius: {
        card: '20px',
        btn: '999px',
        bubble: '28px',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(61, 44, 46, 0.08)',
        card: '0 8px 24px rgba(255, 143, 163, 0.18)',
        bubble: '0 4px 12px rgba(255, 143, 163, 0.25)',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.1)', opacity: '0.4' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        bounce_in: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        breathe: 'breathe 2s ease-in-out infinite',
        wiggle: 'wiggle 0.6s ease-in-out infinite',
        'bounce-in': 'bounce_in 0.4s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
