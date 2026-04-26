import { ALL_ELEMENTS, ARCHETYPES, archetypesByElement, getArchetype } from './archetypes';
import type { Rarity } from './types';

describe('ARCHETYPES data integrity', () => {
  it('contains exactly 12 entries (Phase 24 starter set)', () => {
    expect(ARCHETYPES).toHaveLength(12);
  });

  it('every archetype has a unique id', () => {
    const ids = ARCHETYPES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every archetype is frozen (no mutation possible)', () => {
    for (const a of ARCHETYPES) {
      expect(Object.isFrozen(a)).toBe(true);
    }
  });

  it('every archetype has a recognized element', () => {
    for (const a of ARCHETYPES) {
      expect(ALL_ELEMENTS).toContain(a.element);
    }
  });

  it('covers all 8 elements', () => {
    const used = new Set(ARCHETYPES.map((a) => a.element));
    for (const e of ALL_ELEMENTS) {
      expect(used.has(e)).toBe(true);
    }
  });

  it('every archetype has a valid rarity', () => {
    const valid: readonly Rarity[] = ['N', 'R', 'SR', 'SSR'];
    for (const a of ARCHETYPES) {
      expect(valid).toContain(a.baseRarity);
    }
  });

  it('every archetype has at least 1 personality bias tag', () => {
    for (const a of ARCHETYPES) {
      expect(a.personalityBias.length).toBeGreaterThanOrEqual(1);
      expect(a.personalityBias.length).toBeLessThanOrEqual(3);
    }
  });

  it('every archetype has a non-empty bilingual display name', () => {
    for (const a of ARCHETYPES) {
      expect(a.displayName.zhCN.length).toBeGreaterThan(0);
      expect(a.displayName.en.length).toBeGreaterThan(0);
    }
  });
});

describe('getArchetype', () => {
  it('returns the archetype for a known id', () => {
    expect(getArchetype('moss')?.element).toBe('grass');
    expect(getArchetype('moonlin')?.baseRarity).toBe('SSR');
  });

  it('returns null for an unknown id', () => {
    expect(getArchetype('chocobo')).toBeNull();
  });
});

describe('archetypesByElement', () => {
  it('grass archetypes (moss + briar)', () => {
    const grass = archetypesByElement('grass');
    expect(grass.map((a) => a.id).sort()).toEqual(['briar', 'moss']);
  });

  it('moon has at least one (moonlin SSR)', () => {
    const moon = archetypesByElement('moon');
    expect(moon.some((a) => a.id === 'moonlin')).toBe(true);
  });

  it('returns empty array for an element with no archetypes (none today)', () => {
    // All 8 elements are populated; test the edge by passing an unknown
    // string cast — the function should still return [].
    const unknown = archetypesByElement('phantom' as unknown as 'grass');
    expect(unknown).toEqual([]);
  });
});
