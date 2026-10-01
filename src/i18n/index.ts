// English and Traditional Chinese. The language follows the system unless chosen in Settings.
// useT() in components; `{name}` placeholders are filled from the second argument.
import { getPrefs, resolveLanguage, usePrefs } from 'util/prefs';

import en from './en';
import zh from './zh';

export type TKey = keyof typeof en;
const DICTS = { en, zh: zh as Partial<Record<TKey, string>> };

export function translate(
  key: TKey,
  vars: Record<string, string | number> = {},
  lang = resolveLanguage(getPrefs().language)
) {
  const raw = DICTS[lang][key] ?? en[key] ?? key;
  return raw.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

export function useT() {
  const { language } = usePrefs();
  const lang = resolveLanguage(language);
  return (key: TKey, vars?: Record<string, string | number>) => translate(key, vars, lang);
}
