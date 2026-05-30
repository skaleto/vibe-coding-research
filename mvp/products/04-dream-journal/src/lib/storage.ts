/**
 * localStorage 抽象，纯客户端使用。
 * MVP 阶段没有真实账号体系，所有数据本地存。
 */

import type { DreamRecord } from './types';

const STORAGE_KEY = 'dream-journal:dreams:v1';
const ACK_KEY = 'dream-journal:first-launch-ack';

export function loadDreams(): DreamRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DreamRecord[];
  } catch {
    return [];
  }
}

export function saveDream(record: DreamRecord): void {
  if (typeof window === 'undefined') return;
  const all = loadDreams();
  const idx = all.findIndex((d) => d.id === record.id);
  if (idx === -1) {
    all.unshift(record);
  } else {
    all[idx] = record;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function loadDream(id: string): DreamRecord | null {
  return loadDreams().find((d) => d.id === id) ?? null;
}

export function deleteDream(id: string): void {
  if (typeof window === 'undefined') return;
  const all = loadDreams().filter((d) => d.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function hasAcknowledgedFirstLaunch(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(ACK_KEY) === '1';
}

export function ackFirstLaunch(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACK_KEY, '1');
}

export function newDreamId(): string {
  return `dream-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
