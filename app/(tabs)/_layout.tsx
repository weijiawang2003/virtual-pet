import { Redirect, type Href } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useSettingsStore } from '../../src/ui/store/settings-store';

// typedRoutes regenerates `.expo/types` only when Metro is running. The
// `/onboarding` literal isn't yet in the type map at the time tsc runs in
// CI, so we cast through Href once. Removing this is safe after the first
// `expo start` regenerates types.
const ONBOARDING_HREF = '/onboarding' as Href;

export default function TabsLayout(): React.JSX.Element {
  const onboardingCompleted = useSettingsStore((s) => s.onboardingCompleted);
  if (!onboardingCompleted) {
    return <Redirect href={ONBOARDING_HREF} />;
  }
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index" options={{ title: 'Home', icon: { sf: 'house.fill' } }} />
      <NativeTabs.Trigger
        name="memory"
        options={{ title: 'Memory', icon: { sf: 'photo.on.rectangle' } }}
      />
      <NativeTabs.Trigger
        name="settings"
        options={{ title: 'Settings', icon: { sf: 'gearshape.fill' } }}
      />
    </NativeTabs>
  );
}
