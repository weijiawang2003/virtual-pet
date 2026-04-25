import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { storage } from '../../store/mmkv';
import { usePetSnapshotStore } from '../../store/pet-snapshot-store';
import { useSettingsStore } from '../../store/settings-store';
import { ThemeProvider } from '../../theme/theme-provider';
import { HomeScreen } from '../home-screen';

// Pin the wall clock so weather/solar/lunar/dayOfYear-derived output stays
// deterministic across test runs.
const FIXED_NOW = Date.UTC(2026, 3, 24, 6, 0, 0);

const FRAME = {
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function renderHome(): ReturnType<typeof render> {
  return render(
    <SafeAreaProvider initialMetrics={FRAME}>
      <ThemeProvider>
        <HomeScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('HomeScreen layout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
    storage.clearAll();
    usePetSnapshotStore.persist.clearStorage();
    useSettingsStore.persist.clearStorage();
    useSettingsStore.getState().reset();
    usePetSnapshotStore.getState().reset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the four action buttons with accessibility labels', () => {
    const { getByLabelText } = renderHome();
    expect(getByLabelText('Feed pet')).toBeTruthy();
    expect(getByLabelText('Play with pet')).toBeTruthy();
    expect(getByLabelText('Clean pet')).toBeTruthy();
    expect(getByLabelText('Rest pet')).toBeTruthy();
  });

  it('renders the pet sprite (egg stage at fresh launch)', () => {
    const { getByLabelText } = renderHome();
    // a11y label = "<stage> pet · <mood> · <animation>". Fresh pet → egg.
    // Mood/animation are derived from compose; we only assert the stage prefix.
    expect(getByLabelText(/^egg pet /)).toBeTruthy();
  });

  it('renders the four stat rings with real values', () => {
    const { getByLabelText } = renderHome();
    // satiety/energy/happiness all start at 70.
    expect(getByLabelText('饱 70 of 100')).toBeTruthy();
    expect(getByLabelText('力 70 of 100')).toBeTruthy();
    expect(getByLabelText('心 70 of 100')).toBeTruthy();
  });

  it('matches the layout snapshot', () => {
    const tree = renderHome().toJSON();
    expect(tree).toMatchSnapshot();
  });
});
