import lunisolar from 'lunisolar';
import type { LunarInfo } from './types';

export function computeLunar(date: Date | number): LunarInfo {
  const d = typeof date === 'number' ? new Date(date) : date;
  const l = lunisolar(d);
  const solarTermStr = l.solarTerm?.toString();
  return {
    year: l.lunar.year,
    month: l.lunar.month,
    day: l.lunar.day,
    isLeapMonth: l.lunar.isLeapMonth,
    solarTerm: solarTermStr !== undefined && solarTermStr.length > 0 ? solarTermStr : null,
    chineseLabel: l.lunar.toString(),
  };
}
