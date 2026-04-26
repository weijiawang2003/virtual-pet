import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RuntimeProvidersProvider } from '../../providers/runtime-providers-context';
import { storage } from '../../store/mmkv';
import { useSettingsStore } from '../../store/settings-store';
import { ThemeProvider } from '../../theme/theme-provider';
import { SignalsOnboardingScreen } from '../signals-onboarding-screen';

const FRAME = {
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function renderScreen(): ReturnType<typeof render> {
  return render(
    <SafeAreaProvider initialMetrics={FRAME}>
      <RuntimeProvidersProvider>
        <ThemeProvider>
          <SignalsOnboardingScreen />
        </ThemeProvider>
      </RuntimeProvidersProvider>
    </SafeAreaProvider>,
  );
}

describe('SignalsOnboardingScreen', () => {
  beforeEach(() => {
    storage.clearAll();
    useSettingsStore.persist.clearStorage();
    useSettingsStore.getState().reset();
  });

  it('renders the three signal toggles + done + later', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('signals-health-toggle')).toBeTruthy();
    expect(getByTestId('signals-location-toggle')).toBeTruthy();
    expect(getByTestId('signals-appstate-toggle')).toBeTruthy();
    expect(getByTestId('signals-done')).toBeTruthy();
    expect(getByTestId('signals-later')).toBeTruthy();
  });

  it('toggling a SettingRow flips the matching settings flag', () => {
    const { getByTestId } = renderScreen();
    expect(useSettingsStore.getState().signalsHealthEnabled).toBe(false);
    fireEvent(getByTestId('signals-health-toggle'), 'valueChange', true);
    expect(useSettingsStore.getState().signalsHealthEnabled).toBe(true);
  });

  it('done() stamps signalsOnboardingShownAt', () => {
    const { getByTestId } = renderScreen();
    expect(useSettingsStore.getState().signalsOnboardingShownAt).toBeNull();
    fireEvent.press(getByTestId('signals-done'));
    expect(useSettingsStore.getState().signalsOnboardingShownAt).not.toBeNull();
  });

  it('later() stamps signalsOnboardingShownAt and leaves toggles off', () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('signals-later'));
    const s = useSettingsStore.getState();
    expect(s.signalsOnboardingShownAt).not.toBeNull();
    expect(s.signalsHealthEnabled).toBe(false);
    expect(s.signalsLocationEnabled).toBe(false);
    expect(s.signalsAppStateEnabled).toBe(false);
  });
});
