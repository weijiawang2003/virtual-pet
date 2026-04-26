// Phase 25 — Essence is the premium gacha currency. Rare, slow to earn,
// spent on the essence pool (which is the only way to roll SSR archetypes).

export interface EssenceState {
  readonly current: number;
  readonly lifetimeEarned: number;
  // Cumulative steps in km (used for the 100km milestone).
  readonly totalKm: number;
  // Days in a row with steps ≥ 8000. Resets on a missed day.
  readonly stepStreakDays: number;
}
