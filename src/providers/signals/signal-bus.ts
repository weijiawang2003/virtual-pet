import { translateSignal } from '../../core/signals/translator';
import type { LifeSignal } from '../../core/signals/types';
import type { Event, Pet } from '../../core/pet/types';

const RECENT_BUFFER_SIZE = 50;

export interface SignalBusEntry {
  readonly signal: LifeSignal;
  readonly emittedAt: number;
  readonly events: readonly Event[];
}

export interface SignalBusDeps {
  readonly dispatch: (event: Event) => void;
  readonly getPet: () => Pet;
  readonly now?: () => number;
  // Optional notification fired after every emit/clear so a UI layer can
  // re-render the debug panel without polling.
  readonly onChange?: () => void;
}

export interface SignalBus {
  emit(signal: LifeSignal): void;
  recent(): readonly SignalBusEntry[];
  clear(): void;
}

// Central wire from real-life-signal producers (HealthKit / Location /
// AppState) to the pet reducer. Pure JS — testable via injected deps.
//
// Behavior:
//   1. translateSignal(signal, currentPet) → events
//   2. dispatch each event to the pet store
//   3. retain (signal, events, timestamp) in a fixed-size ring buffer for
//      the Settings debug panel
//
// Idempotent under double-mount (StrictMode): emitting the same signal
// twice produces two reducer dispatches, which is the right semantics —
// the upstream producers must dedupe themselves.
export function createSignalBus(deps: SignalBusDeps): SignalBus {
  const now = deps.now ?? (() => Date.now());
  let recentBuffer: SignalBusEntry[] = [];

  return {
    emit(signal: LifeSignal): void {
      const events = translateSignal(signal, deps.getPet());
      for (const ev of events) {
        deps.dispatch(ev);
      }
      const entry: SignalBusEntry = Object.freeze({
        signal,
        emittedAt: now(),
        events,
      });
      // Newest first; cap at RECENT_BUFFER_SIZE.
      recentBuffer = [entry, ...recentBuffer].slice(0, RECENT_BUFFER_SIZE);
      deps.onChange?.();
    },
    recent(): readonly SignalBusEntry[] {
      return Object.freeze([...recentBuffer]);
    },
    clear(): void {
      recentBuffer = [];
      deps.onChange?.();
    },
  };
}
