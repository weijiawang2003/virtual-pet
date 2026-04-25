import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { usePetTick } from '../src/ui/hooks/use-pet-tick';
import { RuntimeProvidersProvider } from '../src/ui/providers/runtime-providers-context';
import { ThemeProvider } from '../src/ui/theme/theme-provider';

function PetTickDriver(): null {
  usePetTick();
  return null;
}

export default function RootLayout(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RuntimeProvidersProvider>
          <ThemeProvider>
            <PetTickDriver />
            <Stack screenOptions={{ headerShown: false }} />
            <StatusBar style="auto" />
          </ThemeProvider>
        </RuntimeProvidersProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
