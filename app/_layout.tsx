import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { usePetTick } from '../src/ui/hooks/use-pet-tick';
import { setupNotificationHandler } from '../src/ui/notifications/handler-setup';
import { useNotificationScheduler } from '../src/ui/notifications/scheduler-hook';
import { RuntimeProvidersProvider } from '../src/ui/providers/runtime-providers-context';
import { ThemeProvider } from '../src/ui/theme/theme-provider';

// Module-level — runs once per JS bundle load. Idempotent.
setupNotificationHandler();

function PetTickDriver(): null {
  usePetTick();
  return null;
}

function NotificationScheduler(): null {
  useNotificationScheduler();
  return null;
}

export default function RootLayout(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RuntimeProvidersProvider>
          <ThemeProvider>
            <PetTickDriver />
            <NotificationScheduler />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="notifications-permission" options={{ presentation: 'modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </RuntimeProvidersProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
