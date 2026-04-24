import { STRING_KEYS } from '../keys';
import { TRANSLATIONS } from '../translations';
import { SUPPORTED_LOCALES } from '../types';

describe('i18n — completeness', () => {
  for (const locale of SUPPORTED_LOCALES) {
    describe(`locale ${locale}`, () => {
      it('covers every StringKey', () => {
        const table = TRANSLATIONS[locale];
        const missing = STRING_KEYS.filter((k) => table[k] === undefined);
        expect(missing).toEqual([]);
      });

      it('has no empty strings', () => {
        const table = TRANSLATIONS[locale];
        const empty = STRING_KEYS.filter((k) => (table[k] ?? '').length === 0);
        expect(empty).toEqual([]);
      });
    });
  }

  it('STRING_KEYS has no duplicates', () => {
    expect(new Set(STRING_KEYS).size).toBe(STRING_KEYS.length);
  });

  it('TRANSLATIONS has no extra keys beyond the StringKey union', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const extras = Object.keys(TRANSLATIONS[locale]).filter(
        (k) => !STRING_KEYS.includes(k as (typeof STRING_KEYS)[number]),
      );
      expect(extras).toEqual([]);
    }
  });
});
