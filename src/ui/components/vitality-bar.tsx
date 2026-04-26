import { Text, View } from 'react-native';

import { useTheme } from '../theme/use-theme';

interface VitalityBarProps {
  readonly current: number;
  readonly cap: number;
  readonly testID?: string;
}

// Minimal horizontal vitality readout. Track + filled bar + numeric label.
// Pure presentation — no store access, no haptics.
export function VitalityBar(props: VitalityBarProps): React.JSX.Element {
  const { current, cap, testID } = props;
  const { palette } = useTheme();
  const ratio = cap <= 0 ? 0 : Math.max(0, Math.min(1, current / cap));
  const pct = Math.round(ratio * 100);

  return (
    <View
      accessibilityLabel={`Vitality ${Math.round(current)} of ${cap}`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: cap, now: Math.round(current) }}
      style={{ paddingHorizontal: 4 }}
      testID={testID}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}
      >
        <Text style={{ color: palette.textMuted, fontSize: 11, letterSpacing: 1 }}>元气</Text>
        <Text style={{ color: palette.textMuted, fontSize: 11 }}>
          {Math.round(current)} / {cap}
        </Text>
      </View>
      <View
        style={{
          height: 6,
          backgroundColor: palette.surfaceMuted,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: palette.accent,
          }}
        />
      </View>
    </View>
  );
}
