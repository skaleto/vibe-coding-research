import type { MoodTag } from './types';

export type MoodPalette = {
  primary: string; // 主气泡 / 强调色
  secondary: string; // 副气泡
  bg: string; // 卡片背景
  text: string; // 文字
  accent: string; // 徽章 / 印章
  emoji: string; // 默认 emoji（mood_tag 视觉化）
};

// 11 个 mood_tag → 配色映射
export const MOOD_COLORS: Record<MoodTag, MoodPalette> = {
  撒娇: {
    primary: '#FFB6C1',
    secondary: '#FFD6E0',
    bg: '#FFF6E5',
    text: '#3D2C2E',
    accent: '#FF8FA3',
    emoji: '💕',
  },
  求食: {
    primary: '#FFB347',
    secondary: '#FFE5B4',
    bg: '#FFF8E1',
    text: '#3D2C2E',
    accent: '#E89B2E',
    emoji: '🍣',
  },
  警惕: {
    primary: '#FF6B6B',
    secondary: '#FFCFCF',
    bg: '#FFF0EE',
    text: '#3D2C2E',
    accent: '#D94D4D',
    emoji: '😤',
  },
  困倦: {
    primary: '#A8B8E8',
    secondary: '#D6DFF4',
    bg: '#F3F4FA',
    text: '#3D2C2E',
    accent: '#7E91D6',
    emoji: '💤',
  },
  求摸摸: {
    primary: '#FFC1D0',
    secondary: '#FFE8EF',
    bg: '#FFF6F8',
    text: '#3D2C2E',
    accent: '#FF8FA3',
    emoji: '🥺',
  },
  抱怨: {
    primary: '#C8A8E8',
    secondary: '#E8D6F4',
    bg: '#F8F2FC',
    text: '#3D2C2E',
    accent: '#A07AD0',
    emoji: '😾',
  },
  想出门: {
    primary: '#7BC8A4',
    secondary: '#B5EAD7',
    bg: '#F0FAF5',
    text: '#3D2C2E',
    accent: '#5BAA88',
    emoji: '🐾',
  },
  开心: {
    primary: '#FFD27A',
    secondary: '#FFEEC2',
    bg: '#FFFAEC',
    text: '#3D2C2E',
    accent: '#E8A45E',
    emoji: '✨',
  },
  闹脾气: {
    primary: '#F08080',
    secondary: '#FCCCCC',
    bg: '#FFF2F2',
    text: '#3D2C2E',
    accent: '#D85858',
    emoji: '💢',
  },
  好奇: {
    primary: '#7DC3E8',
    secondary: '#C5E5F4',
    bg: '#F0F8FC',
    text: '#3D2C2E',
    accent: '#52A0CC',
    emoji: '👀',
  },
  默认: {
    primary: '#FFB6C1',
    secondary: '#B5EAD7',
    bg: '#FFF6E5',
    text: '#3D2C2E',
    accent: '#FF8FA3',
    emoji: '🐾',
  },
};

// 安全取色：mood_tag 不在预设里时返回默认色板
export function getMoodPalette(mood: string | undefined): MoodPalette {
  if (!mood) return MOOD_COLORS['默认'];
  const palette = (MOOD_COLORS as Record<string, MoodPalette>)[mood];
  return palette ?? MOOD_COLORS['默认'];
}
