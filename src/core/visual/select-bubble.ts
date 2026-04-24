import type { LifeContext } from '../context/types';
import type { Pet } from '../pet/types';
import type { BubbleKey } from './types';

const MS_PER_HOUR = 60 * 60 * 1000;

function isFullMoon(ctx: LifeContext): boolean {
  const phase = ctx.solar?.moonPhase;
  return phase !== undefined && phase >= 0.48 && phase <= 0.52;
}

function isCnyToday(ctx: LifeContext): boolean {
  return ctx.lunar.month === 1 && ctx.lunar.day === 1;
}

function isBirthdayToday(ctx: LifeContext): boolean {
  const bd = ctx.user?.birthday;
  if (bd === undefined) return false;
  const d = new Date(ctx.nowMs);
  return bd.month === d.getUTCMonth() + 1 && bd.day === d.getUTCDate();
}

function isHighSteps(ctx: LifeContext): boolean {
  return ctx.health.stepsLast24h >= 8000;
}

function isLowHrv(ctx: LifeContext): boolean {
  const hrv = ctx.health.avgHrvLast24h;
  return hrv !== null && hrv < 30;
}

// Priority: festivals > health signals > stat thresholds > default null.
export function selectBubble(pet: Pet, ctx: LifeContext): BubbleKey | null {
  if (isBirthdayToday(ctx)) return 'birthday';
  if (isCnyToday(ctx)) return 'cny';
  if (isFullMoon(ctx)) return 'fullmoon';

  if (isLowHrv(ctx)) return 'worried';
  if (isHighSteps(ctx) && pet.stats.happiness >= 60) return 'playful';

  if (pet.stats.satiety < 30) return 'hungry';
  if (pet.stats.energy < 20) return 'tired';

  const avg = (pet.stats.satiety + pet.stats.energy + pet.stats.happiness) / 3;
  if (avg < 35) return 'low';
  if (pet.stats.happiness >= 85) return 'excited';

  // Cozy signal: daytime nap window + decent energy with rainy/cloudy weather.
  const hoursAlive = pet.ageMs / MS_PER_HOUR;
  if (
    hoursAlive >= 1 &&
    ctx.weather !== null &&
    ctx.weather.condition === 'cloudy' &&
    pet.stats.energy >= 50
  ) {
    return 'cozy';
  }

  if (ctx.location.activeRegions.length > 0 && pet.stats.energy >= 50) return 'curious';

  if (pet.stats.happiness >= 70) return 'happy';

  return null;
}
