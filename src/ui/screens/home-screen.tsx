import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '../../core/i18n/t';
import { ActionButton } from '../components/action-button';
import { PetPlaceholder } from '../components/pet-placeholder';
import { StageBadge } from '../components/stage-badge';
import { StatRingPlaceholder } from '../components/stat-ring-placeholder';
import { useTheme } from '../theme/use-theme';

export function HomeScreen(): React.JSX.Element {
  const { palette } = useTheme();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: palette.background }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 24 }}>
        <View style={{ paddingTop: 12, paddingBottom: 8 }}>
          <StageBadge stage="egg" />
        </View>

        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }}>
          <PetPlaceholder />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingTop: 8,
            paddingBottom: 24,
          }}
        >
          <StatRingPlaceholder label="饱" value={70} />
          <StatRingPlaceholder label="力" value={70} />
          <StatRingPlaceholder label="心" value={70} />
          <StatRingPlaceholder label="月" value={50} />
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
            testID="action-feed"
          />
          <ActionButton
            label={t('action.play', 'zh-CN')}
            accessibilityLabel="Play with pet"
            icon="🎈"
            testID="action-play"
          />
          <ActionButton
            label={t('action.clean', 'zh-CN')}
            accessibilityLabel="Clean pet"
            icon="🛁"
            testID="action-clean"
          />
          <ActionButton
            label={t('action.rest', 'zh-CN')}
            accessibilityLabel="Rest pet"
            icon="🌙"
            testID="action-rest"
          />
        </View>

        <Text style={{ color: palette.textMuted, fontSize: 12, textAlign: 'center', marginTop: 8 }}>
          Phase 14: UI foundation. Real artwork & wiring land in later phases.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
