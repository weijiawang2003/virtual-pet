import type { VitalityAction } from './types';

// User-action costs. Tuned so a fresh-day pet (cap 100) can do ~5-7 actions
// before needing recovery. Rest is free — the pet sleeping shouldn't drain
// the user. Gacha values mirror the Phase 25 contract.
export const VITALITY_COSTS: Readonly<Record<VitalityAction, number>> = Object.freeze({
  feed: 10,
  play: 15,
  clean: 5,
  rest: 0,
  gacha_normal: 20,
  gacha_premium: 30,
});
