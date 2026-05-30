import { z } from 'zod';

// 11 个 mood_tag（含默认）
export const MOOD_TAGS = [
  '撒娇',
  '求食',
  '警惕',
  '困倦',
  '求摸摸',
  '抱怨',
  '想出门',
  '开心',
  '闹脾气',
  '好奇',
  '默认',
] as const;

export type MoodTag = (typeof MOOD_TAGS)[number];

export const PET_SPECIES = ['cat', 'dog', 'unknown'] as const;
export type PetSpecies = (typeof PET_SPECIES)[number];

export const PITCH = ['high', 'low'] as const;
export type Pitch = (typeof PITCH)[number];

export const BURST = ['short_burst', 'long_continuous', 'silent'] as const;
export type Burst = (typeof BURST)[number];

export const AudioFeaturesSchema = z.object({
  pitch: z.enum(PITCH),
  burst: z.enum(BURST),
});
export type AudioFeatures = z.infer<typeof AudioFeaturesSchema>;

// API 入参
export const GenerateRequestSchema = z.object({
  petType: z.enum(PET_SPECIES),
  petName: z.string().min(1).max(20),
  audioDurationSec: z.number().min(0).max(15),
  audioFeatures: AudioFeaturesSchema,
});
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

// LLM 输出 schema
export const PetCardSchema = z.object({
  translation: z.array(z.string()).min(3).max(5),
  mood_tag: z.string(),
  emoji_set: z.array(z.string()).length(3),
  disclaimer: z.string(),
});
export type PetCard = z.infer<typeof PetCardSchema>;

// 持久化到 localStorage 的完整结果
export type PetCardResult = PetCard & {
  id: string;
  petType: PetSpecies;
  petName: string;
  audioDurationSec: number;
  createdAt: number;
};

export const DISCLAIMER = '⚠️ 仅供娱乐，AI 生成宠物心情卡片';

// 海报风格枚举
export const POSTER_STYLES = ['style1', 'style2', 'style3'] as const;
export type PosterStyle = (typeof POSTER_STYLES)[number];

export const POSTER_STYLE_NAMES: Record<PosterStyle, string> = {
  style1: '萌系卡通',
  style2: '简约可爱',
  style3: '复古胶片',
};
