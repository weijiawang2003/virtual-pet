// Pure rules describing where Essence comes from. Phase 25 lays the
// contract; the store layer hooks them up to live state in a follow-up.
//
// All three helpers are *thresholding* — they return the gain at the
// moment a threshold is crossed, not a continuous integral. Callers
// pass the previous and current state so we can detect crossings.

const KM_PER_MILESTONE = 100;
const ESSENCE_PER_KM_MILESTONE = 10;
const ESSENCE_PER_BOND_MAX = 20;
const ESSENCE_PER_WEEKLY_STREAK = 5;
const BOND_MAX_THRESHOLD = 100;

// +20 once when the user crosses bond=100 with a single pet. Does not
// re-fire on subsequent crossings without dipping below.
export function essenceFromBondCrossing(prevBond: number, currBond: number): number {
  if (prevBond < BOND_MAX_THRESHOLD && currBond >= BOND_MAX_THRESHOLD) {
    return ESSENCE_PER_BOND_MAX;
  }
  return 0;
}

// +10 per 100km milestone crossed since the previous total. Can fire
// multiple times in a single update if the delta spans multiple buckets.
export function essenceFromStepsMilestone(prevTotalKm: number, currTotalKm: number): number {
  if (currTotalKm <= prevTotalKm) return 0;
  const prev = Math.floor(prevTotalKm / KM_PER_MILESTONE);
  const curr = Math.floor(currTotalKm / KM_PER_MILESTONE);
  return Math.max(0, curr - prev) * ESSENCE_PER_KM_MILESTONE;
}

// +5 every 7 consecutive days with steps ≥ 8000. Streak length is supplied
// by the store; this helper only fires on each multiple of 7.
export function essenceFromStreak(consecutiveDays: number): number {
  if (consecutiveDays > 0 && consecutiveDays % 7 === 0) {
    return ESSENCE_PER_WEEKLY_STREAK;
  }
  return 0;
}
