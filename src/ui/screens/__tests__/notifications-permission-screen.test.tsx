import * as Notifications from 'expo-notifications';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RuntimeProvidersProvider } from '../../providers/runtime-providers-context';
import { storage } from '../../store/mmkv';
import { useSettingsStore } from '../../store/settings-store';
import { useUserProfileStore } from '../../store/user-profile-store';
import { ThemeProvider } from '../../theme/theme-provider';
import { NotificationsPermissionScreen } from '../notifications-permission-screen';

const FRAME = {
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function renderScreen(): ReturnType<typeof render> {
  return render(
    <SafeAreaProvider initialMetrics={FRAME}>
      <RuntimeProvidersProvider>
        <ThemeProvider>
          <NotificationsPermissionScreen />
        </ThemeProvider>
      </RuntimeProvidersProvider>
    </SafeAreaProvider>,
  );
}

describe('NotificationsPermissionScreen', () => {
  const requestMock = Notifications.requestPermissionsAsync as jest.Mock;

  beforeEach(() => {
    storage.clearAll();
    useSettingsStore.persist.clearStorage();
    useUserProfileStore.persist.clearStorage();
    useSettingsStore.getState().reset();
    useUserProfileStore.getState().clear();
    requestMock.mockClear();
  });

  it('renders the allow + skip buttons', () => {
    const { getByTestId } = renderScreen();
    expect(getByTestId('notifications-allow')).toBeTruthy();
    expect(getByTestId('notifications-skip')).toBeTruthy();
  });

  it('skip flips notificationsEnabled false and stamps notificationsAskedAt', () => {
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('notifications-skip'));
    const s = useSettingsStore.getState();
    expect(s.notificationsEnabled).toBe(false);
    expect(s.notificationsAskedAt).not.toBeNull();
  });

  it('allow → calls requestPermissionsAsync and stamps notificationsAskedAt on grant', async () => {
    requestMock.mockResolvedValueOnce({
      granted: true,
      canAskAgain: true,
      status: 'granted',
      ios: { status: 2 },
    });
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('notifications-allow'));
    await waitFor(() => {
      expect(requestMock).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(useSettingsStore.getState().notificationsAskedAt).not.toBeNull();
    });
    expect(useSettingsStore.getState().notificationsEnabled).toBe(true);
  });

  it('allow → denied response sets notificationsEnabled false', async () => {
    requestMock.mockResolvedValueOnce({
      granted: false,
      canAskAgain: false,
      status: 'denied',
      ios: { status: 1 },
    });
    const { getByTestId } = renderScreen();
    fireEvent.press(getByTestId('notifications-allow'));
    await waitFor(() => {
      expect(useSettingsStore.getState().notificationsAskedAt).not.toBeNull();
    });
    expect(useSettingsStore.getState().notificationsEnabled).toBe(false);
  });
});
