/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  applyDraft,
  buildDemoCards,
  createCountdown,
  exportBackup,
  importBackup,
  loadCards,
  loadSettings,
  persistCards,
  persistSettings,
} from './storage';
import type { Countdown, CountdownDraft } from './types';

const STORAGE_KEY = 'countdown-pro:cards';
const SETTINGS_KEY = 'countdown-pro:settings';

function makeDraft(over: Partial<CountdownDraft> = {}): CountdownDraft {
  return {
    title: '婚礼',
    targetDate: '2026-09-01',
    type: 'countdown',
    emoji: '💒',
    theme: 'pink',
    note: '记得提前订花',
    unit: 'day',
    notify: false,
    ...over,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe('storage.persistCards / loadCards', () => {
  it('round-trips card list through localStorage', () => {
    const card: Countdown = createCountdown(makeDraft());
    persistCards([card]);

    const loaded = loadCards();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.title).toBe('婚礼');
    expect(loaded[0]?.theme).toBe('pink');
  });

  it('returns empty list when storage is empty', () => {
    expect(loadCards()).toEqual([]);
  });

  it('returns empty list when storage payload is malformed', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not-json');
    expect(loadCards()).toEqual([]);
  });

  it('rejects payload with wrong schema (no version field)', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ cards: [{ id: 'x' }] }));
    expect(loadCards()).toEqual([]);
  });

  it('rejects payload with invalid card shape', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, cards: [{ id: 'x', title: 'no-theme' }] }),
    );
    expect(loadCards()).toEqual([]);
  });
});

describe('storage.persistSettings / loadSettings', () => {
  it('round-trips settings through localStorage', () => {
    persistSettings({ defaultTheme: 'cyber', showLunar: true, onboardingDismissed: true });
    expect(loadSettings()).toEqual({
      defaultTheme: 'cyber',
      showLunar: true,
      onboardingDismissed: true,
    });
  });

  it('falls back to DEFAULT_SETTINGS when storage is empty', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('falls back to DEFAULT_SETTINGS when stored payload has wrong shape', () => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ defaultTheme: 'unknown' }));
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
});

describe('storage.createCountdown / applyDraft', () => {
  it('generates id + timestamps for a new card', () => {
    const card = createCountdown(makeDraft({ title: 'A' }));
    expect(card.id).toBeTruthy();
    expect(card.title).toBe('A');
    expect(card.createdAt).toBeTruthy();
    expect(card.updatedAt).toBe(card.createdAt);
  });

  it('applyDraft updates timestamp but keeps id + createdAt', () => {
    const original = createCountdown(makeDraft({ title: 'A' }));
    // Wait a tick so updatedAt differs
    const next = applyDraft(original, makeDraft({ title: 'B' }));
    expect(next.id).toBe(original.id);
    expect(next.createdAt).toBe(original.createdAt);
    expect(next.title).toBe('B');
    expect(next.updatedAt >= original.updatedAt).toBe(true);
  });
});

describe('storage.buildDemoCards', () => {
  it('returns three seeded cards covering both countdown and countup', () => {
    const demo = buildDemoCards();
    expect(demo).toHaveLength(3);
    expect(demo.some((c) => c.type === 'countup')).toBe(true);
    expect(demo.some((c) => c.type === 'countdown')).toBe(true);
  });
});

describe('storage.exportBackup / importBackup', () => {
  it('exports current state as JSON string parseable by importBackup', () => {
    const card = createCountdown(makeDraft());
    persistCards([card]);
    persistSettings({ defaultTheme: 'film', showLunar: false, onboardingDismissed: true });

    const exported = exportBackup();
    expect(exported).toContain('cards');

    // Wipe and re-import.
    window.localStorage.clear();
    const parsed = importBackup(exported);
    expect(parsed.cards).toHaveLength(1);
    expect(parsed.settings?.defaultTheme).toBe('film');
    expect(loadCards()).toHaveLength(1);
    expect(loadSettings().defaultTheme).toBe('film');
  });

  it('throws on invalid backup payload', () => {
    expect(() => importBackup('{not-json')).toThrow();
    expect(() => importBackup(JSON.stringify({ foo: 'bar' }))).toThrow('备份文件无效');
  });
});
