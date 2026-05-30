/**
 * Zod schemas for API input/output + shared TypeScript types.
 */

import { z } from 'zod';

export const NamingTypeSchema = z.enum(['baby', 'company', 'pet', 'nickname', 'penname']);
export type NamingType = z.infer<typeof NamingTypeSchema>;

export const GenderSchema = z.enum(['男孩', '女孩']);
export type Gender = z.infer<typeof GenderSchema>;

export const VibeTagSchema = z.enum([
  '温润灵气',
  '坚毅果敢',
  '聪慧博学',
  '活泼可爱',
  '沉稳大气',
  '诗意自然',
  '古典优雅',
  '现代清新',
]);
export type VibeTag = z.infer<typeof VibeTagSchema>;

export const SourcePreferenceSchema = z.enum([
  '诗经',
  '楚辞',
  '唐诗',
  '宋词',
  '论语',
  '周易',
  '不限',
]);

export const GenerateNamesRequestSchema = z.object({
  type: NamingTypeSchema.default('baby'),
  surname: z.string().min(1).max(4),
  gender: GenderSchema,
  name_length: z.enum(['双字名', '单字名', '不限']).optional(),
  vibe_tags: z.array(z.string()).min(1).max(3),
  taboo: z.string().max(200).optional(),
  source_preference: SourcePreferenceSchema.optional(),
});

export type GenerateNamesRequest = z.infer<typeof GenerateNamesRequestSchema>;

/**
 * LLM 返回的单个名字 schema（不含 verified 字段）
 */
export const NameCandidateSchema = z.object({
  full_name: z.string(),
  given_name: z.string(),
  pinyin_full: z.string(),
  pinyin_tones: z.string(),
  source_book: z.string(),
  source_chapter: z.string(),
  original_quote: z.string(),
  char_meanings: z.record(z.string()),
  explanation: z.string(),
  style_tag: z.string(),
  gender_fit: z.string(),
  stroke_count: z.number().int().nonnegative(),
  use_warning: z.string(),
});
export type NameCandidate = z.infer<typeof NameCandidateSchema>;

/**
 * verifyQuote 校验后追加 verified 字段
 */
export const VerifiedNameSchema = NameCandidateSchema.extend({
  verified: z.boolean(),
  verify_reason: z.string().optional(),
  matched_verse: z.string().optional(),
  warning_chars: z.array(z.string()).optional(),
});
export type VerifiedName = z.infer<typeof VerifiedNameSchema>;

export const GenerateNamesResponseSchema = z.object({
  names: z.array(VerifiedNameSchema),
  provider: z.enum(['deepseek', 'openai', 'zhipu', 'mock']),
  warning: z.string().optional(),
  meta: z.object({
    total_returned: z.number(),
    verified_count: z.number(),
    filtered_count: z.number(),
    db_version: z.string(),
  }),
});
export type GenerateNamesResponse = z.infer<typeof GenerateNamesResponseSchema>;
