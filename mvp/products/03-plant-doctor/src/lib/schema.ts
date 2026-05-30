/**
 * 诊断结果 JSON Schema（zod + TypeScript）
 *
 * 严格遵守 codex 修订版（compliance-checklist § 3.B）：
 * - likelihood: '高/中/低'（**不**用百分比）
 * - recovery_outlook: '高/中/低'（**不**用百分比）
 * - 不含 probability / recovery_chance 字段
 */

import { z } from 'zod';

export const Likelihood = z.enum(['高', '中', '低']);
export type Likelihood = z.infer<typeof Likelihood>;

export const Severity = z.enum(['轻', '中', '重']);
export type Severity = z.infer<typeof Severity>;

export const CalendarType = z.enum([
  'watering',
  'fertilizing',
  'lighting',
  'ventilation',
  'observation',
  'repotting',
  'consult', // 咨询本地园艺师（替代 codex 删除的 pesticide）
]);
export type CalendarType = z.infer<typeof CalendarType>;

export const DiagnosisItem = z.object({
  cause: z.string(),
  likelihood: Likelihood,
  evidence: z.string(),
  severity: Severity,
});
export type DiagnosisItem = z.infer<typeof DiagnosisItem>;

export const Prognosis = z.object({
  recovery_outlook: Likelihood, // 高 / 中 / 低
  time_to_observe: z.string(),
  fallback_if_fail: z.string(),
});
export type Prognosis = z.infer<typeof Prognosis>;

export const CalendarDay = z.object({
  day: z.number().int().min(1).max(30),
  action: z.string(),
  type: CalendarType,
});
export type CalendarDay = z.infer<typeof CalendarDay>;

export const DiagnosisResult = z.object({
  plant_name: z.string(),
  scientific_name: z.string(),
  confidence: z.number().min(0).max(1),
  image_quality_ok: z.boolean(),
  image_quality_feedback: z.string(),
  diagnosis: z.array(DiagnosisItem),
  action_steps: z.array(z.string()),
  prognosis: Prognosis,
  calendar_30d: z.array(CalendarDay),
  disclaimer: z.string(),
});
export type DiagnosisResult = z.infer<typeof DiagnosisResult>;

/** 食用作物白名单（结果页加额外安全提示） */
export const EDIBLE_PLANTS: readonly string[] = [
  '番茄',
  '西红柿',
  '辣椒',
  '草莓',
  '黄瓜',
  '生菜',
  '苦菊',
  '茄子',
  '青菜',
  '小油菜',
  '葱',
  '香菜',
  '薄荷',
  '罗勒',
  '迷迭香',
  '柠檬',
  '蓝莓',
  '葡萄',
];

export function isEdible(plantName: string): boolean {
  if (!plantName) return false;
  return EDIBLE_PLANTS.some((p) => plantName.includes(p));
}
