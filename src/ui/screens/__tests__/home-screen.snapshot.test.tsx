import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { storage } from '../../store/mmkv';
import { useSettingsStore } from '../../store/settings-store';
import { ThemeProvider } from '../../theme/theme-provider';
import { HomeScreen } from '../home-screen';

describe('HomeScreen layout', () => {
  beforeEach(() => {
    storage.clearAll();
    useSettingsStore.persist.clearStorage();
    useSettingsStore.getState().reset();
  });

  it('renders the four action buttons with accessibility labels', () => {
    const { getByLabelText } = render(
      <SafeAreaProvider
        initialMetrics={{
          insets: { top: 0, bottom: 0, left: 0, right: 0 },
          frame: { x: 0, y: 0, width: 390, height: 844 },
        }}
      >
        <ThemeProvider>
          <HomeScreen />
        </ThemeProvider>
      </SafeAreaProvider>,
    );
    expect(getByLabelText('Feed pet')).toBeTruthy();
    expect(getByLabelText('Play with pet')).toBeTruthy();
    expect(getByLabelText('Clean pet')).toBeTruthy();
    expect(getByLabelText('Rest pet')).toBeTruthy();
  });

  it('renders the pet placeholder', () => {
    const { getByLabelText } = render(
      <SafeAreaProvider
        initialMetrics={{
          insets: { top: 0, bottom: 0, left: 0, right: 0 },
          frame: { x: 0, y: 0, width: 390, height: 844 },
        }}
      >
        <ThemeProvider>
          <HomeScreen />
        </ThemeProvider>
      </SafeAreaProvider>,
    );
    expect(getByLabelText('Pet placeholder')).toBeTruthy();
  });

  it('matches the layout snapshot', () => {
    const tree = render(
      <SafeAreaProvider
        initialMetrics={{
          insets: { top: 0, bottom: 0, left: 0, right: 0 },
          frame: { x: 0, y: 0, width: 390, height: 844 },
        }}
      >
        <ThemeProvider>
          <HomeScreen />
        </ThemeProvider>
      </SafeAreaProvider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
