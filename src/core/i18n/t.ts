import type { StringKey } from './keys';
import { TRANSLATIONS } from './translations';
import type { Locale } from './types';

const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

export type TranslationVars = Readonly<Record<string, string | number>>;

function interpolate(template: string, vars: TranslationVars): string {
  return template.replace(PLACEHOLDER_RE, (match, name: string) => {
    const val = vars[name];
    if (val === undefined) return match;
    return String(val);
  });
}

// Unknown keys return the key string itself — stable UI fallback. Warn so
// bugs surface during dev. ESLint allows console.warn per our config.
export function t(key: StringKey, locale: Locale, vars: TranslationVars = {}): string {
  const table = TRANSLATIONS[locale];
  const template = table[key];
  if (template === undefined) {
    console.warn(`[i18n] missing key: ${key} (locale=${locale})`);
    return interpolate(key, vars);
  }
  return interpolate(template, vars);
}
