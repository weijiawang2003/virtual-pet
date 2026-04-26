import { createPet } from '../../../core/pet/reducer';
import type { Event } from '../../../core/pet/types';
import { createSignalBus } from '../signal-bus';

describe('createSignalBus', () => {
  function setup() {
    const dispatched: Event[] = [];
    const pet = createPet(0);
    let now = 1_000_000;
    const bus = createSignalBus({
      dispatch: (e) => dispatched.push(e),
      getPet: () => pet,
      now: () => now,
    });
    return {
      dispatched,
      bus,
      advanceTo: (t: number) => {
        now = t;
      },
    };
  }

  it('dispatches translator output for a 10k+ steps_delta signal', () => {
    const { dispatched, bus } = setup();
    bus.emit({ type: 'steps_delta', count: 12000, window_minutes: 60, at: 0 });
    expect(dispatched).toHaveLength(2);
    expect(dispatched[0]).toEqual({ type: 'play', minutes: 20, source: 'health' });
    expect(dispatched[1]).toEqual({ type: 'feed', nutrition: 5, source: 'health' });
  });

  it('emits no reducer dispatches for sub-threshold signals', () => {
    const { dispatched, bus } = setup();
    bus.emit({ type: 'steps_delta', count: 1000, window_minutes: 60, at: 0 });
    bus.emit({ type: 'idle_no_phone', duration_minutes: 30, at: 0 });
    expect(dispatched).toEqual([]);
  });

  it('records every emit in the recent buffer with timestamp + events', () => {
    const { bus, advanceTo } = setup();
    advanceTo(2_000_000);
    bus.emit({ type: 'workout', type_detail: 'yoga', duration_minutes: 30, at: 0 });
    advanceTo(2_000_500);
    bus.emit({ type: 'idle_no_phone', duration_minutes: 70, at: 0 });

    const recent = bus.recent();
    expect(recent).toHaveLength(2);
    // Newest first.
    expect(recent[0]?.signal.type).toBe('idle_no_phone');
    expect(recent[0]?.emittedAt).toBe(2_000_500);
    expect(recent[1]?.signal.type).toBe('workout');
    expect(recent[1]?.emittedAt).toBe(2_000_000);
  });

  it('records sub-threshold signals (with empty events) — they still appear in the log', () => {
    const { bus } = setup();
    bus.emit({ type: 'steps_delta', count: 100, window_minutes: 60, at: 0 });
    const recent = bus.recent();
    expect(recent).toHaveLength(1);
    expect(recent[0]?.events).toEqual([]);
  });

  it('caps the recent buffer at 50 entries', () => {
    const { bus } = setup();
    for (let i = 0; i < 60; i++) {
      bus.emit({ type: 'idle_no_phone', duration_minutes: 0, at: i });
    }
    expect(bus.recent()).toHaveLength(50);
  });

  it('clear() empties the buffer; reducer dispatches survive (already happened)', () => {
    const { dispatched, bus } = setup();
    bus.emit({ type: 'workout', type_detail: 'run', duration_minutes: 20, at: 0 });
    expect(dispatched).toHaveLength(1);
    expect(bus.recent()).toHaveLength(1);
    bus.clear();
    expect(bus.recent()).toEqual([]);
    // Pet was already mutated upstream — bus only owns the debug log.
    expect(dispatched).toHaveLength(1);
  });

  it('idempotent under double-emit (producers must dedupe themselves)', () => {
    const { dispatched, bus } = setup();
    const sig = { type: 'steps_delta', count: 6000, window_minutes: 60, at: 0 } as const;
    bus.emit(sig);
    bus.emit(sig);
    // Two dispatches, by design — the bus does not dedupe.
    expect(dispatched).toHaveLength(2);
  });
});
