// Appearance and language: the user's choice, kept in this computer's storage (not in the wallet state, which is
// cleared on logout). "system" follows the operating system.
import React from 'react';

export type Appearance = 'system' | 'light' | 'dark';
export type LanguagePref = 'system' | 'en' | 'zh';
type Prefs = { appearance: Appearance; language: LanguagePref };

const KEYS = { appearance: 'tg.appearance', language: 'tg.language' } as const;
const ALLOWED = {
  appearance: ['system', 'light', 'dark'],
  language: ['system', 'en', 'zh'],
} as const;

function read<K extends keyof Prefs>(key: K): Prefs[K] {
  try {
    const v = window.localStorage.getItem(KEYS[key]);
    if ((ALLOWED[key] as readonly string[]).includes(v)) return v as Prefs[K];
  } catch {
    // storage unavailable: use the default
  }
  return 'system' as Prefs[K];
}

let prefs: Prefs = { appearance: read('appearance'), language: read('language') };
const listeners = new Set<() => void>();

export const getPrefs = (): Prefs => prefs;
export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
  if (!(ALLOWED[key] as readonly string[]).includes(value)) return;
  prefs = { ...prefs, [key]: value };
  try {
    window.localStorage.setItem(KEYS[key], value);
  } catch {
    // not saved, still applied for this session
  }
  listeners.forEach(l => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
/** The current preferences; re-renders when they change (React 17: no useSyncExternalStore). */
export function usePrefs(): Prefs {
  const [, bump] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => subscribe(bump), []);
  return prefs;
}

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');
/** 'light' or 'dark': the choice, or what the system uses right now. */
export const resolveTheme = (a: Appearance = prefs.appearance): 'light' | 'dark' =>
  a === 'system' ? (darkQuery().matches ? 'dark' : 'light') : a;
export const resolveLanguage = (l: LanguagePref = prefs.language): 'en' | 'zh' =>
  l === 'system' ? ((navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en') : l;

/** Keeps body[data-theme] in step with the setting and with the system (when the setting is "system"). */
export function useApplyTheme() {
  const { appearance } = usePrefs();
  React.useEffect(() => {
    const apply = () => {
      document.body.dataset.theme = resolveTheme(appearance);
    };
    apply();
    const q = darkQuery();
    q.addEventListener('change', apply);
    return () => q.removeEventListener('change', apply);
  }, [appearance]);
}
