import { Text, View } from 'react-native';

import { useTheme } from '../theme/use-theme';

interface StatRingProps {
  readonly label: string;
  readonly value: number;
  readonly max?: number;
  readonly size?: number;
}

// Phase 15 keeps the visual identical to Phase 14's placeholder ring so we
// don't gate runtime wiring on artwork. A proper segmented arc lands later.
export function StatRing(props: StatRingProps): React.JSX.Element {
  const { label, value, max = 100, size = 60 } = props;
  const { palette } = useTheme();
  const clamped = Math.max(0, Math.min(max, Math.round(value)));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`${label} ${clamped} of ${max}`}
      accessibilityValue={{ now: clamped, min: 0, max }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 4,
        borderColor: palette.border,
        backgroundColor: palette.surface,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: palette.text, fontSize: 12, fontWeight: '700' }}>{clamped}</Text>
      <Text style={{ color: palette.textMuted, fontSize: 9, letterSpacing: 0.5 }}>{label}</Text>
    </View>
  );
}
