import type { LifeContext } from '../context/types';
import type { Pet } from '../pet/types';
import type { AnimationKey, MoodTag } from './types';

const MOOD_ANIM: Record<MoodTag, AnimationKey> = {
  happy: 'bounce',
  sleepy: 'yawn',
  excited: 'dance',
  low: 'low',
  curious: 'curious',
  cozy: 'cuddle',
  hungry: 'idle',
  dirty: 'idle',
};

function isFullMoon(ctx: LifeContext): boolean {
  const phase = ctx.solar?.moonPhase;
  return phase !== undefined && phase >= 0.48 && phase <= 0.52;
}

function isRainy(ctx: LifeContext): boolean {
  return ctx.weather?.condition === 'rain';
}

// Priority: sleep > emotional > weather > full-moon-stare > mood > idle.
export function selectAnimation(pet: Pet, ctx: LifeContext, mood: MoodTag): AnimationKey {
  // Phase 21: egg is visibly still. No animation until it hatches.
  if (pet.stage === 'egg') return 'idle';

  // 1. Sleep override — pet literally napping.
  const isNight = ctx.hourOfDay >= 22 || ctx.hourOfDay < 6;
  if (mood === 'sleepy' && (isNight || pet.stats.energy < 15)) return 'sleep';

  // 2. Emotional peaks.
  if (mood === 'excited') return 'dance';
  if (mood === 'low') return 'low';

  // 3. Weather-driven.
  if (isRainy(ctx)) return 'curious'; // watching the rain

  // 4. Full-moon-stare is a "moment" animation that overrides a generic mood.
  if (isFullMoon(ctx)) return 'full-moon-stare';

  // 5. Mood-mapped default.
  return MOOD_ANIM[mood];
}
