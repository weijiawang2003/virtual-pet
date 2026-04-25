import { Pressable, ScrollView, Text, View } from 'react-native';

import { daysInMonth, type BirthdayMD } from '../store/user-profile-store';
import { useTheme } from '../theme/use-theme';

interface BirthdayPickerProps {
  readonly value: BirthdayMD | null;
  readonly onChange: (next: BirthdayMD) => void;
}

const MONTHS = Array.from({ length: 12 }, (_v, i) => i + 1);

export function BirthdayPicker({ value, onChange }: BirthdayPickerProps): React.JSX.Element {
  const { palette } = useTheme();
  const month = value?.month ?? 1;
  const day = value?.day ?? 1;
  const days = Array.from({ length: daysInMonth(month) }, (_v, i) => i + 1);

  function pick(nextMonth: number, nextDay: number): void {
    const max = daysInMonth(nextMonth);
    onChange({ month: nextMonth, day: Math.min(nextDay, max) });
  }

  function pill(
    label: string,
    selected: boolean,
    onPress: () => void,
    testID?: string,
  ): React.JSX.Element {
    return (
      <Pressable
        key={label + (selected ? '-on' : '')}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected }}
        onPress={onPress}
        hitSlop={4}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          marginRight: 6,
          borderRadius: 999,
          backgroundColor: selected ? palette.accent : palette.surfaceMuted,
        }}
        testID={testID}
      >
        <Text
          style={{ color: selected ? '#FFFFFF' : palette.text, fontSize: 14, fontWeight: '600' }}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <View>
      <Text style={{ color: palette.textMuted, fontSize: 12, marginBottom: 6 }}>月</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {MONTHS.map((m) => pill(String(m), m === month, () => pick(m, day), `birthday-month-${m}`))}
      </ScrollView>
      <Text style={{ color: palette.textMuted, fontSize: 12, marginBottom: 6 }}>日</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {days.map((d) => pill(String(d), d === day, () => pick(month, d), `birthday-day-${d}`))}
      </ScrollView>
    </View>
  );
}
