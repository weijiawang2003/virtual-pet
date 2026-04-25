import { Text, View } from 'react-native';

import { useTheme } from '../theme/use-theme';

interface StatRingPlaceholderProps {
  readonly label: string;
  readonly value: number;
  readonly size?: number;
}

export function StatRingPlaceholder(props: StatRingPlaceholderProps): React.JSX.Element {
  const { label, value, size = 60 } = props;
  const { palette } = useTheme();
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`${label} ${clamped}`}
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
