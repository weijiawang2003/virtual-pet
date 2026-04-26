import type { HealthKitProvider } from '../health/types';
import type { LifeSignal } from '../../core/signals/types';

const ONE_HOUR_MS = 60 * 60 * 1000;
const STEPS_WINDOW_MS = 60 * 60 * 1000; // last hour for steps_delta
const SLEEP_WINDOW_MS = 36 * ONE_HOUR_MS; // last 36h to catch the latest session

export interface HealthSignalSourceDeps {
  readonly health: HealthKitProvider;
  readonly emit: (signal: LifeSignal) => void;
  readonly now?: () => number;
}

export interface HealthSignalSource {
  start(): () => void;
  // Test seam — fires the same logic as a HealthKit observer push without
  // needing a real subscription.
  pollOnce(): Promise<void>;
}

function sumSteps(samples: readonly { startAt: number; value: number }[], fromMs: number): number {
  let total = 0;
  for (const s of samples) {
    if (s.startAt >= fromMs) total += s.value;
  }
  return total;
}

function pickLatestSleep(
  samples: readonly { startAt: number; endAt: number; stage: string }[],
): { durationMin: number; quality: 'good' | 'fair' | 'poor'; at: number } | null {
  // Coalesce contiguous "asleep" segments (light/deep/rem) into one session,
  // bound by the latest awake gap or now. For Phase 22 we keep this simple:
  // sum durations of the most recent contiguous asleep block.
  if (samples.length === 0) return null;
  const sorted = [...samples].sort((a, b) => a.startAt - b.startAt);
  const asleepKinds = new Set(['light', 'deep', 'rem']);

  // Walk from the end to find the latest asleep block.
  let blockEnd = -1;
  let blockStart = -1;
  let totalAsleepMs = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const s = sorted[i]!;
    if (asleepKinds.has(s.stage)) {
      if (blockEnd === -1) blockEnd = s.endAt;
      blockStart = s.startAt;
      totalAsleepMs += s.endAt - s.startAt;
    } else if (blockEnd !== -1) {
      // Hit awake → block ends.
      break;
    }
  }
  if (blockEnd === -1 || blockStart === -1) return null;

  const durationMin = Math.floor(totalAsleepMs / (60 * 1000));
  const quality: 'good' | 'fair' | 'poor' =
    durationMin >= 7 * 60 ? 'good' : durationMin >= 5 * 60 ? 'fair' : 'poor';
  return { durationMin, quality, at: blockEnd };
}

// Bridges HealthKit pushes into LifeSignals. Subscribes to steps + sleep
// observers; on each push, queries the recent window and emits a
// translated signal.
//
// HealthKit observers don't deliver the new sample inline — they say
// "something changed". So we re-query the provider for the recent window
// and emit a digest signal: total steps in the last hour for steps_delta;
// the latest contiguous asleep block for sleep_session.
export function createHealthSignalSource(deps: HealthSignalSourceDeps): HealthSignalSource {
  const now = deps.now ?? (() => Date.now());

  async function pollOnce(): Promise<void> {
    const t = now();
    const stepsFrom = t - STEPS_WINDOW_MS;
    const sleepFrom = t - SLEEP_WINDOW_MS;

    const [steps, sleep] = await Promise.all([
      deps.health.getSteps(stepsFrom, t),
      deps.health.getSleep(sleepFrom, t),
    ]);

    const stepsCount = sumSteps(steps, stepsFrom);
    if (stepsCount > 0) {
      deps.emit({
        type: 'steps_delta',
        count: stepsCount,
        window_minutes: Math.round(STEPS_WINDOW_MS / 60_000),
        at: t,
      });
    }

    const sleepDigest = pickLatestSleep(sleep);
    if (sleepDigest !== null) {
      deps.emit({
        type: 'sleep_session',
        duration_minutes: sleepDigest.durationMin,
        quality: sleepDigest.quality,
        at: sleepDigest.at,
      });
    }
  }

  return {
    start(): () => void {
      const dispStep = deps.health.subscribe('steps', () => {
        void pollOnce();
      });
      const dispSleep = deps.health.subscribe('sleep', () => {
        void pollOnce();
      });
      // Initial sync on mount so a fresh app immediately consumes today's
      // backlog.
      void pollOnce();
      return () => {
        dispStep();
        dispSleep();
      };
    },
    pollOnce,
  };
}
