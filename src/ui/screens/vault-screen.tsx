import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getArchetype } from '../../core/vault/archetypes';
import type { Element, Rarity, VaultedPet } from '../../core/vault/types';
import { useHaptics } from '../haptics/use-haptics';
import { useVaultStore } from '../store/vault-store';
import { useTheme } from '../theme/use-theme';

const ELEMENT_ICON: Readonly<Record<Element, string>> = Object.freeze({
  grass: '🌱',
  water: '💧',
  fire: '🔥',
  crystal: '💎',
  moon: '🌙',
  shadow: '🌑',
  gold: '✨',
  void: '🕳',
});

function rarityStars(rarity: Rarity): string {
  switch (rarity) {
    case 'N':
      return '★';
    case 'R':
      return '★★';
    case 'SR':
      return '★★★';
    case 'SSR':
      return '★★★★';
  }
}

interface VaultCardProps {
  readonly pet: VaultedPet;
  readonly isActive: boolean;
  readonly onPress: () => void;
  readonly onLongPress: () => void;
}

function VaultCard(props: VaultCardProps): React.JSX.Element {
  const { pet, isActive, onPress, onLongPress } = props;
  const { palette } = useTheme();
  const archetype = getArchetype(pet.archetypeId);
  const name = archetype?.displayName.zhCN ?? pet.archetypeId;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name} · ${pet.element} · ${pet.rarity}${isActive ? ' · active' : ''}`}
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={{
        flex: 1,
        margin: 8,
        padding: 16,
        backgroundColor: palette.surface,
        borderRadius: 14,
        borderWidth: isActive ? 2 : 1,
        borderColor: isActive ? palette.accent : palette.border,
        alignItems: 'center',
      }}
      testID={`vault-card-${pet.id}`}
    >
      <Text style={{ fontSize: 36 }}>{ELEMENT_ICON[pet.element]}</Text>
      <Text style={{ color: palette.text, fontSize: 15, fontWeight: '600', marginTop: 8 }}>
        {name}
      </Text>
      <Text style={{ color: palette.textMuted, fontSize: 11, marginTop: 4 }}>
        {rarityStars(pet.rarity)}
      </Text>
      {isActive && <Text style={{ color: palette.accent, fontSize: 10, marginTop: 4 }}>当前</Text>}
    </Pressable>
  );
}

export function VaultScreen(): React.JSX.Element {
  const { palette } = useTheme();
  const haptics = useHaptics();
  const vault = useVaultStore((s) => s.vault);
  const setActivePet = useVaultStore((s) => s.setActivePet);

  const pets: readonly VaultedPet[] = vault.order
    .map((id) => vault.entries[id])
    .filter((p): p is VaultedPet => p !== undefined);

  const promptSwitch = (pet: VaultedPet): void => {
    if (pet.id === vault.activePetId) return;
    haptics.trigger('selection');
    const archetype = getArchetype(pet.archetypeId);
    const name = archetype?.displayName.zhCN ?? pet.archetypeId;
    Alert.alert('切换为活跃宠物?', `${name} 会陪你过这段时间,现在的小伙伴会去宠物馆休息。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '切换',
        style: 'default',
        onPress: () => {
          haptics.trigger('medium');
          setActivePet(pet.id);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ color: palette.text, fontSize: 22, fontWeight: '700' }}>宠物馆</Text>
        <Text style={{ color: palette.textMuted, fontSize: 13, marginTop: 4 }}>
          {pets.length === 0 ? '还没有其他小伙伴呢' : `已收集 ${pets.length} 只`}
        </Text>
      </View>
      {pets.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}
          testID="vault-empty"
        >
          <Text style={{ fontSize: 48 }}>🐣</Text>
          <Text
            style={{
              color: palette.textMuted,
              fontSize: 13,
              marginTop: 12,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            还没有其他小伙伴呢,{'\n'}试试抽卡看看。
          </Text>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(p) => p.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <VaultCard
              pet={item}
              isActive={item.id === vault.activePetId}
              onPress={() => haptics.trigger('selection')}
              onLongPress={() => promptSwitch(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
