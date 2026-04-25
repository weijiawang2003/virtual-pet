import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '../../core/i18n/t';
import { compose } from '../../core/visual/compose';
import { ActionButton } from '../components/action-button';
import { Bubble } from '../components/bubble';
import { PetPlaceholder } from '../components/pet-placeholder';
import { StageBadge } from '../components/stage-badge';
import { StatRing } from '../components/stat-ring';
import { useLifeContext } from '../hooks/use-life-context';
import { usePetActions } from '../hooks/use-pet-actions';
import { useTheme } from '../theme/use-theme';

export function HomeScreen(): React.JSX.Element {
  const { palette, backdropTintFor } = useTheme();
  const ctx = useLifeContext();
  const visual = compose(ctx.pet, ctx);
  const actions = usePetActions();

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

        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }}>
          <PetPlaceholder />
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
            testID="action-feed"
          />
          <ActionButton
            label={t('action.play', 'zh-CN')}
            accessibilityLabel="Play with pet"
            icon="🎈"
            onPress={actions.play}
            testID="action-play"
          />
          <ActionButton
            label={t('action.clean', 'zh-CN')}
            accessibilityLabel="Clean pet"
            icon="🛁"
            onPress={actions.clean}
            testID="action-clean"
          />
          <ActionButton
            label={t('action.rest', 'zh-CN')}
            accessibilityLabel="Rest pet"
            icon="🌙"
            onPress={actions.rest}
            testID="action-rest"
          />
        </View>

        <Text style={{ color: palette.textMuted, fontSize: 12, textAlign: 'center', marginTop: 8 }}>
          {visual.background} · {ctx.lunar.chineseLabel}
          {ctx.lunar.solarTerm !== null ? ` · ${ctx.lunar.solarTerm}` : ''}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
