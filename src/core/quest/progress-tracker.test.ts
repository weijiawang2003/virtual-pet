import { progressDeltaFor } from './progress-tracker';

const NOW = 1_000_000;

describe('progressDeltaFor — walk', () => {
  it('+steps_delta count for walk quests', () => {
    expect(
      progressDeltaFor('walk', { type: 'steps_delta', count: 1234, window_minutes: 60, at: NOW }),
    ).toBe(1234);
  });

  it('0 for unrelated signal', () => {
    expect(progressDeltaFor('walk', { type: 'idle_no_phone', duration_minutes: 90, at: NOW })).toBe(
      0,
    );
  });
});

describe('progressDeltaFor — sleep', () => {
  it('full duration_minutes for sleep_session', () => {
    expect(
      progressDeltaFor('sleep', {
        type: 'sleep_session',
        duration_minutes: 480,
        quality: 'good',
        at: NOW,
      }),
    ).toBe(480);
  });

  it('0 for non-sleep_session signal on a sleep quest', () => {
    expect(
      progressDeltaFor('sleep', {
        type: 'steps_delta',
        count: 1000,
        window_minutes: 60,
        at: NOW,
      }),
    ).toBe(0);
  });
});

describe('progressDeltaFor — idle', () => {
  it('full duration_minutes for idle_no_phone', () => {
    expect(progressDeltaFor('idle', { type: 'idle_no_phone', duration_minutes: 70, at: NOW })).toBe(
      70,
    );
  });
});

describe('progressDeltaFor — visit_new_place', () => {
  it('+1 only when new_region: true', () => {
    expect(
      progressDeltaFor('visit_new_place', { type: 'location_change', new_region: true, at: NOW }),
    ).toBe(1);
    expect(
      progressDeltaFor('visit_new_place', { type: 'location_change', new_region: false, at: NOW }),
    ).toBe(0);
  });
});

describe('progressDeltaFor — manual-action quest types', () => {
  it('play_with_pet returns 0 for any signal', () => {
    expect(
      progressDeltaFor('play_with_pet', {
        type: 'steps_delta',
        count: 5000,
        window_minutes: 60,
        at: NOW,
      }),
    ).toBe(0);
  });
  it('feed_special returns 0 for any signal', () => {
    expect(
      progressDeltaFor('feed_special', { type: 'idle_no_phone', duration_minutes: 90, at: NOW }),
    ).toBe(0);
  });
});
