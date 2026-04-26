import { Alert } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { createPet } from '../../../core/pet/reducer';
import { storage } from '../../store/mmkv';
import { usePetSnapshotStore } from '../../store/pet-snapshot-store';
import { useVaultStore } from '../../store/vault-store';
import { ThemeProvider } from '../../theme/theme-provider';
import { VaultScreen } from '../vault-screen';

const FRAME = {
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function renderScreen(): ReturnType<typeof render> {
  return render(
    <SafeAreaProvider initialMetrics={FRAME}>
      <ThemeProvider>
        <VaultScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('VaultScreen', () => {
  beforeEach(() => {
    storage.clearAll();
    usePetSnapshotStore.persist.clearStorage();
    useVaultStore.persist.clearStorage();
    useVaultStore.getState().reset();
    usePetSnapshotStore.getState().reset();
  });

  it('renders the empty state when vault is empty', () => {
    const { getByTestId, getAllByText } = renderScreen();
    expect(getByTestId('vault-empty')).toBeTruthy();
    // Empty-state copy appears in both the header subtitle and the body.
    expect(getAllByText(/还没有其他小伙伴呢/).length).toBeGreaterThan(0);
  });

  it('renders cards for each acquired pet', () => {
    const id = useVaultStore.getState().acquirePet({
      archetypeId: 'moss',
      rarity: 'N',
      personality: ['lazy'],
      pet: createPet(0),
    });
    useVaultStore.getState().acquirePet({
      archetypeId: 'flicker',
      rarity: 'R',
      personality: ['energetic'],
      pet: createPet(0),
    });
    const { getByTestId } = renderScreen();
    expect(getByTestId(`vault-card-${id}`)).toBeTruthy();
  });

  it('long-press on inactive pet opens a confirmation dialog', () => {
    useVaultStore.getState().acquirePet({
      archetypeId: 'moss',
      rarity: 'N',
      personality: [],
      pet: createPet(0),
    });
    const inactiveId = useVaultStore.getState().acquirePet({
      archetypeId: 'flicker',
      rarity: 'R',
      personality: [],
      pet: createPet(0),
    });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const { getByTestId } = renderScreen();
    fireEvent(getByTestId(`vault-card-${inactiveId}`), 'longPress');
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('long-press on already-active pet does not prompt', () => {
    const activeId = useVaultStore.getState().acquirePet({
      archetypeId: 'moss',
      rarity: 'N',
      personality: [],
      pet: createPet(0),
    });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const { getByTestId } = renderScreen();
    fireEvent(getByTestId(`vault-card-${activeId}`), 'longPress');
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
