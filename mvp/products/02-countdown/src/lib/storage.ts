import { z } from 'zod';
import type { Countdown, CountdownDraft, ThemeId, UserSettings } from './types';

const STORAGE_KEY = 'countdown-pro:cards';
const SETTINGS_KEY = 'countdown-pro:settings';
const SCHEMA_VERSION = 1;

const themeIdSchema: z.ZodType<ThemeId> = z.enum([
  'pink',
  'minimal',
  'film',
  'ink',
  'cyber',
]);

const countdownSchema = z.object({
  id: z.string(),
  title: z.string().max(80),
  targetDate: z.string(),
  type: z.enum(['countdown', 'countup']),
  emoji: z.string().max(8),
  theme: themeIdSchema,
  note: z.string().max(400),
  createdAt: z.string(),
  updatedAt: z.string(),
  unit: z.enum(['day', 'week', 'month', 'year']),
  notify: z.boolean(),
});

const storedShape = z.object({
  version: z.number(),
  cards: z.array(countdownSchema),
});

const settingsSchema = z.object({
  defaultTheme: themeIdSchema,
  showLunar: z.boolean(),
  onboardingDismissed: z.boolean(),
});

export const DEFAULT_SETTINGS: UserSettings = {
  defaultTheme: 'pink',
  showLunar: false,
  onboardingDismissed: false,
};

/** Demo cards seeded on first run so the empty state isn't sad. */
export function buildDemoCards(): Countdown[] {
  const now = new Date();
  const iso = (offsetDays: number): string => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  };
  const stamp = now.toISOString();
  return [
    {
      id: 'demo-1',
      title: '考研倒计时',
      targetDate: iso(100),
      type: 'countdown',
      emoji: '📚',
      theme: 'minimal',
      note: '一战上岸，加油。',
      createdAt: stamp,
      updatedAt: stamp,
      unit: 'day',
      notify: true,
    },
    {
      id: 'demo-2',
      title: '姐姐的婚礼',
      targetDate: iso(32),
      type: 'countdown',
      emoji: '💒',
      theme: 'pink',
      note: '记得提前订花，姐妹篇贺词写好。',
      createdAt: stamp,
      updatedAt: stamp,
      unit: 'day',
      notify: true,
    },
    {
      id: 'demo-3',
      title: '在一起',
      targetDate: iso(-365),
      type: 'countup',
      emoji: '💞',
      theme: 'film',
      note: '从相识到此刻，正在数。',
      createdAt: stamp,
      updatedAt: stamp,
      unit: 'day',
      notify: false,
    },
  ];
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadCards(): Countdown[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = storedShape.safeParse(JSON.parse(raw));
    if (!parsed.success) return [];
    return parsed.data.cards;
  } catch (err) {
    console.warn('[storage] failed to read cards', err);
    return [];
  }
}

export function persistCards(cards: Countdown[]): void {
  if (!isBrowser()) return;
  try {
    const payload = { version: SCHEMA_VERSION, cards };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('[storage] failed to write cards', err);
  }
}

export function loadSettings(): UserSettings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = settingsSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return DEFAULT_SETTINGS;
    return parsed.data;
  } catch (err) {
    console.warn('[storage] failed to read settings', err);
    return DEFAULT_SETTINGS;
  }
}

export function persistSettings(settings: UserSettings): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('[storage] failed to write settings', err);
  }
}

export function createCountdown(draft: CountdownDraft): Countdown {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `c-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const stamp = new Date().toISOString();
  return {
    ...draft,
    id,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function applyDraft(
  existing: Countdown,
  draft: CountdownDraft,
): Countdown {
  return {
    ...existing,
    ...draft,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Serialise current cards + settings into a downloadable JSON blob string.
 * Used by Settings page "导出备份" button.
 */
export function exportBackup(): string {
  const cards = loadCards();
  const settings = loadSettings();
  return JSON.stringify(
    { version: SCHEMA_VERSION, exportedAt: new Date().toISOString(), cards, settings },
    null,
    2,
  );
}

const backupSchema = z.object({
  version: z.number(),
  exportedAt: z.string().optional(),
  cards: z.array(countdownSchema),
  settings: settingsSchema.optional(),
});

export type BackupImport = z.infer<typeof backupSchema>;

export function importBackup(raw: string): BackupImport {
  const parsed = backupSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error('备份文件无效，请检查格式');
  }
  persistCards(parsed.data.cards);
  if (parsed.data.settings) persistSettings(parsed.data.settings);
  return parsed.data;
}
