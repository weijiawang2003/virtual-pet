import { fireEvent, render } from '@testing-library/react-native';

import type { Quest } from '../../../core/quest/types';
import { ThemeProvider } from '../../theme/theme-provider';
import { QuestCard } from '../quest-card';

function makeQuest(overrides: Partial<Quest> = {}): Quest {
  return {
    id: 'q1',
    type: 'walk',
    threshold: 3000,
    rewardEssence: 5,
    rewardBond: 10,
    expiresAt: Date.now() + 1_000_000,
    state: 'offered',
    progress: 0,
    petId: 'p1',
    offeredAt: 0,
    acceptedAt: null,
    completedAt: null,
    ...overrides,
  };
}

function renderCard(
  quest: Quest,
  accept = jest.fn(),
  decline = jest.fn(),
): ReturnType<typeof render> {
  return render(
    <ThemeProvider>
      <QuestCard quest={quest} onAccept={accept} onDecline={decline} testID="quest-card" />
    </ThemeProvider>,
  );
}

describe('QuestCard', () => {
  it('renders the quest label and reward', () => {
    const { getByText } = renderCard(makeQuest());
    expect(getByText(/陪我走 3000 步/)).toBeTruthy();
    expect(getByText(/本源 \+5/)).toBeTruthy();
  });

  it('shows accept + decline buttons on offered quests', () => {
    const accept = jest.fn();
    const decline = jest.fn();
    const { getByTestId } = renderCard(makeQuest(), accept, decline);
    fireEvent.press(getByTestId('quest-accept'));
    expect(accept).toHaveBeenCalled();
    fireEvent.press(getByTestId('quest-decline'));
    expect(decline).toHaveBeenCalled();
  });

  it('shows progress bar instead of buttons when in_progress', () => {
    const { getByText, queryByTestId } = renderCard(
      makeQuest({ state: 'in_progress', progress: 1500 }),
    );
    expect(getByText(/1500 \/ 3000/)).toBeTruthy();
    expect(queryByTestId('quest-accept')).toBeNull();
  });

  it('shows progress bar when accepted (no buttons)', () => {
    const { queryByTestId } = renderCard(makeQuest({ state: 'accepted', progress: 0 }));
    expect(queryByTestId('quest-accept')).toBeNull();
  });
});
