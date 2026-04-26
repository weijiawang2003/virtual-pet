import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '../../core/i18n/t';
import { SettingRow } from '../components/setting-row';
import { useHaptics } from '../haptics/use-haptics';
import { useRuntimeProviders } from '../providers/runtime-providers-context';
import { useSignalBus } from '../providers/signal-bus-context';
import { usePetSnapshotStore } from '../store/pet-snapshot-store';
import { DEMO_SPEED_OPTIONS, useSettingsStore, type DemoSpeed } from '../store/settings-store';
import { useUserProfileStore } from '../store/user-profile-store';
import { useTheme } from '../theme/use-theme';
import type { ThemeMode } from '../theme/types';

const THEME_MODES: readonly ThemeMode[] = ['auto', 'light', 'dark'];

function PillRow<T>(props: {
  label: string;
  options: readonly T[];
  current: T;
  format: (v: T) => string;
  onSelect: (v: T) => void;
  testIdPrefix: string;
}): React.JSX.Element {
  const { label, options, current, format, onSelect, testIdPrefix } = props;
  const { palette } = useTheme();
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
        {label}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {options.map((opt) => {
          const active = opt === current;
          const formatted = format(opt);
          return (
            <Pressable
              key={formatted}
              accessibilityRole="button"
              accessibilityLabel={`${label} ${formatted}`}
              accessibilityState={{ selected: active }}
              hitSlop={6}
              onPress={() => {
                haptics.trigger('selection');
                onSelect(opt);
              }}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: active ? palette.accent : palette.surfaceMuted,
              }}
              testID={`${testIdPrefix}-${formatted}`}
            >
              <Text
                style={{
                  color: active ? '#FFFFFF' : palette.text,
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                {formatted}
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
  const theme = useSettingsStore((s) => s.theme);
  const demoSpeed = useSettingsStore((s) => s.demoSpeed);
  const setHaptics = useSettingsStore((s) => s.setHaptics);
  const setSound = useSettingsStore((s) => s.setSound);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setDemoSpeed = useSettingsStore((s) => s.setDemoSpeed);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const signalsHealthEnabled = useSettingsStore((s) => s.signalsHealthEnabled);
  const signalsLocationEnabled = useSettingsStore((s) => s.signalsLocationEnabled);
  const signalsAppStateEnabled = useSettingsStore((s) => s.signalsAppStateEnabled);
  const setSignalsHealthEnabled = useSettingsStore((s) => s.setSignalsHealthEnabled);
  const setSignalsLocationEnabled = useSettingsStore((s) => s.setSignalsLocationEnabled);
  const setSignalsAppStateEnabled = useSettingsStore((s) => s.setSignalsAppStateEnabled);
  const setSignalsOnboardingShownAt = useSettingsStore((s) => s.setSignalsOnboardingShownAt);
  const resetPet = usePetSnapshotStore((s) => s.reset);
  const setOnboardingCompleted = useSettingsStore((s) => s.setOnboardingCompleted);
  const setNotificationsAskedAt = useSettingsStore((s) => s.setNotificationsAskedAt);
  const clearProfile = useUserProfileStore((s) => s.clear);
  const { notifications } = useRuntimeProviders();
  const { bus } = useSignalBus();
  const haptic = useHaptics();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const recentSignals = bus.recent();

  useEffect(() => {
    let cancelled = false;
    void notifications.listAll().then((list) => {
      if (!cancelled) setPendingCount(list.length);
    });
    return () => {
      cancelled = true;
    };
  }, [notifications, notificationsEnabled]);

  const onNotificationsToggle = (next: boolean): void => {
    setNotificationsEnabled(next);
    if (!next) {
      void notifications.cancelAll().then(() => setPendingCount(0));
    }
  };

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
          label="触感"
          description="按键时震动反馈"
          value={haptics}
          onChange={setHaptics}
          testID="toggle-haptics"
        />
        <SettingRow
          label="通知"
          description={`系统中已 schedule ${pendingCount} 条`}
          value={notificationsEnabled}
          onChange={onNotificationsToggle}
          testID="toggle-notifications"
        />

        <Text
          style={{
            color: palette.textMuted,
            fontSize: 12,
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          真实生活
        </Text>
        <SettingRow
          label="健康数据"
          description="走路 / 睡眠 / 心率变异度"
          value={signalsHealthEnabled}
          onChange={setSignalsHealthEnabled}
          testID="toggle-signals-health"
        />
        <SettingRow
          label="位置"
          description="离家时的好奇反应(只看进出家附近)"
          value={signalsLocationEnabled}
          onChange={setSignalsLocationEnabled}
          testID="toggle-signals-location"
        />
        <SettingRow
          label="使用习惯"
          description="长时间不碰手机 / 持续高强度使用"
          value={signalsAppStateEnabled}
          onChange={setSignalsAppStateEnabled}
          testID="toggle-signals-appstate"
        />
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 8,
          }}
        >
          <Text style={{ color: palette.textMuted, fontSize: 12 }}>
            最近信号: {recentSignals.length} 条
          </Text>
          {recentSignals.slice(0, 5).map((entry, i) => (
            <Text
              key={`${entry.emittedAt}-${i}`}
              style={{ color: palette.textMuted, fontSize: 11, marginTop: 2 }}
            >
              · {entry.signal.type} → {entry.events.length} 事件
            </Text>
          ))}
        </View>

        <PillRow<ThemeMode>
          label="主题"
          options={THEME_MODES}
          current={theme}
          format={(v) => v}
          onSelect={setTheme}
          testIdPrefix="theme"
        />
        <PillRow<DemoSpeed>
          label="演示速度"
          options={DEMO_SPEED_OPTIONS}
          current={demoSpeed}
          format={(v) => `×${v}`}
          onSelect={setDemoSpeed}
          testIdPrefix="speed"
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset pet"
          onPress={() => {
            haptic.trigger('medium');
            resetPet();
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
          accessibilityRole="button"
          accessibilityLabel="Reset onboarding"
          onPress={() => {
            haptic.trigger('selection');
            clearProfile();
            setOnboardingCompleted(false);
            setNotificationsAskedAt(null);
            setSignalsOnboardingShownAt(null);
            void notifications.cancelAll().then(() => setPendingCount(0));
          }}
          style={{
            marginTop: 12,
            marginHorizontal: 16,
            paddingVertical: 12,
            alignItems: 'center',
          }}
          testID="reset-onboarding"
        >
          <Text style={{ color: palette.textMuted, fontSize: 13 }}>Replay onboarding (dev)</Text>
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
