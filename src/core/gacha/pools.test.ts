import { ALL_POOLS, getPool } from './pools';

describe('pools', () => {
  it('vitality pool: 70/25/5/0, no pity, costs 20 vitality', () => {
    const p = getPool('vitality');
    expect(p.weights).toEqual({ N: 70, R: 25, SR: 5, SSR: 0 });
    expect(p.pityThreshold).toBeNull();
    expect(p.cost).toEqual({ resource: 'vitality', amount: 20 });
  });

  it('essence pool: 30/35/25/10, pity 100, costs 10 essence', () => {
    const p = getPool('essence');
    expect(p.weights).toEqual({ N: 30, R: 35, SR: 25, SSR: 10 });
    expect(p.pityThreshold).toBe(100);
    expect(p.cost).toEqual({ resource: 'essence', amount: 10 });
  });

  it('all pool weights sum to 100', () => {
    for (const name of ALL_POOLS) {
      const p = getPool(name);
      const sum = p.weights.N + p.weights.R + p.weights.SR + p.weights.SSR;
      expect(sum).toBe(100);
    }
  });

  it('pool spec is frozen', () => {
    expect(Object.isFrozen(getPool('vitality'))).toBe(true);
    expect(Object.isFrozen(getPool('essence').weights)).toBe(true);
  });

  it('ALL_POOLS lists both names', () => {
    expect([...ALL_POOLS].sort()).toEqual(['essence', 'vitality']);
  });
});
