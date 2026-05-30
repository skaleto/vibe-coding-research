import { create } from 'zustand';
import {
  DEFAULT_SETTINGS,
  applyDraft,
  buildDemoCards,
  createCountdown,
  loadCards,
  loadSettings,
  persistCards,
  persistSettings,
} from './storage';
import type { Countdown, CountdownDraft, ThemeId, UserSettings } from './types';

interface CountdownStore {
  hydrated: boolean;
  cards: Countdown[];
  settings: UserSettings;
  hydrate: () => void;
  addCard: (draft: CountdownDraft) => Countdown;
  updateCard: (id: string, draft: CountdownDraft) => void;
  deleteCard: (id: string) => void;
  setSettings: (patch: Partial<UserSettings>) => void;
  setDefaultTheme: (theme: ThemeId) => void;
  replaceAll: (cards: Countdown[], settings?: UserSettings) => void;
  resetWithDemo: () => void;
}

export const useCountdownStore = create<CountdownStore>((set, get) => ({
  hydrated: false,
  cards: [],
  settings: DEFAULT_SETTINGS,
  hydrate: () => {
    if (typeof window === 'undefined') return;
    if (get().hydrated) return;
    let cards = loadCards();
    const settings = loadSettings();
    // Seed demo cards if completely empty + first run.
    if (cards.length === 0 && !settings.onboardingDismissed) {
      cards = buildDemoCards();
      persistCards(cards);
    }
    set({ cards, settings, hydrated: true });
  },
  addCard: (draft) => {
    const card = createCountdown(draft);
    const next = [card, ...get().cards];
    persistCards(next);
    set({ cards: next });
    return card;
  },
  updateCard: (id, draft) => {
    const next = get().cards.map((c) => (c.id === id ? applyDraft(c, draft) : c));
    persistCards(next);
    set({ cards: next });
  },
  deleteCard: (id) => {
    const next = get().cards.filter((c) => c.id !== id);
    persistCards(next);
    set({ cards: next });
  },
  setSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    persistSettings(next);
    set({ settings: next });
  },
  setDefaultTheme: (theme) => {
    const next = { ...get().settings, defaultTheme: theme };
    persistSettings(next);
    set({ settings: next });
  },
  replaceAll: (cards, settings) => {
    persistCards(cards);
    if (settings) persistSettings(settings);
    set({ cards, settings: settings ?? get().settings });
  },
  resetWithDemo: () => {
    const cards = buildDemoCards();
    persistCards(cards);
    set({ cards });
  },
}));

/** Convenience selector — find a single card or undefined. */
export function selectCard(id: string) {
  return (state: CountdownStore) => state.cards.find((c) => c.id === id);
}
