/**
 * 本地存储 —— "我的植物" + 诊断历史 + 日历完成态。
 * 仅 localStorage，刷新保留，换设备/换浏览器不同步（MVP 设计）。
 */

import type { DiagnosisResult } from './schema';

const NS = 'plant-doctor';

const k = (key: string) => `${NS}/${key}`;

export interface SavedDiagnosis {
  id: string;
  createdAt: number;
  /** 用户给植物取的昵称（可空，默认 plant_name） */
  nickname?: string;
  /** 第一张图片的 base64 缩略图 */
  thumb?: string;
  /** 完整诊断结果 */
  result: DiagnosisResult;
  /** Day -> completed */
  calendarChecked: Record<number, boolean>;
  /**
   * 是否为离线 mock 兜底结果（gateway 调用失败时 llm.ts 返回 provider:'mock'）。
   * 为 true 时结果页须显著提示"示例诊断"，不可把 mock 黑腐病伪装成真实诊断（A3-03-4）。
   */
  fallbackUsed?: boolean;
}

function safeGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(k(key));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeSet<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(k(key), JSON.stringify(value));
    return true;
  } catch {
    /* ignore quota */
    return false;
  }
}

// ---------- 配额护栏 ----------

/**
 * "我的植物"历史条数上限。base64 缩略图很重，localStorage 单域名通常 5-10MB，
 * 不设上限会随诊断次数线性堆积直到 safeSet 静默 quota 失败（A3-03-6）。
 * 超限按 createdAt LRU 淘汰最旧条目。
 */
export const MAX_DIAGNOSES = 20;

/**
 * 单张缩略图（base64 data URL）允许写入 localStorage 的上限。
 * imageCompress 目标 ~200KB，但极端图片可能更大；缩略图只用于列表小图，
 * 超过此阈值就丢弃 thumb（列表回退为叶子占位图），避免单条记录吃掉大量配额。
 * 估算 base64 字节数 ≈ 字符串长度 * 3/4。
 */
export const MAX_THUMB_BYTES = 60 * 1024; // 60KB

function estimateDataUrlBytes(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(',');
  const b64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  return Math.ceil((b64.length * 3) / 4);
}

/** 若 thumb 过大则剥离（返回不含 thumb 的副本），保证单条记录不超配额。 */
function capThumb(d: SavedDiagnosis): SavedDiagnosis {
  if (d.thumb && estimateDataUrlBytes(d.thumb) > MAX_THUMB_BYTES) {
    const { thumb: _drop, ...rest } = d;
    return rest;
  }
  return d;
}

/** 按 createdAt 降序保留最近 MAX_DIAGNOSES 条（LRU 淘汰最旧）。 */
function enforceLimit(all: SavedDiagnosis[]): SavedDiagnosis[] {
  if (all.length <= MAX_DIAGNOSES) return all;
  return [...all].sort((a, b) => b.createdAt - a.createdAt).slice(0, MAX_DIAGNOSES);
}

// ---------- 诊断列表 ----------

export function listDiagnoses(): SavedDiagnosis[] {
  return safeGet<SavedDiagnosis[]>('diagnoses') || [];
}

export function getDiagnosis(id: string): SavedDiagnosis | null {
  const all = listDiagnoses();
  return all.find((d) => d.id === id) || null;
}

/**
 * 保存 / 更新一条诊断。
 * 新增时 unshift 到队首并执行条数上限（LRU 淘汰最旧）+ 单图大小检查；
 * 更新已有条目时原地替换（同样过大图检查），不改变顺序。
 * 返回 false 表示写入 localStorage 失败（quota / 隐私模式）。
 */
export function saveDiagnosis(d: SavedDiagnosis): boolean {
  const capped = capThumb(d);
  const all = listDiagnoses();
  const idx = all.findIndex((x) => x.id === capped.id);
  if (idx >= 0) {
    all[idx] = capped;
  } else {
    all.unshift(capped);
  }
  return safeSet('diagnoses', enforceLimit(all));
}

export function deleteDiagnosis(id: string): void {
  const all = listDiagnoses().filter((d) => d.id !== id);
  safeSet('diagnoses', all);
}

export function toggleCalendarDay(id: string, day: number): void {
  const d = getDiagnosis(id);
  if (!d) return;
  d.calendarChecked = { ...d.calendarChecked, [day]: !d.calendarChecked[day] };
  saveDiagnosis(d);
}

export function newId(): string {
  return `diag_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
