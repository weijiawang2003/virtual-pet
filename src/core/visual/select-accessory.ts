import type { LifeContext } from '../context/types';
import type { AccessoryKey } from './types';

function toLocalMonthDay(ctx: LifeContext): { month: number; day: number } {
  // Use ctx.nowMs + tzOffset encoded via timeOfDay. We only have dayOfWeek /
  // hour on ctx; compute local month/day from nowMs + tz using stable math.
  // LifeContextInputs.tzOffsetMs is not on the output ctx. We reconstruct the
  // local Date purely from nowMs for accessory purposes — this is a tiny
  // compromise: birthday matches against UTC month/day. Phase 15+ UI can
  // re-evaluate with the device's local date if needed.
  const d = new Date(ctx.nowMs);
  return { month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function isUserBirthdayToday(ctx: LifeContext): boolean {
  const bd = ctx.user?.birthday;
  if (bd === undefined) return false;
  const { month, day } = toLocalMonthDay(ctx);
  return bd.month === month && bd.day === day;
}

function isCnyToday(ctx: LifeContext): boolean {
  return ctx.lunar.month === 1 && ctx.lunar.day === 1;
}

function isRainy(ctx: LifeContext): boolean {
  return ctx.weather?.condition === 'rain';
}

// Priority: birthday > CNY > rain > null.
export function selectAccessory(ctx: LifeContext): AccessoryKey | null {
  if (isUserBirthdayToday(ctx)) return 'party-hat';
  if (isCnyToday(ctx)) return 'cny-jacket';
  if (isRainy(ctx)) return 'raincoat';
  return null;
}
