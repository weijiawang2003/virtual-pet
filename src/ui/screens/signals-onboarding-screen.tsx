import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingRow } from '../components/setting-row';
import { useHaptics } from '../haptics/use-haptics';
import { useSettingsStore } from '../store/settings-store';
import { useTheme } from '../theme/use-theme';

export function SignalsOnboardingScreen(): React.JSX.Element {
  const { palette } = useTheme();
  const haptics = useHaptics();
  const signalsHealthEnabled = useSettingsStore((s) => s.signalsHealthEnabled);
  const signalsLocationEnabled = useSettingsStore((s) => s.signalsLocationEnabled);
  const signalsAppStateEnabled = useSettingsStore((s) => s.signalsAppStateEnabled);
  const setHealth = useSettingsStore((s) => s.setSignalsHealthEnabled);
  const setLocation = useSettingsStore((s) => s.setSignalsLocationEnabled);
  const setAppState = useSettingsStore((s) => s.setSignalsAppStateEnabled);
  const setShownAt = useSettingsStore((s) => s.setSignalsOnboardingShownAt);

  function done(): void {
    haptics.trigger('medium');
    setShownAt(Date.now());
    router.replace('/');
  }

  function later(): void {
    haptics.trigger('selection');
    // Leave all toggles off; record that we've shown the screen so we
    // don't pester the user every cold launch.
    setShownAt(Date.now());
    router.replace('/');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}>
        <Text
          style={{
            color: palette.textMuted,
            fontSize: 12,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
          }}
        >
          真实生活
        </Text>
        <Text style={{ color: palette.text, fontSize: 26, fontWeight: '700', marginTop: 12 }}>
          让小宠物感知你的生活
        </Text>
        <Text
          style={{
            color: palette.textMuted,
            fontSize: 15,
            lineHeight: 22,
            marginTop: 14,
          }}
        >
          每个开关都可以单独打开,完全在设备上处理,不联网。{'\n'}
          全关也行,这只是让宠物的反应更贴近你的真实节奏。
        </Text>

        <View style={{ marginTop: 28 }}>
          <SettingRow
            label="健康数据"
            description="走路 / 睡眠 / 心率变异度 — 走得多它更有活力,睡得好它睡得安稳"
            value={signalsHealthEnabled}
            onChange={setHealth}
            testID="signals-health-toggle"
          />
          <SettingRow
            label="位置"
            description="离家时它会好奇你去了哪儿(只看进出家附近,不存轨迹)"
            value={signalsLocationEnabled}
            onChange={setLocation}
            testID="signals-location-toggle"
          />
          <SettingRow
            label="使用习惯"
            description="不碰手机一段时间,它会乖乖等;一直刷,它会担心"
            value={signalsAppStateEnabled}
            onChange={setAppState}
            testID="signals-appstate-toggle"
          />
        </View>

        <View style={{ marginTop: 32 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Done"
            onPress={done}
            style={{
              paddingVertical: 14,
              backgroundColor: palette.accent,
              borderRadius: 14,
              alignItems: 'center',
            }}
            testID="signals-done"
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>完成</Text>
          </Pressable>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Skip signals"
            onPress={later}
            style={{ paddingVertical: 14, alignItems: 'center', marginTop: 4 }}
            testID="signals-later"
          >
            <Text style={{ color: palette.textMuted, fontSize: 14 }}>稍后再说</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
