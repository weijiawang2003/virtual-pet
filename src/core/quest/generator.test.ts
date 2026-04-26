import type { QuestGenContext } from './generator';
import { generateQuest } from './generator';

const FULL_VITALITY = 100;

function ctx(overrides: Partial<QuestGenContext> = {}): QuestGenContext {
  return {
    petId: 'p1',
    vitalityCurrent: FULL_VITALITY,
    hoursSinceLastQuest: null,
    recentSteps: 2000,
    recentSleepMinutes: 6 * 60,
    recentNewPlaces: 0,
    ...overrides,
  };
}

describe('generateQuest', () => {
  it('returns null when there is no active pet', () => {
    expect(generateQuest(ctx({ petId: null }), 1, 'q1')).toBeNull();
  });

  it('returns null when vitality is below the floor (gentle)', () => {
    expect(generateQuest(ctx({ vitalityCurrent: 25 }), 1, 'q1')).toBeNull();
  });

  it('returns null when within the cooldown window', () => {
    expect(generateQuest(ctx({ hoursSinceLastQuest: 1 }), 1, 'q1')).toBeNull();
  });

  it('emits a quest with state=offered and 24h expiry', () => {
    const q = generateQuest(ctx(), 1_000, 'q1');
    expect(q).not.toBeNull();
    expect(q?.state).toBe('offered');
    expect(q?.expiresAt).toBe(1_000 + 24 * 60 * 60 * 1000);
    expect(q?.progress).toBe(0);
    expect(q?.petId).toBe('p1');
  });

  it('attaches positive Essence + Bond rewards', () => {
    const q = generateQuest(ctx(), 1, 'q1')!;
    expect(q.rewardEssence).toBeGreaterThan(0);
    expect(q.rewardBond).toBeGreaterThan(0);
  });

  it('always offers the safe idle fallback when other categories are inactive', () => {
    const q = generateQuest(
      ctx({ recentSteps: 0, recentSleepMinutes: 0, recentNewPlaces: 0 }),
      1,
      'q1',
      0xdead,
    );
    // Only 'idle' is in the candidate pool.
    expect(q?.type).toBe('idle');
  });

  it('includes visit_new_place candidate when recentNewPlaces > 0', () => {
    const seen = new Set<string>();
    for (let s = 0; s < 30; s++) {
      const q = generateQuest(
        ctx({ recentSteps: 0, recentSleepMinutes: 0, recentNewPlaces: 1 }),
        1,
        `q${s}`,
        s,
      );
      if (q) seen.add(q.type);
    }
    expect(seen.has('visit_new_place')).toBe(true);
  });

  it('includes sleep candidate when recentSleepMinutes ≥ 4h', () => {
    const seen = new Set<string>();
    for (let s = 0; s < 30; s++) {
      const q = generateQuest(
        ctx({ recentSteps: 0, recentSleepMinutes: 5 * 60, recentNewPlaces: 0 }),
        1,
        `q${s}`,
        s,
      );
      if (q) seen.add(q.type);
    }
    expect(seen.has('sleep')).toBe(true);
  });

  it('can pick walk when steps qualify', () => {
    // With seed=0 and (walk, idle) candidates, deterministic selection
    // should land on walk for at least one seed; brute-force a small range.
    const ids = ['walk', 'idle'] as const;
    const seen = new Set<string>();
    for (let s = 0; s < 30; s++) {
      const q = generateQuest(
        ctx({ recentSteps: 5000, recentSleepMinutes: 0, recentNewPlaces: 0 }),
        1,
        `q${s}`,
        s,
      );
      if (q) seen.add(q.type);
    }
    for (const id of ids) expect(seen.has(id)).toBe(true);
  });
});
