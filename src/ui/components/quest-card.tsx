import { Pressable, Text, View } from 'react-native';

import type { Quest, QuestType } from '../../core/quest/types';
import { useTheme } from '../theme/use-theme';

const QUEST_LABEL: Readonly<Record<QuestType, string>> = Object.freeze({
  walk: '陪我走',
  sleep: '今晚睡好',
  idle: '把手机放一会',
  visit_new_place: '去个新地方',
  play_with_pet: '陪我玩',
  feed_special: '给我做个好的',
});

const QUEST_UNIT: Readonly<Record<QuestType, string>> = Object.freeze({
  walk: '步',
  sleep: '分钟',
  idle: '分钟',
  visit_new_place: '次',
  play_with_pet: '次',
  feed_special: '次',
});

interface QuestCardProps {
  readonly quest: Quest;
  readonly onAccept: () => void;
  readonly onDecline: () => void;
  readonly testID?: string;
}

export function QuestCard(props: QuestCardProps): React.JSX.Element {
  const { quest, onAccept, onDecline, testID } = props;
  const { palette } = useTheme();
  const pct = Math.min(1, quest.threshold > 0 ? quest.progress / quest.threshold : 0);
  const label = QUEST_LABEL[quest.type];
  const unit = QUEST_UNIT[quest.type];

  return (
    <View
      style={{
        backgroundColor: palette.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: palette.border,
        padding: 14,
        marginBottom: 12,
      }}
      testID={testID}
    >
      <Text style={{ color: palette.text, fontSize: 15, fontWeight: '600' }}>
        {label} {quest.threshold} {unit}
      </Text>
      <Text style={{ color: palette.textMuted, fontSize: 11, marginTop: 4 }}>
        奖励 · 本源 +{quest.rewardEssence} · 牵绊 +{quest.rewardBond}
      </Text>
      {(quest.state === 'accepted' || quest.state === 'in_progress') && (
        <View style={{ marginTop: 10 }}>
          <View
            style={{
              height: 4,
              backgroundColor: palette.surfaceMuted,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${Math.round(pct * 100)}%`,
                backgroundColor: palette.accent,
              }}
            />
          </View>
          <Text style={{ color: palette.textMuted, fontSize: 11, marginTop: 4 }}>
            {Math.round(quest.progress)} / {quest.threshold}
          </Text>
        </View>
      )}
      {quest.state === 'offered' && (
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Accept quest"
            onPress={onAccept}
            style={{
              flex: 1,
              paddingVertical: 10,
              backgroundColor: palette.accent,
              borderRadius: 10,
              alignItems: 'center',
              marginRight: 6,
            }}
            testID="quest-accept"
          >
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>接受</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Decline quest"
            onPress={onDecline}
            style={{
              flex: 1,
              paddingVertical: 10,
              backgroundColor: palette.surfaceMuted,
              borderRadius: 10,
              alignItems: 'center',
              marginLeft: 6,
            }}
            testID="quest-decline"
          >
            <Text style={{ color: palette.textMuted, fontSize: 13 }}>不了</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
