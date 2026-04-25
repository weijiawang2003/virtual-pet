import { useEffect, useState } from 'react';

import type { HRVSample, SleepSample, StepsSample } from '../../providers/health/types';
import { useRuntimeProviders } from '../providers/runtime-providers-context';

const H = 60 * 60 * 1000;

export interface HealthSamples24h {
  readonly steps: readonly StepsSample[];
  readonly sleep: readonly SleepSample[];
  readonly hrv: readonly HRVSample[];
}

const EMPTY: HealthSamples24h = Object.freeze({
  steps: Object.freeze([]),
  sleep: Object.freeze([]),
  hrv: Object.freeze([]),
});

// Pulls the rolling 24h window of health samples from the runtime provider.
// Re-fetches on each `nowMs` tick the caller provides; subscribes to push
// events so freshly-emitted samples flow in without polling.
export function useHealthSamples(nowMs: number): HealthSamples24h {
  const { health } = useRuntimeProviders();
  const [samples, setSamples] = useState<HealthSamples24h>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    const from = nowMs - 24 * H;
    void Promise.all([
      health.getSteps(from, nowMs),
      health.getSleep(from, nowMs),
      health.getHRV(from, nowMs),
    ]).then(([steps, sleep, hrv]) => {
      if (cancelled) return;
      setSamples({ steps, sleep, hrv });
    });
    return () => {
      cancelled = true;
    };
  }, [health, nowMs]);

  // Subscribe to live emissions so push-based providers update mid-tick.
  useEffect(() => {
    const offSteps = health.subscribe('steps', () => {
      const from = Date.now() - 24 * H;
      void health.getSteps(from, Date.now()).then((steps) => {
        setSamples((s) => ({ ...s, steps }));
      });
    });
    const offSleep = health.subscribe('sleep', () => {
      const from = Date.now() - 24 * H;
      void health.getSleep(from, Date.now()).then((sleep) => {
        setSamples((s) => ({ ...s, sleep }));
      });
    });
    const offHrv = health.subscribe('hrv', () => {
      const from = Date.now() - 24 * H;
      void health.getHRV(from, Date.now()).then((hrv) => {
        setSamples((s) => ({ ...s, hrv }));
      });
    });
    return () => {
      offSteps();
      offSleep();
      offHrv();
    };
  }, [health]);

  return samples;
}
