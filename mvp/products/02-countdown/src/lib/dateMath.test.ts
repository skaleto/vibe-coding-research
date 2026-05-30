import { describe, expect, it } from 'vitest';
import { computeView, daysUntil, statusLabel } from './dateMath';
import type { Countdown } from './types';

function isoOffset(days: number): string {
  // Build an ISO yyyy-MM-dd string for "today + days" in **local** time,
  // matching the production helper `today()` which uses local midnight.
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function makeCard(over: Partial<Countdown> = {}): Countdown {
  const created = new Date();
  created.setHours(0, 0, 0, 0);
  return {
    id: 'test',
    title: 'demo',
    targetDate: isoOffset(10),
    type: 'countdown',
    emoji: '🎯',
    theme: 'minimal',
    note: '',
    createdAt: created.toISOString(),
    updatedAt: created.toISOString(),
    unit: 'day',
    notify: false,
    ...over,
  };
}

describe('daysUntil', () => {
  it('returns positive integer for future dates', () => {
    expect(daysUntil(isoOffset(10))).toBe(10);
  });

  it('returns negative integer for past dates', () => {
    expect(daysUntil(isoOffset(-5))).toBe(-5);
  });

  it('returns 0 for today', () => {
    expect(daysUntil(isoOffset(0))).toBe(0);
  });
});

describe('computeView', () => {
  it('countdown future: direction=future, active=true', () => {
    const v = computeView(makeCard({ type: 'countdown', targetDate: isoOffset(7) }));
    expect(v.direction).toBe('future');
    expect(v.value).toBe(7);
    expect(v.active).toBe(true);
    expect(v.unitLabel).toBe('天');
  });

  it('countdown past: direction=past, active=false (已过期)', () => {
    const v = computeView(makeCard({ type: 'countdown', targetDate: isoOffset(-3) }));
    expect(v.direction).toBe('past');
    expect(v.active).toBe(false);
  });

  it('countup past: direction=past, active=true (已经过去)', () => {
    const v = computeView(makeCard({ type: 'countup', targetDate: isoOffset(-30) }));
    expect(v.direction).toBe('past');
    expect(v.value).toBe(30);
    expect(v.active).toBe(true);
  });

  it('respects unit divisor for week / month / year', () => {
    const week = computeView(makeCard({ targetDate: isoOffset(14), unit: 'week' }));
    expect(week.value).toBe(2);
    expect(week.unitLabel).toBe('周');

    const month = computeView(makeCard({ targetDate: isoOffset(60), unit: 'month' }));
    expect(month.value).toBe(2);
    expect(month.unitLabel).toBe('月');
  });
});

describe('statusLabel', () => {
  it('returns 就是今天 for today', () => {
    const card = makeCard({ type: 'countdown', targetDate: isoOffset(0) });
    const view = computeView(card);
    expect(statusLabel(card, view)).toBe('就是今天');
  });

  it('returns 倒数中 for future countdown', () => {
    const card = makeCard({ type: 'countdown', targetDate: isoOffset(10) });
    const view = computeView(card);
    expect(statusLabel(card, view)).toBe('倒数中');
  });

  it('returns 已经过去 for past countup', () => {
    const card = makeCard({ type: 'countup', targetDate: isoOffset(-10) });
    const view = computeView(card);
    expect(statusLabel(card, view)).toBe('已经过去');
  });

  it('returns 已过期 for past countdown', () => {
    const card = makeCard({ type: 'countdown', targetDate: isoOffset(-10) });
    const view = computeView(card);
    expect(statusLabel(card, view)).toBe('已过期');
  });
});
