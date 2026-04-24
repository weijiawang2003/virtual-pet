import { assertNever } from '../util/assert-never';
import { MS_PER_DAY } from './default-rules';
import type { Nudge, NudgeContext, NudgeRule, SelectOptions } from './types';
import { DEFAULT_DAILY_BUDGET } from './types';

function evaluate(rule: NudgeRule, ctx: NudgeContext): Nudge | null {
  switch (rule.type) {
    case 'stat-threshold': {
      const value = ctx.pet.stats[rule.stat];
      if (value < rule.below) {
        const base: Nudge = {
          kind: rule.kind,
          priority: rule.priority,
          message: rule.message,
          requiresNotificationPermission: rule.requiresNotificationPermission,
        };
        return rule.suggestedAction === undefined
          ? base
          : { ...base, suggestedAction: rule.suggestedAction };
      }
      return null;
    }
    case 'hour-window': {
      if (rule.hours.includes(ctx.hourOfDay)) {
        return {
          kind: rule.kind,
          priority: rule.priority,
          message: rule.message,
          requiresNotificationPermission: rule.requiresNotificationPermission,
        };
      }
      return null;
    }
    default:
      return assertNever(rule);
  }
}

function countRecentWithin24h(ctx: NudgeContext): number {
  const cutoff = ctx.nowMs - MS_PER_DAY;
  let n = 0;
  for (const r of ctx.recentNotifications) {
    if (r.firedAt > cutoff && r.firedAt <= ctx.nowMs) n += 1;
  }
  return n;
}

export function selectNudges(
  ctx: NudgeContext,
  rules: readonly NudgeRule[],
  opts: SelectOptions = { dailyBudget: DEFAULT_DAILY_BUDGET },
): readonly Nudge[] {
  const permissionGranted = ctx.permissions.notifications === 'granted';
  const candidates: Nudge[] = [];

  for (const rule of rules) {
    const n = evaluate(rule, ctx);
    if (n === null) continue;
    if (n.requiresNotificationPermission && !permissionGranted) continue;
    candidates.push(n);
  }

  // Stable sort by descending priority; declaration order breaks ties.
  const sorted = candidates
    .map((n, i) => ({ n, i }))
    .sort((a, b) => b.n.priority - a.n.priority || a.i - b.i)
    .map(({ n }) => n);

  const budget = Math.max(0, opts.dailyBudget - countRecentWithin24h(ctx));
  return Object.freeze(sorted.slice(0, budget));
}
