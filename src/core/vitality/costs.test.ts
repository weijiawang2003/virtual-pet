import { VITALITY_COSTS } from './costs';

describe('VITALITY_COSTS', () => {
  it('is frozen so consumers cannot mutate', () => {
    expect(Object.isFrozen(VITALITY_COSTS)).toBe(true);
  });

  it('has the documented per-action values', () => {
    expect(VITALITY_COSTS.feed).toBe(10);
    expect(VITALITY_COSTS.play).toBe(15);
    expect(VITALITY_COSTS.clean).toBe(5);
    expect(VITALITY_COSTS.rest).toBe(0);
    expect(VITALITY_COSTS.gacha_normal).toBe(20);
    expect(VITALITY_COSTS.gacha_premium).toBe(30);
  });

  it('all costs are non-negative integers', () => {
    for (const value of Object.values(VITALITY_COSTS)) {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
    }
  });
});
