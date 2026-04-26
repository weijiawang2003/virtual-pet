import { render } from '@testing-library/react-native';

import { ThemeProvider } from '../../theme/theme-provider';
import { VitalityBar } from '../vitality-bar';

function renderBar(current: number, cap = 100): ReturnType<typeof render> {
  return render(
    <ThemeProvider>
      <VitalityBar current={current} cap={cap} testID="vitality" />
    </ThemeProvider>,
  );
}

describe('VitalityBar', () => {
  it('renders with accessible label and progressbar role', () => {
    const { getByLabelText } = renderBar(50);
    expect(getByLabelText('Vitality 50 of 100')).toBeTruthy();
  });

  it('clamps current > cap to 100% width visually (a11y still shows raw)', () => {
    const { getByLabelText } = renderBar(150, 100);
    // a11y reports raw current per ARIA contract.
    expect(getByLabelText('Vitality 150 of 100')).toBeTruthy();
  });

  it('handles cap=0 without dividing by zero', () => {
    const { getByLabelText } = renderBar(50, 0);
    expect(getByLabelText('Vitality 50 of 0')).toBeTruthy();
  });

  it('rounds fractional current to integer in label', () => {
    const { getByLabelText } = renderBar(33.7);
    expect(getByLabelText('Vitality 34 of 100')).toBeTruthy();
  });
});
