import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { recoveryFromSignal } from '../../core/vitality/recovery-rules';
import type { VitalitySource } from '../../core/vitality/types';
import { createAppStateSource } from '../../providers/signals/app-state-source';
import { createHealthSignalSource } from '../../providers/signals/health-signal-source';
import { createLocationSignalSource } from '../../providers/signals/location-signal-source';
import { createSignalBus, type SignalBus } from '../../providers/signals/signal-bus';
import { usePetSnapshotStore } from '../store/pet-snapshot-store';
import { useSettingsStore } from '../store/settings-store';
import { useVitalityStore } from '../store/vitality-store';
import { useRuntimeProviders } from './runtime-providers-context';

const HEALTH_SIGNAL_KINDS = new Set([
  'steps_delta',
  'sleep_session',
  'workout',
  'activity_classified',
]);

function vitalitySourceFor(signalType: string): VitalitySource {
  if (HEALTH_SIGNAL_KINDS.has(signalType)) return 'health';
  return 'inferred';
}

interface SignalBusContextValue {
  readonly bus: SignalBus;
  readonly tick: number;
}

const SignalBusContext = createContext<SignalBusContextValue | null>(null);

export function SignalBusProvider({
  children,
}: {
  readonly children: ReactNode;
}): React.JSX.Element {
  const { health, location } = useRuntimeProviders();
  const [tick, setTick] = useState(0);

  const bus = useMemo(() => {
    const inner = createSignalBus({
      dispatch: (event) => {
        usePetSnapshotStore.getState().dispatch(event);
      },
      getPet: () => usePetSnapshotStore.getState().pet,
      onChange: () => setTick((n) => n + 1),
    });
    // Wrap emit so every signal — recognized or not — also feeds the
    // vitality store via the pure recovery-rules mapping. Translator
    // dispatch path is untouched; vitality is a side-channel.
    return {
      ...inner,
      emit(signal) {
        inner.emit(signal);
        const delta = recoveryFromSignal(signal);
        if (delta !== 0) {
          useVitalityStore.getState().recover(delta, vitalitySourceFor(signal.type));
        }
      },
    } satisfies SignalBus;
  }, []);

  const signalsHealthEnabled = useSettingsStore((s) => s.signalsHealthEnabled);
  const signalsLocationEnabled = useSettingsStore((s) => s.signalsLocationEnabled);
  const signalsAppStateEnabled = useSettingsStore((s) => s.signalsAppStateEnabled);

  useEffect(() => {
    if (!signalsHealthEnabled) return;
    const src = createHealthSignalSource({ health, emit: (s) => bus.emit(s) });
    return src.start();
  }, [signalsHealthEnabled, health, bus]);

  useEffect(() => {
    if (!signalsLocationEnabled) return;
    const src = createLocationSignalSource({ location, emit: (s) => bus.emit(s) });
    return src.start();
  }, [signalsLocationEnabled, location, bus]);

  useEffect(() => {
    if (!signalsAppStateEnabled) return;
    const src = createAppStateSource({ emit: (s) => bus.emit(s) });
    return src.start();
  }, [signalsAppStateEnabled, bus]);

  const value = useMemo(() => ({ bus, tick }), [bus, tick]);

  return <SignalBusContext.Provider value={value}>{children}</SignalBusContext.Provider>;
}

export function useSignalBus(): SignalBusContextValue {
  const ctx = useContext(SignalBusContext);
  if (ctx === null) {
    throw new Error('useSignalBus called outside <SignalBusProvider>');
  }
  return ctx;
}
