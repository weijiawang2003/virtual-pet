import type { Disposer, HealthKitProvider } from './types';

// TODO(Phase 10): wire @kingstinct/react-native-healthkit (Nitro Modules).
//   - requestAuthorization for stepCount / sleepAnalysis / heartRateVariabilitySDNN
//   - sampleQuery + observerQuery for push subscriptions
//   - background delivery requires enableBackgroundDelivery + a background task
//   Needs Dev Client, HealthKit capability in Info.plist, Signing & Capabilities.

const NOT_IMPLEMENTED = 'RealHealthKitProvider is not wired — TODO(Phase 10).';

export const realHealthKitProvider: HealthKitProvider = {
  getSteps: () => Promise.reject(new Error(NOT_IMPLEMENTED)),
  getSleep: () => Promise.reject(new Error(NOT_IMPLEMENTED)),
  getHRV: () => Promise.reject(new Error(NOT_IMPLEMENTED)),
  subscribe: ((): Disposer => {
    throw new Error(NOT_IMPLEMENTED);
  }) as HealthKitProvider['subscribe'],
};
