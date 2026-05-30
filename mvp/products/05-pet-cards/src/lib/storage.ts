import type { PetCardResult } from './types';

const STORAGE_KEY = 'pet-cards/results';

export function saveResult(result: PetCardResult): void {
  if (typeof window === 'undefined') return;
  try {
    const list = loadAllResults();
    const next = [result, ...list.filter((r) => r.id !== result.id)].slice(0, 100);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 失败静默：localStorage 满 / 隐私模式
  }
}

export function loadAllResults(): PetCardResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    // 极简校验：必有 id + translation
    return parsed.filter(
      (r): r is PetCardResult =>
        typeof r === 'object' &&
        r !== null &&
        typeof (r as PetCardResult).id === 'string' &&
        Array.isArray((r as PetCardResult).translation)
    );
  } catch {
    return [];
  }
}

export function loadResult(id: string): PetCardResult | null {
  return loadAllResults().find((r) => r.id === id) ?? null;
}

export function deleteResult(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = loadAllResults();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.filter((r) => r.id !== id)));
  } catch {
    // ignore
  }
}

export function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
