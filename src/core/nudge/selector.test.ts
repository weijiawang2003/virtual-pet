import { createPet } from '../pet/reducer';
import { DEFAULT_NUDGE_RULES } from './default-rules';
import { selectNudges } from './selector';
import type { NudgeContext } from './types';
import type { PermissionSnapshot } from '../../providers/permissions/types';

const GRANTED: PermissionSnapshot = Object.freeze({
  health: 'granted',
  location: 'granted',
  notifications: 'granted',
  calendar: 'granted',
  media: 'granted',
});

const NO_NOTIF_PERM: PermissionSnapshot = Object.freeze({ ...GRANTED, notifications: 'denied' });

function ctx(overrides: Partial<NudgeContext>): NudgeContext {
  const base = createPet(0);
  return {
    pet: base,
    nowMs: 10_000_000,
    hourOfDay: 14,
    recentNotifications: [],
    permissions: GRANTED,
    ...overrides,
  };
}

describe('selectNudges — default rules', () => {
  it('returns no nudges when stats are healthy and hour is mid-day', () => {
    expect(selectNudges(ctx({}), DEFAULT_NUDGE_RULES)).toEqual([]);
  });

  it('fires feed nudge when satiety < 20', () => {
    const pet = { ...createPet(0), stats: { satiety: 10, energy: 70, happiness: 70 } };
    const out = selectNudges(ctx({ pet }), DEFAULT_NUDGE_RULES);
    expect(out.map((n) => n.kind)).toEqual(['feed']);
  });

  it('prioritizes feed (90) over rest (70) when both trigger', () => {
    const pet = { ...createPet(0), stats: { satiety: 5, energy: 5, happiness: 70 } };
    const out = selectNudges(ctx({ pet }), DEFAULT_NUDGE_RULES);
    expect(out.map((n) => n.kind)).toEqual(['feed', 'rest']);
  });

  it('fires bedtime nudge in night hours', () => {
    const out = selectNudges(ctx({ hourOfDay: 23 }), DEFAULT_NUDGE_RULES);
    expect(out.map((n) => n.kind)).toContain('bedtime');
  });

  it('does not fire bedtime nudge at 14h', () => {
    const out = selectNudges(ctx({ hourOfDay: 14 }), DEFAULT_NUDGE_RULES);
    expect(out.map((n) => n.kind)).not.toContain('bedtime');
  });
});

describe('selectNudges — permission gating', () => {
  it('filters out notification-required nudges when permission not granted', () => {
    const pet = { ...createPet(0), stats: { satiety: 5, energy: 5, happiness: 5 } };
    const out = selectNudges(ctx({ pet, permissions: NO_NOTIF_PERM }), DEFAULT_NUDGE_RULES);
    // feed/rest/play all require notif permission → filtered. Only bedtime would
    // pass (no-permission-required), but hour 14 doesn't trigger it either.
    expect(out).toEqual([]);
  });

  it('keeps non-notification nudges (bedtime) even without notif permission', () => {
    const out = selectNudges(
      ctx({ hourOfDay: 23, permissions: NO_NOTIF_PERM }),
      DEFAULT_NUDGE_RULES,
    );
    expect(out.map((n) => n.kind)).toContain('bedtime');
  });
});

describe('selectNudges — daily budget', () => {
  it('returns empty when budget is already spent', () => {
    const pet = { ...createPet(0), stats: { satiety: 5, energy: 5, happiness: 5 } };
    const recent = [
      { firedAt: 9_000_000, kind: 'feed' as const },
      { firedAt: 9_500_000, kind: 'rest' as const },
      { firedAt: 9_900_000, kind: 'play' as const },
    ];
    const out = selectNudges(
      ctx({ pet, recentNotifications: recent, hourOfDay: 23 }),
      DEFAULT_NUDGE_RULES,
      { dailyBudget: 3 },
    );
    expect(out).toEqual([]);
  });

  it('partial budget leaves room for highest priority only', () => {
    const pet = { ...createPet(0), stats: { satiety: 5, energy: 5, happiness: 5 } };
    const recent = [
      { firedAt: 9_000_000, kind: 'bedtime' as const },
      { firedAt: 9_500_000, kind: 'bedtime' as const },
    ];
    const out = selectNudges(ctx({ pet, recentNotifications: recent }), DEFAULT_NUDGE_RULES, {
      dailyBudget: 3,
    });
    expect(out).toHaveLength(1);
    expect(out[0]!.kind).toBe('feed');
  });

  it('ignores notifications older than 24h', () => {
    const pet = { ...createPet(0), stats: { satiety: 5, energy: 70, happiness: 70 } };
    const ancient = [
      { firedAt: 10_000_000 - 25 * 60 * 60 * 1000, kind: 'feed' as const },
      { firedAt: 10_000_000 - 30 * 60 * 60 * 1000, kind: 'play' as const },
    ];
    const out = selectNudges(ctx({ pet, recentNotifications: ancient }), DEFAULT_NUDGE_RULES, {
      dailyBudget: 3,
    });
    expect(out.map((n) => n.kind)).toEqual(['feed']);
  });

  it('dailyBudget 0 always returns empty', () => {
    const pet = { ...createPet(0), stats: { satiety: 0, energy: 0, happiness: 0 } };
    expect(selectNudges(ctx({ pet }), DEFAULT_NUDGE_RULES, { dailyBudget: 0 })).toEqual([]);
  });

  it('default budget is 3 when opts omitted', () => {
    const pet = { ...createPet(0), stats: { satiety: 5, energy: 5, happiness: 5 } };
    const out = selectNudges(ctx({ pet, hourOfDay: 23 }), DEFAULT_NUDGE_RULES);
    expect(out.length).toBeLessThanOrEqual(3);
  });
});

describe('selectNudges — output shape', () => {
  it('returns a frozen array', () => {
    const out = selectNudges(ctx({}), DEFAULT_NUDGE_RULES);
    expect(Object.isFrozen(out)).toBe(true);
  });

  it('is pure — same input yields deep-equal output', () => {
    const pet = { ...createPet(0), stats: { satiety: 10, energy: 10, happiness: 10 } };
    const a = selectNudges(ctx({ pet, hourOfDay: 23 }), DEFAULT_NUDGE_RULES);
    const b = selectNudges(ctx({ pet, hourOfDay: 23 }), DEFAULT_NUDGE_RULES);
    expect(a).toEqual(b);
  });

  it('every returned nudge has a non-empty message and numeric priority', () => {
    const pet = { ...createPet(0), stats: { satiety: 5, energy: 5, happiness: 5 } };
    const out = selectNudges(ctx({ pet, hourOfDay: 23 }), DEFAULT_NUDGE_RULES);
    for (const n of out) {
      expect(n.message.length).toBeGreaterThan(0);
      expect(Number.isFinite(n.priority)).toBe(true);
    }
  });
});
