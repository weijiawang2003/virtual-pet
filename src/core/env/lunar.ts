import lunisolar from 'lunisolar';
import type { LunarInfo } from './types';

// lunisolar uses the runtime's local timezone by default, which makes output
// non-deterministic across machines. We always pass through `.utc()` and then
// apply the caller's tzOffset explicitly. Callers pass tzOffsetMs = 0 for UTC.
export function computeLunar(date: Date | number, tzOffsetMs: number = 0): LunarInfo {
  const d = typeof date === 'number' ? new Date(date) : date;
  const tzMin = Math.round(tzOffsetMs / 60_000);
  const l = lunisolar.utc(d).utcOffset(tzMin);
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
