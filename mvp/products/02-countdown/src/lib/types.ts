/**
 * Shared domain types for 倒数日 Pro MVP.
 * Keep these tiny + serialisable (JSON-safe) so localStorage round-trips trivially.
 */

export type CountdownType = 'countdown' | 'countup';

export type ThemeId = 'pink' | 'minimal' | 'film' | 'ink' | 'cyber';

export type TimeUnit = 'day' | 'week' | 'month' | 'year';

export interface Countdown {
  /** uuid (crypto.randomUUID) */
  id: string;
  title: string;
  /** ISO date string (yyyy-MM-dd). Always stored at day-precision. */
  targetDate: string;
  type: CountdownType;
  /** Single emoji char (or short grapheme cluster) used as default icon */
  emoji: string;
  /** which of the 5 themes overrides the global theme for this card */
  theme: ThemeId;
  /** Optional free-form note */
  note: string;
  /** ISO timestamp (Date.toISOString) of creation. */
  createdAt: string;
  /** Optional, for ordering. Defaults to createdAt. */
  updatedAt: string;
  /** Preferred display unit (day by default). */
  unit: TimeUnit;
  /** Mock notification toggle. iOS path lit up in native shell. */
  notify: boolean;
}

export interface UserSettings {
  /** Global theme used when a card does not specify its own. */
  defaultTheme: ThemeId;
  /** Whether to display lunar date in detail page (mock; data only). */
  showLunar: boolean;
  /** Whether the welcome onboarding tip has been dismissed. */
  onboardingDismissed: boolean;
}

export type CountdownDraft = Omit<Countdown, 'id' | 'createdAt' | 'updatedAt'>;
