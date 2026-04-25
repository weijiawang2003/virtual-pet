import { POOL } from '../../../core/phrases/pool';
import type { Nudge, NudgeKind } from '../../../core/nudge/types';
import { nudgeToNotificationRequest } from '../nudge-to-notification';

function makeNudge(kind: NudgeKind): Nudge {
  return {
    kind,
    priority: 50,
    message: 'core message ignored',
    requiresNotificationPermission: true,
  };
}

describe('nudgeToNotificationRequest', () => {
  it('feed → phrase from POOL.hungry', () => {
    const out = nudgeToNotificationRequest(makeNudge('feed'), { fireAtMs: 1_000_000_000 });
    expect(POOL.hungry).toContain(out.title);
  });

  it('rest → phrase from POOL.tired', () => {
    const out = nudgeToNotificationRequest(makeNudge('rest'), { fireAtMs: 1_000_000_000 });
    expect(POOL.tired).toContain(out.title);
  });

  it('play → phrase from POOL.playful', () => {
    const out = nudgeToNotificationRequest(makeNudge('play'), { fireAtMs: 1_000_000_000 });
    expect(POOL.playful).toContain(out.title);
  });

  it('bedtime → phrase from POOL.cozy', () => {
    const out = nudgeToNotificationRequest(makeNudge('bedtime'), { fireAtMs: 1_000_000_000 });
    expect(POOL.cozy).toContain(out.title);
  });

  it('custom (fallback) → phrase from POOL.happy', () => {
    const out = nudgeToNotificationRequest(makeNudge('custom'), { fireAtMs: 1_000_000_000 });
    expect(POOL.happy).toContain(out.title);
  });

  it('same fireAtMs + same kind → deterministic title', () => {
    const a = nudgeToNotificationRequest(makeNudge('feed'), { fireAtMs: 1_000_000_000 });
    const b = nudgeToNotificationRequest(makeNudge('feed'), { fireAtMs: 1_000_000_000 });
    expect(a.title).toBe(b.title);
  });

  it('avoids the recently-used phrase when alternatives exist', () => {
    const first = nudgeToNotificationRequest(makeNudge('feed'), { fireAtMs: 1_000_000_000 });
    const second = nudgeToNotificationRequest(makeNudge('feed'), {
      fireAtMs: 1_000_000_000,
      recentlyUsedPhrases: [first.title],
    });
    expect(second.title).not.toBe(first.title);
  });

  it('fireAt + body shape are well-formed', () => {
    const out = nudgeToNotificationRequest(makeNudge('feed'), { fireAtMs: 42 });
    expect(out.fireAt).toBe(42);
    expect(out.body).toBe('');
    expect(out.data).toEqual({ kind: 'feed' });
  });
});
