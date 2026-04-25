import { createPet, reducer } from '../../../core/pet/reducer';
import type { Pet } from '../../../core/pet/types';
import type { PermissionSnapshot } from '../../../providers/permissions/types';
import { planScheduledNotifications } from '../predict-and-schedule';

const H = 60 * 60 * 1000;
const CST = 8 * H;

const ALL_GRANTED: PermissionSnapshot = Object.freeze({
  health: 'granted',
  location: 'granted',
  notifications: 'granted',
  calendar: 'granted',
  media: 'granted',
});

function petWithStats(satiety: number, energy: number, happiness: number): Pet {
  const base = createPet(0);
  return { ...base, stats: { satiety, energy, happiness } };
}

describe('planScheduledNotifications', () => {
  const NOW = Date.UTC(2026, 3, 24, 0, 0, 0); // 08:00 CST

  it('returns nothing when stats are healthy and time is mid-day', () => {
    const out = planScheduledNotifications({
      pet: petWithStats(90, 90, 90),
      nowMs: NOW,
      tzOffsetMs: CST,
      permissions: ALL_GRANTED,
      checkinHours: [13],
    });
    expect(out).toEqual([]);
  });

  it('schedules a feed nudge when satiety is already low and decay extrapolates lower', () => {
    const out = planScheduledNotifications({
      pet: petWithStats(20, 70, 70),
      nowMs: NOW,
      tzOffsetMs: CST,
      permissions: ALL_GRANTED,
      checkinHours: [13],
    });
    expect(out).toHaveLength(1);
    expect(out[0]?.fireAt).toBeGreaterThan(NOW);
    expect(out[0]?.title.length).toBeGreaterThan(0);
  });

  it('caps at the daily budget across multiple check-in hours', () => {
    const out = planScheduledNotifications({
      pet: petWithStats(5, 5, 5),
      nowMs: NOW,
      tzOffsetMs: CST,
      permissions: ALL_GRANTED,
      checkinHours: [9, 13, 18, 22],
      dailyBudget: 2,
    });
    expect(out.length).toBeLessThanOrEqual(2);
  });

  it('schedules at strictly future fire-times only', () => {
    const out = planScheduledNotifications({
      pet: petWithStats(5, 5, 5),
      nowMs: NOW,
      tzOffsetMs: CST,
      permissions: ALL_GRANTED,
    });
    for (const req of out) {
      expect(req.fireAt).toBeGreaterThan(NOW);
    }
  });

  it('produces ordered fire-times (earliest first within budget)', () => {
    const out = planScheduledNotifications({
      pet: petWithStats(5, 5, 5),
      nowMs: NOW,
      tzOffsetMs: CST,
      permissions: ALL_GRANTED,
    });
    for (let i = 1; i < out.length; i++) {
      expect(out[i]!.fireAt).toBeGreaterThan(out[i - 1]!.fireAt);
    }
  });

  it('a fed pet stays out of the schedule', () => {
    const fresh = petWithStats(70, 70, 70);
    const fed = reducer(fresh, { type: 'feed', nutrition: 30 });
    const out = planScheduledNotifications({
      pet: fed,
      nowMs: NOW,
      tzOffsetMs: CST,
      permissions: ALL_GRANTED,
      checkinHours: [13],
    });
    expect(out).toEqual([]);
  });
});
