import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '../../core/i18n/t';
import { getActiveQuest } from '../../core/quest/quest-reducer';
import { compose } from '../../core/visual/compose';
import { VITALITY_COSTS } from '../../core/vitality/costs';
import { ActionButton } from '../components/action-button';
import { Bubble } from '../components/bubble';
import { PetSprite } from '../components/pet-sprite';
import { QuestCard } from '../components/quest-card';
import { StageBadge } from '../components/stage-badge';
import { StatRing } from '../components/stat-ring';
import { VitalityBar } from '../components/vitality-bar';
import { useLifeContext } from '../hooks/use-life-context';
import { usePetActions } from '../hooks/use-pet-actions';
import { useQuestStore } from '../store/quest-store';
import { useSettingsStore } from '../store/settings-store';
import { useVaultStore } from '../store/vault-store';
import { useVitalityStore } from '../store/vitality-store';
import { useTheme } from '../theme/use-theme';

const PERMISSION_PROMPT_DELAY_MS = 3000;
const PERMISSION_HREF = '/notifications-permission' as Parameters<typeof router.push>[0];
const SIGNALS_PROMPT_DELAY_MS = 1500;
const SIGNALS_HREF = '/signals-onboarding' as Parameters<typeof router.push>[0];

export function HomeScreen(): React.JSX.Element {
  const { palette, backdropTintFor } = useTheme();
  const ctx = useLifeContext();
  const visual = compose(ctx.pet, ctx);
  const actions = usePetActions();
  const vitality = useVitalityStore((s) => s.vitality);
  const onboardingCompleted = useSettingsStore((s) => s.onboardingCompleted);
  const notificationsAskedAt = useSettingsStore((s) => s.notificationsAskedAt);
  const signalsOnboardingShownAt = useSettingsStore((s) => s.signalsOnboardingShownAt);
  const quests = useQuestStore((s) => s.quests);
  const offerQuest = useQuestStore((s) => s.offer);
  const acceptQuest = useQuestStore((s) => s.accept);
  const declineQuest = useQuestStore((s) => s.decline);
  const activeVaultPetId = useVaultStore((s) => s.vault.activePetId);
  const activeQuest = getActiveQuest(quests);

  // Offer one quest on first mount per session if there isn't a live one.
  useEffect(() => {
    if (activeQuest !== null) return;
    offerQuest({
      petId: activeVaultPetId,
      vitalityCurrent: vitality.current,
      hoursSinceLastQuest: null,
      recentSteps: 2000,
      recentSleepMinutes: 0,
      recentNewPlaces: 0,
    });
    // Run once after onboarding completes — deps deliberately narrow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingCompleted, activeVaultPetId]);
  const [tooltip, setTooltip] = useState<string | null>(null);

  const insufficientTooltip =
    (cost: number): (() => void) =>
    () => {
      setTooltip(`需要 ${cost} 点元气,运动一下 / 睡个好觉就回来了`);
      setTimeout(() => setTooltip(null), 2400);
    };

  const canFeed = vitality.current >= VITALITY_COSTS.feed;
  const canPlay = vitality.current >= VITALITY_COSTS.play;
  const canClean = vitality.current >= VITALITY_COSTS.clean;

  // Trigger the notifications permission modal once, ~3s after the user
  // first reaches Home post-onboarding. Skipped if they've already responded
  // (askedAt set) or onboarding isn't complete.
  useEffect(() => {
    if (!onboardingCompleted || notificationsAskedAt !== null) return;
    const id = setTimeout(() => {
      router.push(PERMISSION_HREF);
    }, PERMISSION_PROMPT_DELAY_MS);
    return () => {
      clearTimeout(id);
    };
  }, [onboardingCompleted, notificationsAskedAt]);

  // After notifications were answered, prompt for real-life signals once.
  useEffect(() => {
    if (!onboardingCompleted) return;
    if (notificationsAskedAt === null) return;
    if (signalsOnboardingShownAt !== null) return;
    const id = setTimeout(() => {
      router.push(SIGNALS_HREF);
    }, SIGNALS_PROMPT_DELAY_MS);
    return () => {
      clearTimeout(id);
    };
  }, [onboardingCompleted, notificationsAskedAt, signalsOnboardingShownAt]);

  const moonPct = Math.round((ctx.solar?.moonIllumination ?? 0) * 100);
  const tint = backdropTintFor(visual.background);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: palette.background }}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[StyleSheet.absoluteFillObject, { backgroundColor: tint }]}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 24 }}>
        <View
          style={{ paddingTop: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'center' }}
        >
          <StageBadge stage={ctx.pet.stage} />
          <View style={{ flex: 1 }} />
          <Text style={{ color: palette.textMuted, fontSize: 12 }}>{visual.mood}</Text>
        </View>

        <VitalityBar current={vitality.current} cap={vitality.cap} testID="vitality-bar" />

        {activeQuest !== null && (
          <View style={{ marginTop: 12 }}>
            <QuestCard
              quest={activeQuest}
              onAccept={() => acceptQuest(activeQuest.id)}
              onDecline={() => declineQuest(activeQuest.id)}
              testID="home-quest-card"
            />
          </View>
        )}

        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }}>
          <PetSprite sprite={visual.sprite} mood={visual.mood} animation={visual.animation} />
          <View style={{ marginTop: 16, minHeight: 40, justifyContent: 'center' }}>
            <Bubble bubbleKey={visual.bubble} seedSalt={Math.floor(ctx.nowMs / 60_000)} />
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingTop: 8,
            paddingBottom: 24,
          }}
        >
          <StatRing label="饱" value={ctx.pet.stats.satiety} />
          <StatRing label="力" value={ctx.pet.stats.energy} />
          <StatRing label="心" value={ctx.pet.stats.happiness} />
          <StatRing label="月" value={moonPct} />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingTop: 12,
            paddingBottom: 16,
          }}
        >
          <ActionButton
            label={t('action.feed', 'zh-CN')}
            accessibilityLabel="Feed pet"
            icon="🍙"
            onPress={actions.feed}
            disabled={!canFeed}
            testID="action-feed"
            {...(!canFeed && { onLongPress: insufficientTooltip(VITALITY_COSTS.feed) })}
          />
          <ActionButton
            label={t('action.play', 'zh-CN')}
            accessibilityLabel="Play with pet"
            icon="🎈"
            onPress={actions.play}
            disabled={!canPlay}
            testID="action-play"
            {...(!canPlay && { onLongPress: insufficientTooltip(VITALITY_COSTS.play) })}
          />
          <ActionButton
            label={t('action.clean', 'zh-CN')}
            accessibilityLabel="Clean pet"
            icon="🛁"
            onPress={actions.clean}
            disabled={!canClean}
            testID="action-clean"
            {...(!canClean && { onLongPress: insufficientTooltip(VITALITY_COSTS.clean) })}
          />
          <ActionButton
            label={t('action.rest', 'zh-CN')}
            accessibilityLabel="Rest pet"
            icon="🌙"
            onPress={actions.rest}
            testID="action-rest"
          />
        </View>
        {tooltip !== null && (
          <Text
            style={{
              color: palette.textMuted,
              fontSize: 12,
              textAlign: 'center',
              marginTop: -8,
              marginBottom: 8,
            }}
            testID="vitality-tooltip"
          >
            {tooltip}
          </Text>
        )}

        <Text style={{ color: palette.textMuted, fontSize: 12, textAlign: 'center', marginTop: 8 }}>
          {visual.background} · {ctx.lunar.chineseLabel}
          {ctx.lunar.solarTerm !== null ? ` · ${ctx.lunar.solarTerm}` : ''}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
