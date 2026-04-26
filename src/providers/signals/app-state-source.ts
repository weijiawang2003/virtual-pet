import { AppState, type AppStateStatus, type NativeEventSubscription } from 'react-native';

import type { LifeSignal } from '../../core/signals/types';

const ONE_MIN_MS = 60 * 1000;
const IDLE_THRESHOLD_MIN = 60;
const HEAVY_USE_THRESHOLD_MIN = 90;

export interface AppStateSourceDeps {
  readonly emit: (signal: LifeSignal) => void;
  readonly now?: () => number;
  // Test seam — defaults to the real RN AppState. Tests pass a fake.
  readonly appState?: Pick<typeof AppState, 'addEventListener' | 'currentState'>;
}

export interface AppStateSource {
  start(): () => void;
}

// Watches AppState transitions and emits inferred signals:
//   - background → active with delta ≥ 60min  → idle_no_phone
//   - active → background with active span ≥ 90min  → heavy_phone_use
//
// State machine (linear in time):
//   • backgroundedAt: timestamp at most-recent background entry, or null
//   • activeSince:    timestamp at most-recent foreground entry
//
// Producers must dedupe themselves; the bus doesn't. We only emit when
// the threshold is crossed in a single transition, so each transition
// produces at most one signal.
export function createAppStateSource(deps: AppStateSourceDeps): AppStateSource {
  const now = deps.now ?? (() => Date.now());
  const appState = deps.appState ?? AppState;

  return {
    start(): () => void {
      let backgroundedAt: number | null = null;
      let activeSince: number = now();
      let lastState: AppStateStatus = appState.currentState;

      const sub: NativeEventSubscription = appState.addEventListener('change', (next) => {
        const t = now();

        // background or inactive treated as "off-phone"
        const wasOff = lastState === 'background' || lastState === 'inactive';
        const isOff = next === 'background' || next === 'inactive';

        if (!wasOff && isOff) {
          // active → background: check heavy use
          const activeSpanMs = t - activeSince;
          const activeSpanMin = activeSpanMs / ONE_MIN_MS;
          if (activeSpanMin >= HEAVY_USE_THRESHOLD_MIN) {
            deps.emit({
              type: 'heavy_phone_use',
              duration_minutes: Math.floor(activeSpanMin),
              at: t,
            });
          }
          backgroundedAt = t;
        } else if (wasOff && !isOff) {
          // off → active: check idle window
          if (backgroundedAt !== null) {
            const idleMs = t - backgroundedAt;
            const idleMin = idleMs / ONE_MIN_MS;
            if (idleMin >= IDLE_THRESHOLD_MIN) {
              deps.emit({
                type: 'idle_no_phone',
                duration_minutes: Math.floor(idleMin),
                at: t,
              });
            }
            backgroundedAt = null;
          }
          activeSince = t;
        }

        lastState = next;
      });

      return () => {
        sub.remove();
      };
    },
  };
}
