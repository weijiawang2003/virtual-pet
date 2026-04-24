import type { LifeContext } from '../context/types';
import type { BackgroundKey } from './types';

function isCnyToday(ctx: LifeContext): boolean {
  return ctx.lunar.month === 1 && ctx.lunar.day === 1;
}

function timePhase(hour: number): BackgroundKey {
  if (hour >= 4 && hour < 6) return 'dawn';
  if (hour >= 6 && hour < 17) return 'sunny';
  if (hour >= 17 && hour < 19) return 'dusk';
  return 'night';
}

// Priority: CNY > snow > rain > time-of-day.
export function selectBackground(ctx: LifeContext): BackgroundKey {
  if (isCnyToday(ctx)) return 'cny';
  if (ctx.weather?.condition === 'snow') return 'snow';
  if (ctx.weather?.condition === 'rain') return 'rain';
  return timePhase(ctx.hourOfDay);
}
