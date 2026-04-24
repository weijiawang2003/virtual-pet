import { realHealthKitProvider } from './real';

describe('realHealthKitProvider (stub)', () => {
  it('getSteps rejects with TODO(Phase 10)', async () => {
    await expect(realHealthKitProvider.getSteps(0, 1)).rejects.toThrow(/TODO\(Phase 10\)/);
  });

  it('getSleep rejects with TODO', async () => {
    await expect(realHealthKitProvider.getSleep(0, 1)).rejects.toThrow(/TODO/);
  });

  it('getHRV rejects with TODO', async () => {
    await expect(realHealthKitProvider.getHRV(0, 1)).rejects.toThrow(/TODO/);
  });

  it('subscribe throws synchronously with TODO', () => {
    expect(() => realHealthKitProvider.subscribe('steps', () => {})).toThrow(/TODO/);
  });
});
