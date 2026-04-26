import { createFakeHealthKitProvider } from '../../health/fake';
import type { LifeSignal } from '../../../core/signals/types';
import { createHealthSignalSource } from '../health-signal-source';

const H = 60 * 60 * 1000;
const NOW = Date.UTC(2026, 3, 24, 12, 0, 0);

describe('createHealthSignalSource', () => {
  function setup() {
    const emitted: LifeSignal[] = [];
    const health = createFakeHealthKitProvider();
    const source = createHealthSignalSource({
      health,
      emit: (s) => emitted.push(s),
      now: () => NOW,
    });
    return { emitted, health, source };
  }

  it('emits steps_delta totaling samples in the last hour', async () => {
    const { emitted, health, source } = setup();
    health.inject({
      steps: [
        { startAt: NOW - 30 * 60 * 1000, endAt: NOW - 29 * 60 * 1000, value: 1500 },
        { startAt: NOW - 15 * 60 * 1000, endAt: NOW - 14 * 60 * 1000, value: 800 },
        { startAt: NOW - 4 * H, endAt: NOW - 3 * H, value: 9999 }, // outside window
      ],
    });
    await source.pollOnce();
    expect(emitted).toHaveLength(1);
    expect(emitted[0]?.type).toBe('steps_delta');
    expect((emitted[0] as { count: number }).count).toBe(2300);
  });

  it('does not emit steps_delta when last hour has zero steps', async () => {
    const { emitted, source } = setup();
    await source.pollOnce();
    expect(emitted.filter((s) => s.type === 'steps_delta')).toEqual([]);
  });

  it('emits sleep_session for a 7+ hour contiguous asleep block (good)', async () => {
    const { emitted, health, source } = setup();
    health.inject({
      sleep: [{ startAt: NOW - 14 * H, endAt: NOW - 7 * H, stage: 'deep' }],
    });
    await source.pollOnce();
    const sleepSig = emitted.find((s) => s.type === 'sleep_session');
    expect(sleepSig).toBeDefined();
    expect((sleepSig as { duration_minutes: number }).duration_minutes).toBe(7 * 60);
    expect((sleepSig as { quality: string }).quality).toBe('good');
  });

  it('emits sleep_session quality "poor" for < 5h sleep', async () => {
    const { emitted, health, source } = setup();
    health.inject({
      sleep: [{ startAt: NOW - 10 * H, endAt: NOW - 6 * H, stage: 'light' }],
    });
    await source.pollOnce();
    const sleepSig = emitted.find((s) => s.type === 'sleep_session');
    expect((sleepSig as { quality: string }).quality).toBe('poor');
  });

  it('coalesces multiple asleep stages in one block', async () => {
    const { emitted, health, source } = setup();
    health.inject({
      sleep: [
        { startAt: NOW - 14 * H, endAt: NOW - 12 * H, stage: 'light' },
        { startAt: NOW - 12 * H, endAt: NOW - 10 * H, stage: 'deep' },
        { startAt: NOW - 10 * H, endAt: NOW - 7 * H, stage: 'rem' },
      ],
    });
    await source.pollOnce();
    const sleepSig = emitted.find((s) => s.type === 'sleep_session');
    expect((sleepSig as { duration_minutes: number }).duration_minutes).toBe(7 * 60);
  });

  it('no sleep_session if no asleep samples', async () => {
    const { emitted, health, source } = setup();
    health.inject({
      sleep: [{ startAt: NOW - 8 * H, endAt: NOW - 7 * H, stage: 'awake' }],
    });
    await source.pollOnce();
    expect(emitted.filter((s) => s.type === 'sleep_session')).toEqual([]);
  });

  it('start() polls once immediately and unsubscribes on cleanup', async () => {
    const { emitted, health, source } = setup();
    health.inject({ steps: [{ startAt: NOW - 30 * 60 * 1000, endAt: NOW, value: 500 }] });
    const stop = source.start();
    // Allow the initial Promise to settle.
    await Promise.resolve();
    await Promise.resolve();
    expect(emitted.some((s) => s.type === 'steps_delta')).toBe(true);
    stop();
  });
});
