import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '../../core/i18n/t';
import { SettingRow } from '../components/setting-row';
import { useHaptics } from '../haptics/use-haptics';
import { usePetSnapshotStore } from '../store/pet-snapshot-store';
import { useSettingsStore } from '../store/settings-store';
import { useTheme } from '../theme/use-theme';
import type { ThemeMode } from '../theme/types';

const THEME_MODES: readonly ThemeMode[] = ['auto', 'light', 'dark'];

function ThemeModeRow(): React.JSX.Element {
  const { palette } = useTheme();
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const haptics = useHaptics();

  return (
    <View
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomColor: palette.border,
        borderBottomWidth: 1,
      }}
    >
      <Text style={{ color: palette.text, fontSize: 16, fontWeight: '500', marginBottom: 8 }}>
        {t('setting.language', 'zh-CN').replace('语言', '主题')}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {THEME_MODES.map((mode) => {
          const active = mode === theme;
          return (
            <Pressable
              key={mode}
              accessibilityRole="button"
              accessibilityLabel={`Set theme ${mode}`}
              accessibilityState={{ selected: active }}
              onPress={() => {
                haptics.trigger('selection');
                setTheme(mode);
              }}
              hitSlop={6}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: active ? palette.accent : palette.surfaceMuted,
              }}
              testID={`theme-${mode}`}
            >
              <Text
                style={{
                  color: active ? '#FFFFFF' : palette.text,
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                {mode}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function SettingsScreen(): React.JSX.Element {
  const { palette } = useTheme();
  const haptics = useSettingsStore((s) => s.haptics);
  const sound = useSettingsStore((s) => s.sound);
  const setHaptics = useSettingsStore((s) => s.setHaptics);
  const setSound = useSettingsStore((s) => s.setSound);
  const clearPetSnapshot = usePetSnapshotStore((s) => s.clear);
  const haptic = useHaptics();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView contentContainerStyle={{ paddingVertical: 16 }}>
        <Text
          style={{
            color: palette.textMuted,
            fontSize: 12,
            paddingHorizontal: 16,
            paddingTop: 8,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {t('title.settings', 'zh-CN')}
        </Text>

        <SettingRow
          label={t('setting.sound', 'zh-CN')}
          value={sound}
          onChange={setSound}
          testID="toggle-sound"
        />
        <SettingRow
          label={t('setting.notifications', 'zh-CN').replace('通知', '触感')}
          description="按键时震动反馈"
          value={haptics}
          onChange={setHaptics}
          testID="toggle-haptics"
        />
        <ThemeModeRow />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset pet"
          onPress={() => {
            haptic.trigger('medium');
            clearPetSnapshot();
          }}
          style={{
            marginTop: 24,
            marginHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: palette.surfaceMuted,
            borderRadius: 12,
            alignItems: 'center',
          }}
          testID="reset-pet"
        >
          <Text style={{ color: palette.text, fontSize: 15, fontWeight: '600' }}>
            {t('action.reset', 'zh-CN')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="link"
          accessibilityLabel="About"
          onPress={() => haptic.trigger('selection')}
          style={{
            marginTop: 12,
            marginHorizontal: 16,
            paddingVertical: 14,
            alignItems: 'center',
          }}
          testID="about-link"
        >
          <Text style={{ color: palette.textMuted, fontSize: 14 }}>About · v0.0.0</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
