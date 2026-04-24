import { createPet } from './reducer';
import { STAGE_ORDER, STAGE_THRESHOLDS_MS, advanceStage, stageFromAge, stageRank } from './stages';

const H = 60 * 60 * 1000;

describe('stageRank', () => {
  it('returns the index in STAGE_ORDER', () => {
    expect(stageRank('egg')).toBe(0);
    expect(stageRank('baby')).toBe(1);
    expect(stageRank('child')).toBe(2);
    expect(stageRank('teen')).toBe(3);
    expect(stageRank('adult')).toBe(4);
  });
});

describe('stageFromAge', () => {
  it('maps each threshold exactly to its stage', () => {
    expect(stageFromAge(STAGE_THRESHOLDS_MS.egg)).toBe('egg');
    expect(stageFromAge(STAGE_THRESHOLDS_MS.baby)).toBe('baby');
    expect(stageFromAge(STAGE_THRESHOLDS_MS.child)).toBe('child');
    expect(stageFromAge(STAGE_THRESHOLDS_MS.teen)).toBe('teen');
    expect(stageFromAge(STAGE_THRESHOLDS_MS.adult)).toBe('adult');
  });

  it('snaps in-between ages down to the last crossed threshold', () => {
    expect(stageFromAge(0.5 * H)).toBe('egg');
    expect(stageFromAge(2 * H)).toBe('baby');
    expect(stageFromAge(10 * H)).toBe('child');
    expect(stageFromAge(48 * H)).toBe('teen');
    expect(stageFromAge(100 * H)).toBe('adult');
  });

  it('caps at adult for very large ages', () => {
    expect(stageFromAge(Number.MAX_SAFE_INTEGER)).toBe('adult');
  });

  it('treats negative age as egg (defensive)', () => {
    expect(stageFromAge(-1)).toBe('egg');
  });
});

describe('advanceStage', () => {
  it('returns the same reference when stage already matches age', () => {
    const pet = createPet(0);
    expect(advanceStage(pet)).toBe(pet);
  });

  it('advances egg → baby once age reaches 1h', () => {
    const pet = { ...createPet(0), ageMs: 1 * H };
    const next = advanceStage(pet);
    expect(next.stage).toBe('baby');
  });

  it('never regresses: ageMs low but stage already adult stays adult', () => {
    const pet = { ...createPet(0), ageMs: 0, stage: 'adult' as const };
    const next = advanceStage(pet);
    expect(next.stage).toBe('adult');
  });

  it('is idempotent', () => {
    const pet = { ...createPet(0), ageMs: 48 * H };
    const once = advanceStage(pet);
    const twice = advanceStage(once);
    expect(twice).toEqual(once);
  });
});

describe('STAGE_ORDER sanity', () => {
  it('has the five canonical stages', () => {
    expect([...STAGE_ORDER]).toEqual(['egg', 'baby', 'child', 'teen', 'adult']);
  });

  it('thresholds are monotonically non-decreasing in STAGE_ORDER', () => {
    for (let i = 1; i < STAGE_ORDER.length; i++) {
      const prev = STAGE_ORDER[i - 1]!;
      const cur = STAGE_ORDER[i]!;
      expect(STAGE_THRESHOLDS_MS[cur]).toBeGreaterThanOrEqual(STAGE_THRESHOLDS_MS[prev]);
    }
  });
});
