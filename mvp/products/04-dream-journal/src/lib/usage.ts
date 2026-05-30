/**
 * 反沉迷使用度量（合规 § 4.D 硬性项 / 审计 F04-01）
 *
 * compliance-checklist § 4.D：「反沉迷弹窗：连续 7 天 / 单日 30 次记录梦境
 * 自动触发休息提示」。本模块只负责**计数与判定**，弹窗 UI 见
 * components/AntiAddictionGate.tsx。
 *
 * 设计：
 * - 纯 localStorage，无账号体系；与隐私一致，**不存梦境内容**，只存
 *   「某天记录了几条」这一计数。
 * - 单日计数：按本地日期 YYYY-MM-DD 累加。
 * - 连续天数：每次记录时，若上次记录日是「昨天」则连续 +1，是「今天」
 *   则不变，否则（断签）重置为 1。
 * - 触发后写「今日已提示」标记，避免同一天反复弹（非阻断、不打扰）。
 */

const KEY = 'dream-journal:usage:v1';

/**
 * 记录梦境后派发的 window 事件名。
 * DreamInput 保存成功后 dispatch，AntiAddictionGate 监听后重新判定，
 * 实现「计数逻辑」与「全局弹窗 UI」的解耦。
 */
export const DREAM_RECORDED_EVENT = 'dream-journal:dream-recorded';

/** 在浏览器环境派发「已记录一条梦境」事件。 */
export function emitDreamRecorded(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(DREAM_RECORDED_EVENT));
}

/** 触发阈值（与 compliance-checklist § 4.D 对齐）。 */
export const STREAK_THRESHOLD = 7; // 连续记录天数
export const DAILY_THRESHOLD = 30; // 单日记录次数

export type RestReminderReason = 'streak' | 'daily';

interface UsageState {
  /** 最近一次记录的本地日期，YYYY-MM-DD */
  lastDay: string | null;
  /** lastDay 当天的记录次数 */
  todayCount: number;
  /** 截至 lastDay 的连续记录天数 */
  streak: number;
  /** 已经弹过休息提示的日期（避免同一天重复打扰） */
  remindedOn: string | null;
}

const EMPTY: UsageState = {
  lastDay: null,
  todayCount: 0,
  streak: 0,
  remindedOn: null,
};

/** 本地日期 YYYY-MM-DD（按设备时区，跨天判定用）。 */
export function localDayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function read(): UsageState {
  if (typeof window === 'undefined') return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<UsageState>;
    return {
      lastDay: typeof parsed.lastDay === 'string' ? parsed.lastDay : null,
      todayCount: typeof parsed.todayCount === 'number' ? parsed.todayCount : 0,
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      remindedOn: typeof parsed.remindedOn === 'string' ? parsed.remindedOn : null,
    };
  } catch {
    return { ...EMPTY };
  }
}

function write(state: UsageState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* silent */
  }
}

/** 两个 YYYY-MM-DD 之间相差的天数（a - b，按日历日）。 */
function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const ta = Date.UTC(ay ?? 0, (am ?? 1) - 1, ad ?? 1);
  const tb = Date.UTC(by ?? 0, (bm ?? 1) - 1, bd ?? 1);
  return Math.round((ta - tb) / 86_400_000);
}

/**
 * 记录一次「记录梦境」事件，更新单日计数与连续天数。
 * 在 DreamInput 保存成功后调用（与 bumpStat('recorded') 同处）。
 */
export function recordDreamUsage(now: Date = new Date()): UsageState {
  const today = localDayKey(now);
  const prev = read();

  let { todayCount, streak } = prev;
  if (prev.lastDay === today) {
    todayCount += 1; // 同一天，次数累加，连续天数不变
  } else if (prev.lastDay && dayDiff(today, prev.lastDay) === 1) {
    todayCount = 1; // 昨天有记录 → 连续 +1
    streak += 1;
  } else {
    todayCount = 1; // 首次或断签 → 重置连续为 1
    streak = 1;
  }

  const next: UsageState = {
    ...prev,
    lastDay: today,
    todayCount,
    streak,
  };
  write(next);
  return next;
}

export interface RestReminderDecision {
  show: boolean;
  reason: RestReminderReason | null;
  streak: number;
  todayCount: number;
}

/**
 * 判定是否应展示休息提示。
 *
 * 命中条件（任一）：连续天数 ≥ 7，或当天次数 ≥ 30。
 * 且当天尚未提示过（remindedOn !== today）。
 *
 * 仅判定，不改状态；调用方在用户看到弹窗后再调 markReminded()。
 */
export function evaluateRestReminder(now: Date = new Date()): RestReminderDecision {
  const today = localDayKey(now);
  const s = read();

  // 仅在「今天有记录」时才有意义；隔天打开不应拿旧 streak 弹窗
  const isToday = s.lastDay === today;
  const todayCount = isToday ? s.todayCount : 0;
  const streak = isToday ? s.streak : 0;

  if (s.remindedOn === today) {
    return { show: false, reason: null, streak, todayCount };
  }

  if (todayCount >= DAILY_THRESHOLD) {
    return { show: true, reason: 'daily', streak, todayCount };
  }
  if (streak >= STREAK_THRESHOLD) {
    return { show: true, reason: 'streak', streak, todayCount };
  }
  return { show: false, reason: null, streak, todayCount };
}

/** 标记「今天已提示」，避免同一天重复弹窗。 */
export function markReminded(now: Date = new Date()): void {
  const prev = read();
  write({ ...prev, remindedOn: localDayKey(now) });
}

/** 仅测试用：清空使用度量。 */
export function __resetUsageForTest(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}
