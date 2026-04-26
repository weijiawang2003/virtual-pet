import fc from 'fast-check';

import { essenceFromBondCrossing, essenceFromStepsMilestone, essenceFromStreak } from './rules';

describe('essenceFromBondCrossing', () => {
  it('+20 when crossing 100 from below', () => {
    expect(essenceFromBondCrossing(99, 100)).toBe(20);
    expect(essenceFromBondCrossing(50, 120)).toBe(20);
  });

  it('0 when both ends are already ≥ 100', () => {
    expect(essenceFromBondCrossing(100, 100)).toBe(0);
    expect(essenceFromBondCrossing(150, 200)).toBe(0);
  });

  it('0 when both ends are below 100', () => {
    expect(essenceFromBondCrossing(0, 99)).toBe(0);
    expect(essenceFromBondCrossing(50, 80)).toBe(0);
  });

  it('0 when bond decreases (no cross)', () => {
    expect(essenceFromBondCrossing(120, 80)).toBe(0);
  });
});

describe('essenceFromStepsMilestone', () => {
  it('+10 for each 100km bucket crossed', () => {
    expect(essenceFromStepsMilestone(0, 100)).toBe(10);
    expect(essenceFromStepsMilestone(99, 100)).toBe(10);
    expect(essenceFromStepsMilestone(0, 250)).toBe(20); // 100, 200
    expect(essenceFromStepsMilestone(150, 350)).toBe(20); // 200, 300
  });

  it('0 when no new milestone is crossed', () => {
    expect(essenceFromStepsMilestone(50, 99)).toBe(0);
    expect(essenceFromStepsMilestone(120, 199)).toBe(0);
  });

  it('0 when total decreases (defensive)', () => {
    expect(essenceFromStepsMilestone(120, 80)).toBe(0);
  });
});

describe('essenceFromStreak', () => {
  it('+5 on multiples of 7', () => {
    expect(essenceFromStreak(7)).toBe(5);
    expect(essenceFromStreak(14)).toBe(5);
    expect(essenceFromStreak(21)).toBe(5);
  });

  it('0 on non-multiples', () => {
    expect(essenceFromStreak(6)).toBe(0);
    expect(essenceFromStreak(8)).toBe(0);
    expect(essenceFromStreak(13)).toBe(0);
  });

  it('0 on zero', () => {
    expect(essenceFromStreak(0)).toBe(0);
  });
});

describe('essence rules — fast-check invariants', () => {
  it('milestone gain is non-negative and a multiple of 10', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1_000_000, noNaN: true }),
        fc.float({ min: 0, max: 1_000_000, noNaN: true }),
        (a, b) => {
          const v = essenceFromStepsMilestone(a, b);
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v % 10).toBe(0);
        },
      ),
    );
  });

  it('bond crossing gain is either 0 or 20', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 200 }),
        fc.integer({ min: 0, max: 200 }),
        (prev, curr) => {
          const v = essenceFromBondCrossing(prev, curr);
          expect([0, 20]).toContain(v);
        },
      ),
    );
  });
});
