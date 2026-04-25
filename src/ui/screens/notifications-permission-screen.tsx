import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useHaptics } from '../haptics/use-haptics';
import { useRuntimeProviders } from '../providers/runtime-providers-context';
import { useSettingsStore } from '../store/settings-store';
import { useUserProfileStore } from '../store/user-profile-store';
import { useTheme } from '../theme/use-theme';
import type { PermissionStatus } from '../../providers/permissions/types';

function mapExpoStatus(s: Notifications.NotificationPermissionsStatus): PermissionStatus {
  if (s.granted) return 'granted';
  // iOS provisional / ephemeral grants surface here. Phase 4 maps both to 'limited'.
  if (s.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) return 'limited';
  if (s.ios?.status === Notifications.IosAuthorizationStatus.EPHEMERAL) return 'limited';
  if (s.canAskAgain && s.status === 'undetermined') return 'notDetermined';
  return 'denied';
}

export function NotificationsPermissionScreen(): React.JSX.Element {
  const { palette } = useTheme();
  const haptics = useHaptics();
  const { permissions } = useRuntimeProviders();
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const setNotificationsAskedAt = useSettingsStore((s) => s.setNotificationsAskedAt);
  const profileName = useUserProfileStore((s) => s.name);
  const [busy, setBusy] = useState<boolean>(false);

  const petName = profileName.length > 0 ? profileName : '宠物';

  async function ask(): Promise<void> {
    haptics.trigger('light');
    setBusy(true);
    try {
      const result = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      });
      const status = mapExpoStatus(result);
      permissions.set('notifications', status);
      setNotificationsEnabled(status === 'granted' || status === 'limited');
      setNotificationsAskedAt(Date.now());
    } finally {
      setBusy(false);
      router.back();
    }
  }

  function later(): void {
    haptics.trigger('selection');
    setNotificationsEnabled(false);
    setNotificationsAskedAt(Date.now());
    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 }}>
        <Text
          style={{
            color: palette.textMuted,
            fontSize: 12,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
          }}
        >
          通知
        </Text>
        <Text style={{ color: palette.text, fontSize: 26, fontWeight: '700', marginTop: 12 }}>
          让 {petName} 能在你想起它时叫你
        </Text>
        <Text
          style={{
            color: palette.textMuted,
            fontSize: 15,
            lineHeight: 22,
            marginTop: 14,
          }}
        >
          提醒最多每天 3 条,完全在你设备上生成,不联网。{'\n'}
          想关随时关。
        </Text>

        <View style={{ flex: 1 }} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Allow notifications"
          accessibilityState={{ disabled: busy }}
          disabled={busy}
          onPress={ask}
          style={{
            paddingVertical: 14,
            backgroundColor: palette.accent,
            borderRadius: 14,
            alignItems: 'center',
            opacity: busy ? 0.6 : 1,
          }}
          testID="notifications-allow"
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>允许通知</Text>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Skip notifications"
          onPress={later}
          style={{ paddingVertical: 14, alignItems: 'center', marginTop: 4 }}
          testID="notifications-skip"
        >
          <Text style={{ color: palette.textMuted, fontSize: 14 }}>稍后再说</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
