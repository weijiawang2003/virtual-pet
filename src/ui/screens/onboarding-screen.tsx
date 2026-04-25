import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BirthdayPicker } from '../components/birthday-picker';
import { NameInput } from '../components/name-input';
import { useHaptics } from '../haptics/use-haptics';
import { useSettingsStore } from '../store/settings-store';
import { useUserProfileStore, type BirthdayMD } from '../store/user-profile-store';
import { useTheme } from '../theme/use-theme';

type Step = 'welcome' | 'name' | 'birthday';

export function OnboardingScreen(): React.JSX.Element {
  const { palette } = useTheme();
  const haptics = useHaptics();
  const setName = useUserProfileStore((s) => s.setName);
  const setBirthday = useUserProfileStore((s) => s.setBirthday);
  const setOnboardingCompleted = useSettingsStore((s) => s.setOnboardingCompleted);

  const [step, setStep] = useState<Step>('welcome');
  const [draftName, setDraftName] = useState<string>('');
  const [draftBirthday, setDraftBirthday] = useState<BirthdayMD | null>(null);

  const trimmedName = draftName.trim();
  const nameValid = trimmedName.length >= 1 && trimmedName.length <= 24;

  function next(): void {
    haptics.trigger('light');
    if (step === 'welcome') setStep('name');
    else if (step === 'name') setStep('birthday');
  }

  function complete(): void {
    haptics.trigger('medium');
    setName(trimmedName);
    setBirthday(draftBirthday);
    setOnboardingCompleted(true);
    router.replace('/');
  }

  function skip(): void {
    haptics.trigger('selection');
    setName('');
    setBirthday(null);
    setOnboardingCompleted(true);
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
          {step === 'welcome' ? 'Step 1 / 3' : step === 'name' ? 'Step 2 / 3' : 'Step 3 / 3'}
        </Text>

        {step === 'welcome' && (
          <View style={{ marginTop: 24 }} testID="onboarding-welcome">
            <Text style={{ color: palette.text, fontSize: 28, fontWeight: '700' }}>
              欢迎来到 Virtual Pet
            </Text>
            <Text style={{ color: palette.textMuted, fontSize: 15, marginTop: 12, lineHeight: 22 }}>
              一只完全本地、不联网的小宠物。它会跟着你的真实生活节奏成长。{'\n\n'}
              我们会先问你两个问题。
            </Text>
            <ContinueButton label="开始" onPress={next} testID="onboarding-welcome-continue" />
          </View>
        )}

        {step === 'name' && (
          <View style={{ marginTop: 24 }} testID="onboarding-name">
            <Text style={{ color: palette.text, fontSize: 24, fontWeight: '700' }}>
              给宠物起个名字
            </Text>
            <Text style={{ color: palette.textMuted, fontSize: 14, marginTop: 8, lineHeight: 20 }}>
              名字之后可以改。1–24 个字符。
            </Text>
            <View style={{ marginTop: 16 }}>
              <NameInput
                value={draftName}
                onChangeText={setDraftName}
                placeholder="比如:皮卡"
                testID="onboarding-name-input"
              />
            </View>
            <ContinueButton
              label="下一步"
              onPress={next}
              disabled={!nameValid}
              testID="onboarding-name-continue"
            />
          </View>
        )}

        {step === 'birthday' && (
          <View style={{ marginTop: 24 }} testID="onboarding-birthday">
            <Text style={{ color: palette.text, fontSize: 24, fontWeight: '700' }}>你的生日?</Text>
            <Text style={{ color: palette.textMuted, fontSize: 14, marginTop: 8, lineHeight: 20 }}>
              这一天宠物会戴生日帽给你。只用月、日,不存年份。
            </Text>
            <View style={{ marginTop: 16 }}>
              <BirthdayPicker value={draftBirthday} onChange={setDraftBirthday} />
            </View>
            <ContinueButton
              label="完成"
              onPress={complete}
              testID="onboarding-complete"
              disabled={draftBirthday === null}
            />
          </View>
        )}

        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Skip onboarding"
          onPress={skip}
          style={{ marginTop: 32, alignItems: 'center', paddingVertical: 12 }}
          testID="onboarding-skip"
        >
          <Text style={{ color: palette.textMuted, fontSize: 13 }}>稍后再设</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

interface ContinueButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly testID?: string;
}

function ContinueButton(props: ContinueButtonProps): React.JSX.Element {
  const { label, onPress, disabled = false, testID } = props;
  const { palette } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        marginTop: 28,
        paddingVertical: 14,
        backgroundColor: disabled ? palette.surfaceMuted : palette.accent,
        borderRadius: 14,
        alignItems: 'center',
        opacity: disabled ? 0.6 : 1,
      }}
      testID={testID}
    >
      <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}
