/**
 * 三级危机检测回归测试
 *
 * 跑法：npm test
 *
 * 这是产品命脉测试，任何一条 fail 都不能上线。
 */

import { test, expect } from 'vitest';
import { detectCrisis, normalize } from './detectCrisis';

test('一级 - 直接表达自杀意图', () => {
  const r = detectCrisis('我不想活了，活着没意思');
  expect(r.level).toBe(1);
  expect(r.action).toBe('redirect');
});

test('一级 - 梦境内含自杀行为（保守优先，仍然触发）', () => {
  const r = detectCrisis('我梦到自己跳楼了');
  expect(r.level).toBe(1);
});

test('一级 - 自残词命中', () => {
  const r = detectCrisis('梦里我一直在伤害自己');
  expect(r.level).toBe(1);
});

test('一级 - "想死"命中', () => {
  const r = detectCrisis('梦醒后我想死');
  expect(r.level).toBe(1);
});

test('一级 - "消失算了"命中', () => {
  const r = detectCrisis('感觉消失算了挺好的');
  expect(r.level).toBe(1);
});

test('二级 - 强烈负面情绪', () => {
  const r = detectCrisis('梦到自己很绝望');
  expect(r.level).toBe(2);
  expect(r.action).toBe('append-warm-card');
});

test('二级 - 撑不住', () => {
  const r = detectCrisis('我感觉撑不住了');
  expect(r.level).toBe(2);
});

test('二级 - 破防（网络新词）', () => {
  const r = detectCrisis('这个梦让我破防了');
  expect(r.level).toBe(2);
});

test('三级 - 孤独', () => {
  const r = detectCrisis('梦里我好孤独');
  expect(r.level).toBe(3);
  expect(r.action).toBe('append-gentle-tip');
});

test('三级 - 想消失', () => {
  const r = detectCrisis('就想消失一会儿');
  expect(r.level).toBe(3);
});

test('三级 - emo', () => {
  const r = detectCrisis('这个梦让我有点 emo');
  expect(r.level).toBe(3);
});

test('零级 - 普通梦境描述', () => {
  const r = detectCrisis('我梦到自己在海边飞翔，看到了夕阳');
  expect(r.level).toBe(0);
  expect(r.action).toBe('none');
});

test('零级 - 空字符串', () => {
  const r = detectCrisis('');
  expect(r.level).toBe(0);
});

test('一级优先于二级（如果两个都命中）', () => {
  const r = detectCrisis('我绝望到想死');
  expect(r.level).toBe(1);
});

test('二级优先于三级', () => {
  const r = detectCrisis('我好孤独，撑不住了');
  expect(r.level).toBe(2);
});

test('英文 locale - level 1', () => {
  const r = detectCrisis('I want to die', 'en-US');
  expect(r.level).toBe(1);
});

test('英文 locale - level 2', () => {
  const r = detectCrisis('I feel hopeless', 'en-US');
  expect(r.level).toBe(2);
});

// ───────────────────────── 抗规避归一化（审计 F04-03） ─────────────────────────
// 以下所有"绕过尝试"都必须命中一级。命脉测试，任意一条 fail 都不能上线。

test('归一化 - 半角空格插入"自 杀"仍触发一级', () => {
  const r = detectCrisis('我梦到自 杀');
  expect(r.level).toBe(1);
});

test('归一化 - 全角空格插入"自　杀"仍触发一级', () => {
  const r = detectCrisis('我梦到自　杀');
  expect(r.level).toBe(1);
});

test('归一化 - 多空格穿插"想 死 了"仍触发一级', () => {
  const r = detectCrisis('醒来后我 想 死 了');
  expect(r.level).toBe(1);
});

test('归一化 - 零宽空格 U+200B 插入"自​杀"仍触发一级', () => {
  const r = detectCrisis('梦里我​自​杀​了');
  expect(r.level).toBe(1);
});

test('归一化 - 零宽连接符 U+200D / BOM U+FEFF 插入仍触发一级', () => {
  const r = detectCrisis('我想‍死﻿');
  expect(r.level).toBe(1);
});

test('归一化 - 繁体"自殺"仍触发一级', () => {
  const r = detectCrisis('我梦到自殺');
  expect(r.level).toBe(1);
});

test('归一化 - 繁体"跳樓"仍触发一级', () => {
  const r = detectCrisis('梦里我跳樓了');
  expect(r.level).toBe(1);
});

test('归一化 - 繁体"割腕"仍触发一级', () => {
  const r = detectCrisis('梦到自己割腕');
  expect(r.level).toBe(1);
});

test('归一化 - 繁体 + 零宽 + 空格混合规避仍触发一级', () => {
  const r = detectCrisis('我 想​ 自 殺');
  expect(r.level).toBe(1);
});

test('归一化 - 全角英文 ｋｉｌｌ ｍｙｓｅｌｆ 仍触发一级(en)', () => {
  const r = detectCrisis('ｋｉｌｌ　ｍｙｓｅｌｆ', 'en-US');
  expect(r.level).toBe(1);
});

test('归一化 - 英文带空格 k i l l myself 仍触发一级(en)', () => {
  const r = detectCrisis('i want to k i l l myself', 'en-US');
  expect(r.level).toBe(1);
});

// ───────────────────────── 委婉自杀表达升入一级（审计 F04-04） ─────────────────────────

test('委婉语 - "想解脱"触发一级', () => {
  const r = detectCrisis('好累，只想解脱');
  expect(r.level).toBe(1);
  expect(r.action).toBe('redirect');
});

test('委婉语 - "解脱"触发一级', () => {
  const r = detectCrisis('如果能解脱就好了');
  expect(r.level).toBe(1);
});

test('委婉语 - "不想撑了"触发一级', () => {
  const r = detectCrisis('真的不想撑了');
  expect(r.level).toBe(1);
});

test('委婉语 - "撑不下去"触发一级（由二级提级）', () => {
  const r = detectCrisis('我快撑不下去');
  expect(r.level).toBe(1);
});

test('委婉语 - "活着没意义"触发一级', () => {
  const r = detectCrisis('觉得活着没意义');
  expect(r.level).toBe(1);
});

test('委婉语 - "了结自己"触发一级', () => {
  const r = detectCrisis('有时候想了结自己');
  expect(r.level).toBe(1);
});

test('委婉语 - 梦境语境"不想醒了"触发一级', () => {
  const r = detectCrisis('好想睡着就不想醒了');
  expect(r.level).toBe(1);
});

test('委婉语 - "睡过去就好了"触发一级', () => {
  const r = detectCrisis('要是能睡过去就好了');
  expect(r.level).toBe(1);
});

test('委婉语 - "一了百了"触发一级', () => {
  const r = detectCrisis('一了百了多省心');
  expect(r.level).toBe(1);
});

// ───────────────────────── normalize() 单元行为 ─────────────────────────

test('normalize - 去空白 + 去零宽 + 繁简 + 小写', () => {
  expect(normalize('自 杀')).toBe('自杀');
  expect(normalize('自​杀')).toBe('自杀');
  expect(normalize('自殺')).toBe('自杀');
  expect(normalize('ＫＩＬＬ')).toBe('kill');
  expect(normalize('  ')).toBe('');
  expect(normalize('')).toBe('');
});

test('normalize - 不误伤正常梦境（不放宽语义）', () => {
  // 归一化只去空白/零宽/繁简，不做谐音拆字，普通描述仍是 0 级
  const r = detectCrisis('我梦到自己在海边飞翔，看到了夕阳');
  expect(r.level).toBe(0);
});
