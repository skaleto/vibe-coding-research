import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 品牌主色（小红书系珊瑚红，种草感）
        brand: {
          DEFAULT: '#FF4D6D',
          dark: '#E03355',
          light: '#FFE0E7',
        },
        // 中性墨色
        ink: {
          DEFAULT: '#1F2329',
          muted: '#646A73',
          light: '#8F959E',
          faint: '#C9CDD4',
        },
        // 应用背景
        canvas: {
          DEFAULT: '#F5F6F7',
          panel: '#FFFFFF',
        },
        // 4 套模板各自的主题色
        tpl: {
          minimal: '#2D2D2D',
          blue: '#1E5FA8',
          creative: '#7C3AED',
          academic: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['PingFang SC', 'Microsoft YaHei', 'Source Han Sans CN', 'system-ui', 'sans-serif'],
        serif: ['Songti SC', 'SimSun', 'Noto Serif SC', 'serif'],
      },
      boxShadow: {
        panel: '0 1px 3px rgba(31, 35, 41, 0.08)',
        sheet: '0 4px 24px rgba(31, 35, 41, 0.12)',
        card: '0 2px 12px rgba(31, 35, 41, 0.06)',
      },
      borderRadius: {
        btn: '10px',
      },
    },
  },
  plugins: [],
};

export default config;
