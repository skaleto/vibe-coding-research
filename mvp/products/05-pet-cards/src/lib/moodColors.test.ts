import { describe, expect, it } from 'vitest';
import { MOOD_COLORS, getMoodPalette } from './moodColors';
import { MOOD_TAGS } from './types';

// getMoodPalette 必须对任意输入安全返回一个完整色板：
//  - 已知 mood_tag → 对应色板
//  - 未知 / 空 / undefined → '默认' 色板（绝不返回 undefined）
// 这是海报渲染的取色入口，LLM 可能返回意料之外的 mood_tag，必须有兜底。

const HEX = /^#[0-9A-Fa-f]{6}$/;

describe('getMoodPalette', () => {
  it('case 1: 已知 mood_tag 返回对应色板', () => {
    expect(getMoodPalette('开心')).toBe(MOOD_COLORS['开心']);
    expect(getMoodPalette('困倦')).toBe(MOOD_COLORS['困倦']);
  });

  it('case 2: undefined 返回默认色板', () => {
    expect(getMoodPalette(undefined)).toBe(MOOD_COLORS['默认']);
  });

  it('case 3: 空字符串返回默认色板', () => {
    expect(getMoodPalette('')).toBe(MOOD_COLORS['默认']);
  });

  it('case 4: 未知 mood_tag（LLM 越界输出）返回默认色板，绝不 undefined', () => {
    const palette = getMoodPalette('暴走😡<script>');
    expect(palette).toBe(MOOD_COLORS['默认']);
    expect(palette).toBeDefined();
  });

  it('case 5: 所有 11 个预设 mood_tag 都有完整且格式合法的色板', () => {
    for (const tag of MOOD_TAGS) {
      const palette = getMoodPalette(tag);
      expect(palette).toBe(MOOD_COLORS[tag]);
      // 6 个颜色/emoji 字段齐全
      expect(palette.primary).toMatch(HEX);
      expect(palette.secondary).toMatch(HEX);
      expect(palette.bg).toMatch(HEX);
      expect(palette.text).toMatch(HEX);
      expect(palette.accent).toMatch(HEX);
      expect(palette.emoji.length).toBeGreaterThan(0);
    }
  });

  it('case 6: 返回的色板对象包含全部必需字段', () => {
    const palette = getMoodPalette('撒娇');
    expect(Object.keys(palette).sort()).toEqual(
      ['accent', 'bg', 'emoji', 'primary', 'secondary', 'text'].sort()
    );
  });
});
