import type { AppStateStatus } from 'react-native';

import type { LifeSignal } from '../../../core/signals/types';
import { createAppStateSource } from '../app-state-source';

interface FakeAppState {
  currentState: AppStateStatus;
  addEventListener: (type: 'change', cb: (s: AppStateStatus) => void) => { remove: () => void };
  fire(next: AppStateStatus): void;
}

function makeFakeAppState(initial: AppStateStatus = 'active'): FakeAppState {
  let listeners: ((s: AppStateStatus) => void)[] = [];
  let current: AppStateStatus = initial;
  return {
    get currentState() {
      return current;
    },
    set currentState(s: AppStateStatus) {
      current = s;
    },
    addEventListener(_type, cb) {
      listeners.push(cb);
      return {
        remove() {
          listeners = listeners.filter((l) => l !== cb);
        },
      };
    },
    fire(next) {
      current = next;
      for (const l of listeners) l(next);
    },
  };
}

function setup(initial: AppStateStatus = 'active') {
  const emitted: LifeSignal[] = [];
  const fake = makeFakeAppState(initial);
  let now = 0;
  const src = createAppStateSource({
    emit: (s) => emitted.push(s),
    now: () => now,
    appState: fake,
  });
  return {
    emitted,
    fake,
    src,
    advance: (deltaMs: number) => {
      now += deltaMs;
    },
    setNow: (n: number) => {
      now = n;
    },
  };
}

const MIN = 60 * 1000;

describe('createAppStateSource', () => {
  it('idle 60+ min → idle_no_phone on return', () => {
    const ctx = setup('active');
    const stop = ctx.src.start();
    ctx.fake.fire('background');
    ctx.advance(70 * MIN);
    ctx.fake.fire('active');
    expect(ctx.emitted).toHaveLength(1);
    expect(ctx.emitted[0]?.type).toBe('idle_no_phone');
    expect((ctx.emitted[0] as { duration_minutes: number }).duration_minutes).toBe(70);
    stop();
  });

  it('idle < 60 min → no signal', () => {
    const ctx = setup('active');
    const stop = ctx.src.start();
    ctx.fake.fire('background');
    ctx.advance(45 * MIN);
    ctx.fake.fire('active');
    expect(ctx.emitted).toEqual([]);
    stop();
  });

  it('foreground span 90+ min → heavy_phone_use on backgrounding', () => {
    const ctx = setup('active');
    const stop = ctx.src.start();
    ctx.advance(120 * MIN);
    ctx.fake.fire('background');
    expect(ctx.emitted).toHaveLength(1);
    expect(ctx.emitted[0]?.type).toBe('heavy_phone_use');
    expect((ctx.emitted[0] as { duration_minutes: number }).duration_minutes).toBe(120);
    stop();
  });

  it('foreground span < 90 min → no heavy_phone_use', () => {
    const ctx = setup('active');
    const stop = ctx.src.start();
    ctx.advance(30 * MIN);
    ctx.fake.fire('background');
    expect(ctx.emitted).toEqual([]);
    stop();
  });

  it('inactive treated as off-phone (covers iOS lock-screen flicker)', () => {
    const ctx = setup('active');
    const stop = ctx.src.start();
    ctx.advance(120 * MIN); // satisfies heavy_phone_use threshold
    ctx.fake.fire('inactive');
    expect(ctx.emitted).toHaveLength(1);
    expect(ctx.emitted[0]?.type).toBe('heavy_phone_use');
    stop();
  });

  it('background → inactive → active does NOT double-count idle', () => {
    const ctx = setup('active');
    const stop = ctx.src.start();
    ctx.fake.fire('background');
    ctx.advance(70 * MIN);
    ctx.fake.fire('inactive');
    // Already off; another off → off transition shouldn't emit anything.
    expect(ctx.emitted).toEqual([]);
    ctx.advance(0);
    ctx.fake.fire('active');
    // Single idle_no_phone emitted at the off→active transition.
    expect(ctx.emitted).toHaveLength(1);
    expect(ctx.emitted[0]?.type).toBe('idle_no_phone');
    stop();
  });

  it('stop() unsubscribes; later transitions emit nothing', () => {
    const ctx = setup('active');
    const stop = ctx.src.start();
    stop();
    ctx.fake.fire('background');
    ctx.advance(120 * MIN);
    ctx.fake.fire('active');
    expect(ctx.emitted).toEqual([]);
  });
});
