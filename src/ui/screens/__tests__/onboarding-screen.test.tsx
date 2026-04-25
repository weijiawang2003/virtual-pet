import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { storage } from '../../store/mmkv';
import { useSettingsStore } from '../../store/settings-store';
import { useUserProfileStore } from '../../store/user-profile-store';
import { ThemeProvider } from '../../theme/theme-provider';
import { OnboardingScreen } from '../onboarding-screen';

const FRAME = {
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function renderOnboarding(): ReturnType<typeof render> {
  return render(
    <SafeAreaProvider initialMetrics={FRAME}>
      <ThemeProvider>
        <OnboardingScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('OnboardingScreen', () => {
  beforeEach(() => {
    storage.clearAll();
    useSettingsStore.persist.clearStorage();
    useUserProfileStore.persist.clearStorage();
    useSettingsStore.getState().reset();
    useUserProfileStore.getState().clear();
  });

  it('starts on the welcome step', () => {
    const { getByTestId } = renderOnboarding();
    expect(getByTestId('onboarding-welcome')).toBeTruthy();
  });

  it('progresses welcome → name → birthday', () => {
    const { getByTestId } = renderOnboarding();
    fireEvent.press(getByTestId('onboarding-welcome-continue'));
    expect(getByTestId('onboarding-name')).toBeTruthy();
    fireEvent.changeText(getByTestId('onboarding-name-input'), '皮卡');
    fireEvent.press(getByTestId('onboarding-name-continue'));
    expect(getByTestId('onboarding-birthday')).toBeTruthy();
  });

  it('disables name continue while name is empty', () => {
    const { getByTestId } = renderOnboarding();
    fireEvent.press(getByTestId('onboarding-welcome-continue'));
    const continueBtn = getByTestId('onboarding-name-continue');
    expect(continueBtn.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it('skip flips onboardingCompleted true and leaves profile empty', () => {
    const { getByTestId } = renderOnboarding();
    fireEvent.press(getByTestId('onboarding-skip'));
    expect(useSettingsStore.getState().onboardingCompleted).toBe(true);
    expect(useUserProfileStore.getState().name).toBe('');
    expect(useUserProfileStore.getState().birthday).toBeNull();
  });

  it('complete writes profile and flips onboardingCompleted true', () => {
    const { getByTestId } = renderOnboarding();
    fireEvent.press(getByTestId('onboarding-welcome-continue'));
    fireEvent.changeText(getByTestId('onboarding-name-input'), '皮卡');
    fireEvent.press(getByTestId('onboarding-name-continue'));
    // Pick April 24 as birthday.
    fireEvent.press(getByTestId('birthday-month-4'));
    fireEvent.press(getByTestId('birthday-day-24'));
    fireEvent.press(getByTestId('onboarding-complete'));
    expect(useSettingsStore.getState().onboardingCompleted).toBe(true);
    expect(useUserProfileStore.getState().name).toBe('皮卡');
    expect(useUserProfileStore.getState().birthday).toEqual({ month: 4, day: 24 });
  });
});
