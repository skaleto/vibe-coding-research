import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';
import type { Countdown, TimeUnit } from './types';

/** Today, 00:00 local. */
export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function parseDate(iso: string): Date {
  const direct = parseISO(iso);
  if (isValid(direct)) return direct;
  return today();
}

/** Number of days between today and target, signed; positive = future. */
export function daysUntil(targetIso: string): number {
  const target = parseDate(targetIso);
  return differenceInCalendarDays(target, today());
}

export interface CountdownView {
  /** Always >= 0. Render "已到达" if zero on countdown type. */
  value: number;
  /** Unit string, eg "天" / "周" / "月" / "年". */
  unitLabel: string;
  /** Direction: 'future' future date, 'past' already past, 'today' today. */
  direction: 'future' | 'past' | 'today';
  /** Raw signed day delta. */
  signedDays: number;
  /** True if user requested countup and date is in the past. */
  active: boolean;
  /** Formatted target date "2026.06.30 周二". */
  formattedTarget: string;
  /** % progress 0..1 from createdAt → targetDate (capped). */
  progress: number;
}

const unitLabels: Record<TimeUnit, string> = {
  day: '天',
  week: '周',
  month: '月',
  year: '年',
};

const unitDivisor: Record<TimeUnit, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
};

export function computeView(card: Countdown): CountdownView {
  const signedDays = daysUntil(card.targetDate);
  const direction = signedDays > 0 ? 'future' : signedDays < 0 ? 'past' : 'today';

  const isCountup = card.type === 'countup';
  // Countdown counts future days; countup counts past days.
  const rawValue = isCountup ? -signedDays : signedDays;
  const absValue = Math.max(0, rawValue);

  const divisor = unitDivisor[card.unit];
  const value = Math.floor(absValue / divisor);
  const unitLabel = unitLabels[card.unit];

  const created = parseDate(card.createdAt);
  const target = parseDate(card.targetDate);
  const totalSpan = Math.max(1, differenceInCalendarDays(target, created));
  const elapsed = Math.max(0, differenceInCalendarDays(today(), created));
  const progress = Math.min(1, Math.max(0, elapsed / totalSpan));

  const formattedTarget = format(target, 'yyyy.MM.dd');

  return {
    value,
    unitLabel,
    direction,
    signedDays,
    active: isCountup ? direction !== 'future' : direction !== 'past',
    formattedTarget,
    progress,
  };
}

/** Short status copy: 倒数 / 正数 / 今天 / 已过去 */
export function statusLabel(card: Countdown, view: CountdownView): string {
  if (view.direction === 'today') return '就是今天';
  if (card.type === 'countup') {
    return view.direction === 'past' ? '已经过去' : '尚未开始';
  }
  return view.direction === 'future' ? '倒数中' : '已过期';
}
