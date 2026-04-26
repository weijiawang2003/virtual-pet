import type { Element, SpeciesArchetype } from './types';

// 12 starter archetypes covering all 8 elements. Numbers tuned for variety
// rather than balance; balancing happens in Phase 27 species expansion.
//
// Naming: short, evocative, no real-world references. Display names give
// both Chinese and English so the i18n table can switch later.
const ARCHETYPES_LIST: readonly SpeciesArchetype[] = Object.freeze([
  Object.freeze({
    id: 'moss',
    displayName: { zhCN: '苔玉', en: 'Moss' },
    element: 'grass' as const,
    baseRarity: 'N' as const,
    personalityBias: Object.freeze(['lazy', 'shy']) as readonly ['lazy', 'shy'],
  }),
  Object.freeze({
    id: 'briar',
    displayName: { zhCN: '荆果', en: 'Briar' },
    element: 'grass' as const,
    baseRarity: 'R' as const,
    decayModifiers: Object.freeze({ happiness: 0.85 }),
    personalityBias: Object.freeze(['curious', 'shy']) as readonly ['curious', 'shy'],
  }),
  Object.freeze({
    id: 'puffin',
    displayName: { zhCN: '波球', en: 'Puffin' },
    element: 'water' as const,
    baseRarity: 'N' as const,
    personalityBias: Object.freeze(['clingy']) as readonly ['clingy'],
  }),
  Object.freeze({
    id: 'dewling',
    displayName: { zhCN: '露语', en: 'Dewling' },
    element: 'water' as const,
    baseRarity: 'R' as const,
    decayModifiers: Object.freeze({ satiety: 0.9 }),
    personalityBias: Object.freeze(['sleepy', 'shy']) as readonly ['sleepy', 'shy'],
  }),
  Object.freeze({
    id: 'flicker',
    displayName: { zhCN: '焰苗', en: 'Flicker' },
    element: 'fire' as const,
    baseRarity: 'R' as const,
    decayModifiers: Object.freeze({ energy: 1.2 }),
    personalityBias: Object.freeze(['energetic']) as readonly ['energetic'],
  }),
  Object.freeze({
    id: 'ember',
    displayName: { zhCN: '炭灰', en: 'Ember' },
    element: 'fire' as const,
    baseRarity: 'N' as const,
    personalityBias: Object.freeze(['gluttonous', 'lazy']) as readonly ['gluttonous', 'lazy'],
  }),
  Object.freeze({
    id: 'crystallight',
    displayName: { zhCN: '晶华', en: 'Crystallight' },
    element: 'crystal' as const,
    baseRarity: 'SR' as const,
    decayModifiers: Object.freeze({ happiness: 0.7 }),
    personalityBias: Object.freeze(['curious', 'lonely']) as readonly ['curious', 'lonely'],
  }),
  Object.freeze({
    id: 'shimmer',
    displayName: { zhCN: '微辉', en: 'Shimmer' },
    element: 'crystal' as const,
    baseRarity: 'R' as const,
    personalityBias: Object.freeze(['shy', 'curious']) as readonly ['shy', 'curious'],
  }),
  Object.freeze({
    id: 'moonlin',
    displayName: { zhCN: '月鳞', en: 'Moonlin' },
    element: 'moon' as const,
    baseRarity: 'SSR' as const,
    decayModifiers: Object.freeze({ energy: 0.6, happiness: 0.85 }),
    personalityBias: Object.freeze(['sleepy', 'lonely']) as readonly ['sleepy', 'lonely'],
  }),
  Object.freeze({
    id: 'inkdrop',
    displayName: { zhCN: '墨珠', en: 'Inkdrop' },
    element: 'shadow' as const,
    baseRarity: 'SR' as const,
    decayModifiers: Object.freeze({ satiety: 1.1 }),
    personalityBias: Object.freeze(['shy', 'lonely']) as readonly ['shy', 'lonely'],
  }),
  Object.freeze({
    id: 'aurelia',
    displayName: { zhCN: '金苗', en: 'Aurelia' },
    element: 'gold' as const,
    baseRarity: 'SSR' as const,
    decayModifiers: Object.freeze({ satiety: 0.7 }),
    personalityBias: Object.freeze(['gluttonous', 'clingy']) as readonly ['gluttonous', 'clingy'],
  }),
  Object.freeze({
    id: 'voidkin',
    displayName: { zhCN: '虚行', en: 'Voidkin' },
    element: 'void' as const,
    baseRarity: 'SSR' as const,
    decayModifiers: Object.freeze({ energy: 0.5, satiety: 0.5 }),
    personalityBias: Object.freeze(['lonely', 'curious']) as readonly ['lonely', 'curious'],
  }),
]);

const ARCHETYPES_BY_ID: Readonly<Record<string, SpeciesArchetype>> = Object.freeze(
  Object.fromEntries(ARCHETYPES_LIST.map((a) => [a.id, a])),
);

const ALL_ELEMENTS: readonly Element[] = Object.freeze([
  'grass',
  'water',
  'fire',
  'crystal',
  'moon',
  'shadow',
  'gold',
  'void',
]);

export const ARCHETYPES = ARCHETYPES_LIST;
export { ALL_ELEMENTS };

export function getArchetype(id: string): SpeciesArchetype | null {
  return ARCHETYPES_BY_ID[id] ?? null;
}

export function archetypesByElement(element: Element): readonly SpeciesArchetype[] {
  return ARCHETYPES_LIST.filter((a) => a.element === element);
}
