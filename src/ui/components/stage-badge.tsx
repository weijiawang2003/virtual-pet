import { Text, View } from 'react-native';

import type { LifeStage } from '../../core/pet/types';
import { t } from '../../core/i18n/t';
import type { Locale } from '../../core/i18n/types';
import type { StringKey } from '../../core/i18n/keys';
import { useTheme } from '../theme/use-theme';

interface StageBadgeProps {
  readonly stage: LifeStage;
  readonly locale?: Locale;
}

const STAGE_KEY: Record<LifeStage, StringKey> = {
  egg: 'stage.egg',
  baby: 'stage.baby',
  child: 'stage.child',
  teen: 'stage.teen',
  adult: 'stage.adult',
};

export function StageBadge({ stage, locale = 'zh-CN' }: StageBadgeProps): React.JSX.Element {
  const { palette } = useTheme();
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Stage: ${stage}`}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: palette.surfaceMuted,
        borderRadius: 999,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ color: palette.text, fontSize: 13, fontWeight: '600' }}>
        {t(STAGE_KEY[stage], locale)}
      </Text>
    </View>
  );
}
