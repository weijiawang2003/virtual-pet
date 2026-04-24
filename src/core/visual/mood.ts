import type { LifeContext } from '../context/types';
import type { Pet } from '../pet/types';
import type { MoodTag } from './types';

// Pure mood derivation from pet stats + context. Deterministic priority chain.
// NOTE: 'dirty' is in the MoodTag type for forward-compat but is never emitted
// here — no cleanliness stat exists yet. Sprite/animation maps still cover it.
export function deriveMood(pet: Pet, ctx: LifeContext): MoodTag {
  const { satiety, energy, happiness } = pet.stats;

  // Hungry beats everything except deep sleep need.
  if (satiety < 30) return 'hungry';

  // Late-night + low energy → sleepy before anything else (match sleep animation).
  if ((ctx.hourOfDay >= 22 || ctx.hourOfDay < 6) && energy < 40) return 'sleepy';

  // Energy collapse during daytime → still sleepy (pet should doze).
  if (energy < 20) return 'sleepy';

  // Sustained low mood across all three → low.
  const avg = (satiety + energy + happiness) / 3;
  if (avg < 35) return 'low';

  // High happiness peaks → excited (narrow band above the 'happy' default).
  if (happiness >= 85) return 'excited';

  // New active region recently → curious (exploration signal).
  if (ctx.location.activeRegions.length > 0 && energy >= 50) return 'curious';

  // Cozy during cloudy/rainy weather with decent energy.
  if (
    ctx.weather !== null &&
    (ctx.weather.condition === 'cloudy' || ctx.weather.condition === 'rain') &&
    energy >= 40
  ) {
    return 'cozy';
  }

  // Default fallback.
  return 'happy';
}
