/**
 * lintAction 单元测试 (Vitest)
 * 运行：npm test
 *
 * 双重保险合规过滤器的命脉测试。
 * lintText 单 case（含归一化绕过对抗）+ lintDiagnosisResult 整体清洗 case
 * + normalize() 归一化单测。
 */

import { describe, test, expect } from 'vitest';

import { lintText, lintDiagnosisResult, normalize, SAFE_REPLACEMENT } from './lintAction';
import type { DiagnosisResult } from './schema';

describe('lintText', () => {
  test('清洁文本不变', () => {
    const r = lintText('立刻断水，把花盆从托盘中取出晾干');
    expect(r.hit).toBe(false);
    expect(r.cleaned).toBe('立刻断水，把花盆从托盘中取出晾干');
    expect(r.matches).toEqual([]);
  });

  test('命中"多菌灵"通用名', () => {
    const r = lintText('用 70% 多菌灵可湿性粉剂 1:1000 喷洒 3 次');
    expect(r.hit).toBe(true);
    expect(r.cleaned).toBe(SAFE_REPLACEMENT);
    expect(r.matches).toContain('多菌灵');
  });

  test('命中"波尔多液"通用名', () => {
    const r = lintText('喷波尔多液保护叶片');
    expect(r.hit).toBe(true);
    expect(r.cleaned).toBe(SAFE_REPLACEMENT);
  });

  test('命中"绿亨一号"商品名', () => {
    const r = lintText('用绿亨一号灌根');
    expect(r.hit).toBe(true);
    expect(r.cleaned).toBe(SAFE_REPLACEMENT);
  });

  test('命中稀释比例 1:1000', () => {
    const r = lintText('请按 1:1000 比例稀释后使用');
    expect(r.hit).toBe(true);
    expect(r.cleaned).toBe(SAFE_REPLACEMENT);
    expect(r.matches.some((m) => m.includes('1') && m.includes('1000'))).toBe(true);
  });

  test('命中剂量 5ml/L', () => {
    const r = lintText('按 5ml/L 稀释');
    expect(r.hit).toBe(true);
    expect(r.cleaned).toBe(SAFE_REPLACEMENT);
  });

  test('命中"喷洒 3 次"频次', () => {
    const r = lintText('每周喷洒 3 次');
    expect(r.hit).toBe(true);
    expect(r.cleaned).toBe(SAFE_REPLACEMENT);
  });

  test('普通百分比（如 70% 颗粒土）不应误伤', () => {
    const r = lintText('颗粒土比例 70% 以上');
    expect(r.hit).toBe(false);
  });

  test('民间偏方"小苏打溶液"也命中', () => {
    const r = lintText('用小苏打溶液擦叶面');
    expect(r.hit).toBe(true);
    expect(r.cleaned).toBe(SAFE_REPLACEMENT);
  });

  // ---- 归一化绕过对抗（A3-03-3 / A1-F-03）----

  test('中文农药名插空格"多 菌 灵"仍命中', () => {
    const r = lintText('建议喷一点 多 菌 灵 控制');
    expect(r.hit).toBe(true);
    expect(r.cleaned).toBe(SAFE_REPLACEMENT);
    expect(r.matches).toContain('多菌灵');
  });

  test('中文农药名插连字符"多-菌灵"仍命中', () => {
    const r = lintText('用多-菌灵灌根');
    expect(r.hit).toBe(true);
    expect(r.matches).toContain('多菌灵');
  });

  test('"波尔多 液"夹空格仍命中', () => {
    const r = lintText('叶面喷波尔多 液');
    expect(r.hit).toBe(true);
    expect(r.matches).toContain('波尔多液');
  });

  test('繁体"多菌靈"命中', () => {
    const r = lintText('噴多菌靈保護');
    expect(r.hit).toBe(true);
    expect(r.cleaned).toBe(SAFE_REPLACEMENT);
  });

  test('繁体"敵敵畏"命中', () => {
    const r = lintText('用敵敵畏處理');
    expect(r.hit).toBe(true);
  });

  test('插零宽空格的"多​菌​灵"命中', () => {
    // 多​菌​灵
    const r = lintText('喷多​菌​灵');
    expect(r.hit).toBe(true);
    expect(r.matches).toContain('多菌灵');
  });

  test('英文通用名 carbendazim 命中', () => {
    const r = lintText('Apply carbendazim to the soil');
    expect(r.hit).toBe(true);
    expect(r.cleaned).toBe(SAFE_REPLACEMENT);
    expect(r.matches).toContain('carbendazim');
  });

  test('英文通用名大小写混合 Glyphosate 命中', () => {
    const r = lintText('Use Glyphosate weekly');
    expect(r.hit).toBe(true);
    expect(r.matches).toContain('glyphosate');
  });

  test('英文通用名 mancozeb / imidacloprid 命中', () => {
    expect(lintText('spray mancozeb').hit).toBe(true);
    expect(lintText('imidacloprid drench').hit).toBe(true);
  });

  test('"bordeaux mixture"（波尔多液英文）命中', () => {
    const r = lintText('apply bordeaux mixture');
    expect(r.hit).toBe(true);
    expect(r.matches).toContain('bordeaux');
  });

  test('全角数字稀释比例"１：１０００"命中', () => {
    const r = lintText('按 １：１０００ 稀释');
    expect(r.hit).toBe(true);
    expect(r.cleaned).toBe(SAFE_REPLACEMENT);
  });

  test('普通英文护理文本不误伤', () => {
    const r = lintText('Move the plant to a brighter spot and reduce watering');
    expect(r.hit).toBe(false);
  });

  test('含"碳/水/光"等正常字的中文不误伤', () => {
    const r = lintText('增加散射光照，控制浇水，保持通风即可');
    expect(r.hit).toBe(false);
  });
});

describe('normalize', () => {
  test('去空白 + 去零宽 + 小写', () => {
    expect(normalize('多 菌 灵')).toBe('多菌灵');
    expect(normalize('多​菌​灵')).toBe('多菌灵');
    expect(normalize('Carben Dazim')).toBe('carbendazim');
  });

  test('NFKC 折叠全角', () => {
    expect(normalize('１２３')).toBe('123');
    expect(normalize('ＡＢＣ')).toBe('abc');
  });

  test('去连字符 / 点号 / 斜杠等分隔符', () => {
    expect(normalize('多-菌.灵')).toBe('多菌灵');
    expect(normalize('a/b\\c')).toBe('abc');
  });

  test('非字符串 / 空值安全', () => {
    expect(normalize('')).toBe('');
    // @ts-expect-error 故意传非字符串
    expect(normalize(null)).toBe('');
  });
});

describe('lintDiagnosisResult 整体清洗', () => {
  test('命中 action_steps 中的农药名 + 稀释比例 → 替换并报告字段', () => {
    const input: DiagnosisResult = {
      plant_name: '玉露',
      scientific_name: 'Haworthia cooperi',
      confidence: 0.9,
      image_quality_ok: true,
      image_quality_feedback: '',
      diagnosis: [
        {
          cause: '黑腐病',
          likelihood: '高',
          evidence: '茎基部黑褐色',
          severity: '重',
        },
      ],
      action_steps: [
        '立刻断水脱盆晾干', // 清洁
        '用 70% 多菌灵 1:1000 灌根', // 命中
        '改善通风',
      ],
      prognosis: {
        recovery_outlook: '中',
        time_to_observe: '2-3 周',
        fallback_if_fail: '若 14 天后仍恶化，剪取顶芽扦插',
      },
      calendar_30d: [
        { day: 1, action: '断水移至通风处', type: 'watering' },
        { day: 7, action: '喷波尔多液保护', type: 'consult' }, // 命中
      ],
      disclaimer: '本诊断由 AI 基于图像生成，仅供参考',
    };

    const { result, report } = lintDiagnosisResult(input);

    // 验证：被替换的字段是安全话术
    expect(result.action_steps[1]).toBe(SAFE_REPLACEMENT);
    expect(result.calendar_30d[1]?.action).toBe(SAFE_REPLACEMENT);

    // 验证：清洁字段没动
    expect(result.action_steps[0]).toBe('立刻断水脱盆晾干');
    expect(result.action_steps[2]).toBe('改善通风');
    expect(result.calendar_30d[0]?.action).toBe('断水移至通风处');

    // 报告里有命中
    expect(report.hits).toBeGreaterThanOrEqual(2);
    expect(report.fields).toContain('action_steps[1]');
    expect(report.fields).toContain('calendar_30d[1].action');
    expect(report.matchedTokens).toContain('多菌灵');
    expect(report.matchedTokens).toContain('波尔多液');
  });

  test('全清洁的 DiagnosisResult，hits=0', () => {
    const input: DiagnosisResult = {
      plant_name: '玉露',
      scientific_name: 'Haworthia cooperi',
      confidence: 0.9,
      image_quality_ok: true,
      image_quality_feedback: '',
      diagnosis: [
        {
          cause: '浇水过多致黑腐',
          likelihood: '高',
          evidence: '茎基部黑褐色 + 叶片透明发软',
          severity: '重',
        },
      ],
      action_steps: ['立刻断水脱盆晾干', '切除发软叶片至健康组织', '改善通风'],
      prognosis: {
        recovery_outlook: '中',
        time_to_observe: '2-3 周',
        fallback_if_fail: '若 14 天后仍恶化，建议剪取顶芽重新扦插',
      },
      calendar_30d: [{ day: 1, action: '断水移至通风处', type: 'watering' }],
      disclaimer: '本诊断由 AI 基于图像生成，仅供参考',
    };

    const { report } = lintDiagnosisResult(input);
    expect(report.hits).toBe(0);
    expect(report.fields).toEqual([]);
    expect(report.matchedTokens).toEqual([]);
  });
});
