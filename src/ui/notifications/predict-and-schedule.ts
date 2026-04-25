import { applyDecay } from '../../core/decay/decay';
import { DEFAULT_NUDGE_RULES } from '../../core/nudge/default-rules';
import { selectNudges } from '../../core/nudge/selector';
import type { NudgeContext, RecentNotification } from '../../core/nudge/types';
import type { Pet } from '../../core/pet/types';
import type { PermissionSnapshot } from '../../providers/permissions/types';
import type { NotificationRequest } from '../../providers/notifications/types';
import { nudgeToNotificationRequest } from './nudge-to-notification';

// Local check-in hours (24h clock). Avoids 3am pings.
export const DEFAULT_CHECKIN_HOURS: readonly number[] = [9, 13, 18, 22];

// Maximum nudges per rolling 24h window. Mirrors core/nudge default budget.
export const DEFAULT_DAILY_BUDGET = 3;

interface PlanArgs {
  readonly pet: Pet;
  readonly nowMs: number;
  readonly tzOffsetMs: number;
  readonly permissions: PermissionSnapshot;
  readonly checkinHours?: readonly number[];
  readonly dailyBudget?: number;
}

// Returns the next instant in UTC ms when the wall-clock local hour equals
// `targetHour` and is strictly after `nowMs`. tzOffsetMs is east-positive ms.
function nextLocalHour(nowMs: number, tzOffsetMs: number, targetHour: number): number {
  const localNowMs = nowMs + tzOffsetMs;
  const dayStartLocal = Math.floor(localNowMs / (24 * 60 * 60 * 1000)) * 24 * 60 * 60 * 1000;
  let candidate = dayStartLocal + targetHour * 60 * 60 * 1000;
  if (candidate <= localNowMs) candidate += 24 * 60 * 60 * 1000;
  // Convert back to UTC.
  return candidate - tzOffsetMs;
}

// Pure planner. Walks the daily check-in hours, predicts pet state at each
// fire-time via `applyDecay`, runs `selectNudges`, and emits a list of
// NotificationRequests capped by the rolling daily budget.
export function planScheduledNotifications(args: PlanArgs): readonly NotificationRequest[] {
  const checkinHours = args.checkinHours ?? DEFAULT_CHECKIN_HOURS;
  const budget = args.dailyBudget ?? DEFAULT_DAILY_BUDGET;
  const recent: RecentNotification[] = [];
  const phrases: string[] = [];
  const out: NotificationRequest[] = [];

  // Sort so we always process the earliest fire-time first (predict in order).
  const fireTimes = checkinHours
    .map((hour) => ({ hour, fireAt: nextLocalHour(args.nowMs, args.tzOffsetMs, hour) }))
    .sort((a, b) => a.fireAt - b.fireAt);

  for (const { hour, fireAt } of fireTimes) {
    if (out.length >= budget) break;
    const elapsed = fireAt - args.nowMs;
    const predictedPet = applyDecay(args.pet, elapsed);
    const ctx: NudgeContext = {
      pet: predictedPet,
      nowMs: fireAt,
      hourOfDay: hour,
      recentNotifications: recent,
      permissions: args.permissions,
    };
    const nudges = selectNudges(ctx, DEFAULT_NUDGE_RULES, { dailyBudget: budget });
    if (nudges.length === 0) continue;
    const top = nudges[0];
    if (top === undefined) continue;
    const req = nudgeToNotificationRequest(top, {
      fireAtMs: fireAt,
      recentlyUsedPhrases: phrases.slice(0, 3),
    });
    out.push(req);
    phrases.unshift(req.title);
    recent.push({ firedAt: fireAt, kind: top.kind });
  }
  return out;
}
