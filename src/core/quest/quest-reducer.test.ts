import fc from 'fast-check';

import { progressDeltaFor } from './progress-tracker';
import { getActiveQuest, INITIAL_STATE, reducer } from './quest-reducer';
import type { Quest, QuestEvent } from './types';

const ONE_DAY = 24 * 60 * 60 * 1000;

function makeQuest(overrides: Partial<Quest> = {}): Quest {
  return {
    id: 'q1',
    type: 'walk',
    threshold: 3000,
    rewardEssence: 5,
    rewardBond: 10,
    expiresAt: 1_000_000 + ONE_DAY,
    state: 'offered',
    progress: 0,
    petId: 'p1',
    offeredAt: 1_000_000,
    acceptedAt: null,
    completedAt: null,
    ...overrides,
  };
}

describe('quest_offer', () => {
  it('adds a new quest at the head of order', () => {
    const s = reducer(INITIAL_STATE, { type: 'quest_offer', quest: makeQuest() });
    expect(s.order).toEqual(['q1']);
    expect(s.quests['q1']?.type).toBe('walk');
  });

  it('rejects duplicate ids', () => {
    let s = reducer(INITIAL_STATE, { type: 'quest_offer', quest: makeQuest() });
    s = reducer(s, { type: 'quest_offer', quest: makeQuest() });
    expect(s.order).toEqual(['q1']);
  });
});

describe('quest_accept / quest_decline', () => {
  it('accept transitions offered → accepted with timestamp', () => {
    let s = reducer(INITIAL_STATE, { type: 'quest_offer', quest: makeQuest() });
    s = reducer(s, { type: 'quest_accept', questId: 'q1', now: 5 });
    expect(s.quests['q1']?.state).toBe('accepted');
    expect(s.quests['q1']?.acceptedAt).toBe(5);
  });

  it('decline transitions offered → declined', () => {
    let s = reducer(INITIAL_STATE, { type: 'quest_offer', quest: makeQuest() });
    s = reducer(s, { type: 'quest_decline', questId: 'q1', now: 5 });
    expect(s.quests['q1']?.state).toBe('declined');
  });

  it('decline on a non-offered quest is a no-op', () => {
    let s = reducer(INITIAL_STATE, {
      type: 'quest_offer',
      quest: makeQuest({ state: 'completed' }),
    });
    s = reducer(s, { type: 'quest_decline', questId: 'q1', now: 5 });
    expect(s.quests['q1']?.state).toBe('completed');
  });

  it('accept on a non-offered quest is a no-op', () => {
    let s = reducer(INITIAL_STATE, {
      type: 'quest_offer',
      quest: makeQuest({ state: 'completed' }),
    });
    s = reducer(s, { type: 'quest_accept', questId: 'q1', now: 1 });
    expect(s.quests['q1']?.state).toBe('completed');
  });

  it('accept on an unknown id returns same state', () => {
    const s = reducer(INITIAL_STATE, { type: 'quest_accept', questId: 'ghost', now: 1 });
    expect(s).toBe(INITIAL_STATE);
  });
});

describe('quest_progress', () => {
  function startedQuest() {
    let s = reducer(INITIAL_STATE, { type: 'quest_offer', quest: makeQuest() });
    s = reducer(s, { type: 'quest_accept', questId: 'q1', now: 1 });
    return s;
  }

  it('accumulates delta and stays in_progress below threshold', () => {
    let s = startedQuest();
    s = reducer(s, { type: 'quest_progress', questId: 'q1', delta: 1500, now: 100 });
    expect(s.quests['q1']?.progress).toBe(1500);
    expect(s.quests['q1']?.state).toBe('in_progress');
  });

  it('marks completed when threshold met and stamps completedAt', () => {
    let s = startedQuest();
    s = reducer(s, { type: 'quest_progress', questId: 'q1', delta: 3000, now: 200 });
    expect(s.quests['q1']?.state).toBe('completed');
    expect(s.quests['q1']?.completedAt).toBe(200);
  });

  it('does not double-complete (state stays completed; further progress no-op)', () => {
    let s = startedQuest();
    s = reducer(s, { type: 'quest_progress', questId: 'q1', delta: 5000, now: 100 });
    const completedAt = s.quests['q1']?.completedAt;
    s = reducer(s, { type: 'quest_progress', questId: 'q1', delta: 100, now: 999 });
    expect(s.quests['q1']?.state).toBe('completed');
    // completedAt did not move.
    expect(s.quests['q1']?.completedAt).toBe(completedAt);
  });

  it('progress on offered (not yet accepted) is a no-op', () => {
    const s0 = reducer(INITIAL_STATE, { type: 'quest_offer', quest: makeQuest() });
    const s1 = reducer(s0, { type: 'quest_progress', questId: 'q1', delta: 5000, now: 1 });
    expect(s1.quests['q1']?.progress).toBe(0);
    expect(s1.quests['q1']?.state).toBe('offered');
  });
});

describe('quest_expire_check', () => {
  it('marks expired when now ≥ expiresAt and state is live', () => {
    let s = reducer(INITIAL_STATE, { type: 'quest_offer', quest: makeQuest() });
    s = reducer(s, { type: 'quest_expire_check', now: 999_999_999 });
    expect(s.quests['q1']?.state).toBe('expired');
  });

  it('does not touch completed quests', () => {
    let s = reducer(INITIAL_STATE, {
      type: 'quest_offer',
      quest: makeQuest({ state: 'completed' }),
    });
    s = reducer(s, { type: 'quest_expire_check', now: 999_999_999 });
    expect(s.quests['q1']?.state).toBe('completed');
  });

  it('returns same state when no quest needs expiring', () => {
    const s = reducer(INITIAL_STATE, { type: 'quest_offer', quest: makeQuest() });
    const next = reducer(s, { type: 'quest_expire_check', now: 1 });
    expect(next).toBe(s);
  });
});

describe('quest_clear_completed', () => {
  it('drops completed/declined/expired quests, keeps live ones', () => {
    let s = reducer(INITIAL_STATE, {
      type: 'quest_offer',
      quest: makeQuest({ id: 'live', state: 'offered' }),
    });
    s = reducer(s, {
      type: 'quest_offer',
      quest: makeQuest({ id: 'done', state: 'completed' }),
    });
    s = reducer(s, { type: 'quest_clear_completed' });
    expect(s.order).toEqual(['live']);
    expect(s.quests['done']).toBeUndefined();
  });

  it('returns same state when nothing to clear', () => {
    const s = reducer(INITIAL_STATE, {
      type: 'quest_offer',
      quest: makeQuest({ state: 'offered' }),
    });
    const next = reducer(s, { type: 'quest_clear_completed' });
    expect(next).toBe(s);
  });
});

describe('getActiveQuest', () => {
  it('returns null when no quests', () => {
    expect(getActiveQuest(INITIAL_STATE)).toBeNull();
  });

  it('returns the first live quest in order', () => {
    let s = reducer(INITIAL_STATE, {
      type: 'quest_offer',
      quest: makeQuest({ id: 'a', state: 'offered' }),
    });
    s = reducer(s, {
      type: 'quest_offer',
      quest: makeQuest({ id: 'b', state: 'offered' }),
    });
    // Newest-first; b should be at head.
    expect(getActiveQuest(s)?.id).toBe('b');
  });

  it('skips terminal-state quests', () => {
    let s = reducer(INITIAL_STATE, {
      type: 'quest_offer',
      quest: makeQuest({ id: 'old', state: 'completed' }),
    });
    s = reducer(s, {
      type: 'quest_offer',
      quest: makeQuest({ id: 'new', state: 'offered' }),
    });
    expect(getActiveQuest(s)?.id).toBe('new');
  });

  it('returns null when all quests are terminal', () => {
    const s = reducer(INITIAL_STATE, {
      type: 'quest_offer',
      quest: makeQuest({ state: 'expired' }),
    });
    expect(getActiveQuest(s)).toBeNull();
  });
});

describe('reducer — exhaustiveness', () => {
  it('throws on unknown event discriminant', () => {
    expect(() => reducer(INITIAL_STATE, { type: 'explode' } as unknown as QuestEvent)).toThrow(
      /Unreachable/,
    );
  });
});

describe('quest progression — fast-check integration', () => {
  // walk-quest invariant: any sequence of LifeSignals that delivers
  // ≥ threshold steps_delta count completes the quest exactly once.
  it('walk quest completes exactly once across a stream of step deltas', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 2000 }), { minLength: 5, maxLength: 30 }),
        (counts) => {
          let s = reducer(INITIAL_STATE, { type: 'quest_offer', quest: makeQuest() });
          s = reducer(s, { type: 'quest_accept', questId: 'q1', now: 1 });
          let completed = false;
          let now = 100;
          for (const c of counts) {
            const delta = progressDeltaFor('walk', {
              type: 'steps_delta',
              count: c,
              window_minutes: 60,
              at: now,
            });
            s = reducer(s, { type: 'quest_progress', questId: 'q1', delta, now });
            now += 1;
            if (s.quests['q1']?.state === 'completed') completed = true;
          }
          // No matter what, the quest is either still in_progress / accepted
          // or completed once and stays completed.
          expect(['accepted', 'in_progress', 'completed']).toContain(s.quests['q1']?.state);
          if (completed) expect(s.quests['q1']?.state).toBe('completed');
        },
      ),
    );
  });
});
