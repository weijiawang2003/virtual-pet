import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { getPool } from '../../core/gacha/pools';
import type { GachaResult, Pool } from '../../core/gacha/types';
import { getArchetype } from '../../core/vault/archetypes';
import type { Element, Rarity } from '../../core/vault/types';
import { useHaptics } from '../haptics/use-haptics';
import { useEssenceStore } from '../store/essence-store';
import { useGachaStore } from '../store/gacha-store';
import { useVitalityStore } from '../store/vitality-store';
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
  return rarity === 'N' ? '★' : rarity === 'R' ? '★★' : rarity === 'SR' ? '★★★' : '★★★★';
}

interface PoolCardProps {
  readonly pool: Pool;
  readonly disabled: boolean;
  readonly onPull: () => void;
  readonly pityProgress: string;
}

function PoolCard(props: PoolCardProps): React.JSX.Element {
  const { pool, disabled, onPull, pityProgress } = props;
  const { palette } = useTheme();
  const spec = getPool(pool);
  const title = pool === 'vitality' ? '元气召唤' : '本源召唤';
  const subtitle =
    pool === 'vitality' ? `N 70%·R 25%·SR 5%` : `N 30%·R 35%·SR 25%·SSR 10% · 100 抽保底`;
  const cost = `消耗 ${spec.cost.amount} ${spec.cost.resource === 'vitality' ? '元气' : '本源'}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title} · ${cost}`}
      accessibilityState={{ disabled }}
      onPress={() => {
        if (disabled) return;
        onPull();
      }}
      style={{
        margin: 12,
        padding: 16,
        backgroundColor: palette.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: palette.border,
        opacity: disabled ? 0.5 : 1,
      }}
      testID={`gacha-pool-${pool}`}
    >
      <Text style={{ color: palette.text, fontSize: 18, fontWeight: '700' }}>{title}</Text>
      <Text style={{ color: palette.textMuted, fontSize: 12, marginTop: 6 }}>{subtitle}</Text>
      <Text style={{ color: palette.textMuted, fontSize: 12, marginTop: 4 }}>{cost}</Text>
      {pityProgress.length > 0 && (
        <Text style={{ color: palette.textMuted, fontSize: 11, marginTop: 4 }}>{pityProgress}</Text>
      )}
    </Pressable>
  );
}

interface ResultPanelProps {
  readonly result: GachaResult;
  readonly isNew: boolean;
  readonly onClose: () => void;
}

function ResultPanel(props: ResultPanelProps): React.JSX.Element {
  const { result, isNew, onClose } = props;
  const { palette } = useTheme();
  const archetype = getArchetype(result.archetypeId);
  const name = archetype?.displayName.zhCN ?? result.archetypeId;
  return (
    <View style={{ alignItems: 'center', padding: 32 }} testID="gacha-result">
      <Text style={{ fontSize: 96 }}>{archetype ? ELEMENT_ICON[archetype.element] : '🥚'}</Text>
      <Text style={{ color: palette.text, fontSize: 22, fontWeight: '700', marginTop: 12 }}>
        {name}
      </Text>
      <Text style={{ color: palette.textMuted, fontSize: 14, marginTop: 6 }}>
        {rarityStars(result.rarity)}
      </Text>
      {result.isPityHit && (
        <Text style={{ color: palette.accent, fontSize: 12, marginTop: 4 }}>保底触发!</Text>
      )}
      {isNew && <Text style={{ color: palette.accent, fontSize: 12, marginTop: 4 }}>新伙伴!</Text>}
      <Pressable
        onPress={onClose}
        style={{
          marginTop: 24,
          paddingHorizontal: 24,
          paddingVertical: 12,
          backgroundColor: palette.accent,
          borderRadius: 12,
        }}
        testID="gacha-result-close"
      >
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>好</Text>
      </Pressable>
    </View>
  );
}

interface GachaModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
}

export function GachaModal(props: GachaModalProps): React.JSX.Element {
  const { visible, onClose } = props;
  const { palette } = useTheme();
  const haptics = useHaptics();
  const vitality = useVitalityStore((s) => s.vitality);
  const essence = useEssenceStore((s) => s.current);
  const pity = useGachaStore((s) => s.pity);
  const pull = useGachaStore((s) => s.pull);
  const [result, setResult] = useState<{
    result: GachaResult;
    isNew: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePull = (pool: Pool): void => {
    haptics.trigger('medium');
    setError(null);
    const status = pull(pool);
    if (status.kind === 'insufficient') {
      setError(status.resource === 'vitality' ? '元气不够,休息一下再来' : '本源不够,日常坚持会有');
      return;
    }
    if (status.kind === 'pulled') {
      // isNew detection — skipped here since the Vault auto-acquires regardless;
      // we mark every pull as "new" because the vault layer assigns a fresh id.
      setResult({ result: status.result, isNew: true });
    }
  };

  const closeAll = (): void => {
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            margin: 16,
            backgroundColor: palette.background,
            borderRadius: 16,
            paddingVertical: 16,
          }}
          testID="gacha-modal"
        >
          {result === null ? (
            <View>
              <Text
                style={{
                  color: palette.text,
                  fontSize: 18,
                  fontWeight: '700',
                  textAlign: 'center',
                  marginTop: 8,
                }}
              >
                召唤
              </Text>
              <Text
                style={{
                  color: palette.textMuted,
                  fontSize: 12,
                  textAlign: 'center',
                  marginTop: 4,
                }}
              >
                元气 {Math.round(vitality.current)} · 本源 {essence}
              </Text>
              <PoolCard
                pool="vitality"
                disabled={vitality.current < 20}
                onPull={() => handlePull('vitality')}
                pityProgress=""
              />
              <PoolCard
                pool="essence"
                disabled={essence < 10}
                onPull={() => handlePull('essence')}
                pityProgress={`保底进度 ${pity.essence} / 100`}
              />
              {error !== null && (
                <Text
                  style={{
                    color: palette.textMuted,
                    fontSize: 12,
                    textAlign: 'center',
                    marginTop: 4,
                  }}
                  testID="gacha-error"
                >
                  {error}
                </Text>
              )}
              <Pressable
                onPress={closeAll}
                style={{ paddingVertical: 12, alignItems: 'center', marginTop: 8 }}
                testID="gacha-close"
              >
                <Text style={{ color: palette.textMuted, fontSize: 13 }}>关闭</Text>
              </Pressable>
            </View>
          ) : (
            <ResultPanel result={result.result} isNew={result.isNew} onClose={closeAll} />
          )}
        </View>
      </View>
    </Modal>
  );
}
