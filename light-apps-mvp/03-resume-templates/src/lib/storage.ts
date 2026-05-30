import type { ResumeData, TemplateId } from './types';
import { createSampleData } from './sampleData';
import { DEFAULT_TEMPLATE } from './templates';

const KEY_DATA = 'resume:data';
const KEY_TEMPLATE = 'resume:templateId';
const KEY_PAID = 'resume:paid';

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 隐私模式 / 配额满：静默降级（内存态仍可用，仅刷新会丢）
  }
}

export function loadResume(): ResumeData {
  const raw = safeGet(KEY_DATA);
  if (!raw) return createSampleData();
  try {
    const parsed = JSON.parse(raw) as Partial<ResumeData>;
    // 容错合并：旧数据缺字段时用示例补齐结构，避免渲染崩溃
    const base = createSampleData();
    return {
      basics: { ...base.basics, ...(parsed.basics ?? {}) },
      education: Array.isArray(parsed.education) ? parsed.education : base.education,
      work: Array.isArray(parsed.work) ? parsed.work : base.work,
      projects: Array.isArray(parsed.projects) ? parsed.projects : base.projects,
      skills: Array.isArray(parsed.skills) ? parsed.skills : base.skills,
      selfReview: typeof parsed.selfReview === 'string' ? parsed.selfReview : base.selfReview,
    };
  } catch {
    return createSampleData();
  }
}

export function saveResume(data: ResumeData): void {
  safeSet(KEY_DATA, JSON.stringify(data));
}

export function loadTemplateId(): TemplateId {
  const raw = safeGet(KEY_TEMPLATE);
  if (raw === 'minimal' || raw === 'blue' || raw === 'creative' || raw === 'academic') {
    return raw;
  }
  return DEFAULT_TEMPLATE;
}

export function saveTemplateId(id: TemplateId): void {
  safeSet(KEY_TEMPLATE, id);
}

export function loadPaid(): boolean {
  return safeGet(KEY_PAID) === 'true';
}

export function savePaid(paid: boolean): void {
  safeSet(KEY_PAID, paid ? 'true' : 'false');
}

/** 简单防抖，用于自动保存表单 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number,
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
