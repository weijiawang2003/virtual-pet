export const STAT_MIN = 0;
export const STAT_MAX = 100;

// NaN coerces to STAT_MIN so a malformed event can never poison the state.
export function clampStat(n: number): number {
  if (Number.isNaN(n)) return STAT_MIN;
  if (n < STAT_MIN) return STAT_MIN;
  if (n > STAT_MAX) return STAT_MAX;
  return n;
}
