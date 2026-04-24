import fc from 'fast-check';
import { createPet } from '../pet/reducer';
import { DEFAULT_NUDGE_RULES, MS_PER_DAY } from './default-rules';
import { selectNudges } from './selector';
import type { NudgeContext, RecentNotification } from './types';
import type { PermissionSnapshot } from '../../providers/permissions/types';

const GRANTED_ALL: PermissionSnapshot = Object.freeze({
  health: 'granted',
  location: 'granted',
  notifications: 'granted',
  calendar: 'granted',
  media: 'granted',
});

const arbStats = fc.record({
  satiety: fc.double({ min: 0, max: 100, noNaN: true }),
  energy: fc.double({ min: 0, max: 100, noNaN: true }),
  happiness: fc.double({ min: 0, max: 100, noNaN: true }),
});

const arbHour = fc.integer({ min: 0, max: 23 });

const arbRecent: fc.Arbitrary<readonly RecentNotification[]> = fc.array(
  fc.record({
    firedAt: fc.double({ min: 0, max: 2 * MS_PER_DAY, noNaN: true }),
    kind: fc.constantFrom('feed', 'rest', 'play', 'bedtime', 'custom') as fc.Arbitrary<
      RecentNotification['kind']
    >,
  }),
  { maxLength: 10 },
);

const arbBudget = fc.integer({ min: 0, max: 10 });

function buildCtx(
  nowMs: number,
  stats: NudgeContext['pet']['stats'],
  hour: number,
  recent: readonly RecentNotification[],
): NudgeContext {
  const base = createPet(0);
  return {
    pet: { ...base, stats },
    nowMs,
    hourOfDay: hour,
    recentNotifications: recent,
    permissions: GRANTED_ALL,
  };
}

describe('selectNudges properties', () => {
  it('never returns more than (dailyBudget - recentWithin24h)', () => {
    fc.assert(
      fc.property(arbStats, arbHour, arbRecent, arbBudget, (stats, hour, recent, budget) => {
        const nowMs = 2 * MS_PER_DAY;
        const out = selectNudges(buildCtx(nowMs, stats, hour, recent), DEFAULT_NUDGE_RULES, {
          dailyBudget: budget,
        });
        const recentCount = recent.filter(
          (r) => r.firedAt > nowMs - MS_PER_DAY && r.firedAt <= nowMs,
        ).length;
        const cap = Math.max(0, budget - recentCount);
        expect(out.length).toBeLessThanOrEqual(cap);
      }),
    );
  });

  it('is pure: same inputs → deep-equal outputs', () => {
    fc.assert(
      fc.property(arbStats, arbHour, arbRecent, arbBudget, (stats, hour, recent, budget) => {
        const nowMs = 5_000_000;
        const c = buildCtx(nowMs, stats, hour, recent);
        const a = selectNudges(c, DEFAULT_NUDGE_RULES, { dailyBudget: budget });
        const b = selectNudges(c, DEFAULT_NUDGE_RULES, { dailyBudget: budget });
        expect(a).toEqual(b);
      }),
    );
  });

  it('total fired in any rolling 24h window ≤ dailyBudget, across a simulated day', () => {
    // Simulate a day: every hour, compute selectNudges(...) with current "fired"
    // history, then "fire" the top candidate (taking at most budget).
    // Invariant: the sliding-window fired count never exceeds budget.
    fc.assert(
      fc.property(
        fc.array(arbStats, { minLength: 24, maxLength: 24 }),
        arbBudget,
        (hourlyStats, budget) => {
          const fired: RecentNotification[] = [];
          const start = 1_000_000_000;

          for (let h = 0; h < 24; h++) {
            const nowMs = start + h * 60 * 60 * 1000;
            const stats = hourlyStats[h]!;
            const picks = selectNudges(buildCtx(nowMs, stats, h, fired), DEFAULT_NUDGE_RULES, {
              dailyBudget: budget,
            });
            for (const n of picks) {
              fired.push({ firedAt: nowMs, kind: n.kind });
            }
          }

          // Slide a 24h window across fired timestamps; max count ≤ budget.
          for (let i = 0; i < fired.length; i++) {
            const anchor = fired[i]!.firedAt;
            const windowCount = fired.filter(
              (f) => f.firedAt > anchor - MS_PER_DAY && f.firedAt <= anchor,
            ).length;
            expect(windowCount).toBeLessThanOrEqual(budget);
          }
        },
      ),
    );
  });
});
