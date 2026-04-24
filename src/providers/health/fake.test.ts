import { createFakeHealthKitProvider } from './fake';
import type { HRVSample, SleepSample, StepsSample } from './types';

const step = (startAt: number, endAt: number, value: number): StepsSample => ({
  startAt,
  endAt,
  value,
});

const sleep = (startAt: number, endAt: number, stage: SleepSample['stage']): SleepSample => ({
  startAt,
  endAt,
  stage,
});

const hrv = (startAt: number, endAt: number, sdnnMs: number): HRVSample => ({
  startAt,
  endAt,
  sdnnMs,
});

describe('createFakeHealthKitProvider — windowed queries', () => {
  it('returns only steps within the window', async () => {
    const p = createFakeHealthKitProvider({
      steps: [step(0, 100, 5), step(200, 300, 7), step(500, 600, 9)],
    });
    const out = await p.getSteps(150, 400);
    expect(out.map((s) => s.value)).toEqual([7]);
  });

  it('filters samples whose endAt exceeds the window', async () => {
    const p = createFakeHealthKitProvider({ steps: [step(0, 500, 10)] });
    expect(await p.getSteps(0, 400)).toEqual([]);
  });

  it('sorts query results ascending by startAt', async () => {
    const p = createFakeHealthKitProvider({
      steps: [step(300, 400, 3), step(100, 200, 1), step(500, 600, 5)],
    });
    const out = await p.getSteps(0, 1000);
    expect(out.map((s) => s.startAt)).toEqual([100, 300, 500]);
  });

  it('sleep + hrv queries behave the same way', async () => {
    const p = createFakeHealthKitProvider({
      sleep: [sleep(0, 100, 'deep'), sleep(200, 300, 'rem')],
      hrv: [hrv(0, 60, 45), hrv(70, 130, 55)],
    });
    expect((await p.getSleep(150, 400)).map((s) => s.stage)).toEqual(['rem']);
    expect((await p.getHRV(0, 200)).map((h) => h.sdnnMs)).toEqual([45, 55]);
  });

  it('returns frozen arrays', async () => {
    const p = createFakeHealthKitProvider({ steps: [step(0, 100, 5)] });
    const out = await p.getSteps(0, 200);
    expect(Object.isFrozen(out)).toBe(true);
  });
});

describe('createFakeHealthKitProvider — subscribe/emit', () => {
  it('delivers emitted steps to every subscriber', () => {
    const p = createFakeHealthKitProvider();
    const got: number[] = [];
    p.subscribe('steps', (s) => got.push(s.value));
    p.subscribe('steps', (s) => got.push(s.value * 10));
    p.emit('steps', step(0, 100, 7));
    expect(got).toEqual([7, 70]);
  });

  it('disposer prevents further delivery', () => {
    const p = createFakeHealthKitProvider();
    const got: number[] = [];
    const dispose = p.subscribe('steps', (s) => got.push(s.value));
    p.emit('steps', step(0, 100, 1));
    dispose();
    p.emit('steps', step(100, 200, 2));
    expect(got).toEqual([1]);
  });

  it('metric channels are independent (sleep sub does not receive steps)', () => {
    const p = createFakeHealthKitProvider();
    const gotSleep: unknown[] = [];
    p.subscribe('sleep', (s) => gotSleep.push(s));
    p.emit('steps', step(0, 100, 1));
    expect(gotSleep).toEqual([]);
  });

  it('hrv channel delivers hrv samples', () => {
    const p = createFakeHealthKitProvider();
    const got: number[] = [];
    p.subscribe('hrv', (s) => got.push(s.sdnnMs));
    p.emit('hrv', hrv(0, 60, 50));
    expect(got).toEqual([50]);
  });

  it('emitted samples appear in subsequent queries', async () => {
    const p = createFakeHealthKitProvider();
    p.emit('steps', step(0, 100, 3));
    expect(await p.getSteps(0, 200)).toHaveLength(1);
  });
});

describe('createFakeHealthKitProvider — inject / reset', () => {
  it('inject adds samples without dropping existing ones', async () => {
    const p = createFakeHealthKitProvider({ steps: [step(0, 100, 1)] });
    p.inject({ steps: [step(200, 300, 2)] });
    expect((await p.getSteps(0, 400)).map((s) => s.value)).toEqual([1, 2]);
  });

  it('inject with undefined metric leaves that metric alone', async () => {
    const p = createFakeHealthKitProvider({ steps: [step(0, 100, 1)] });
    p.inject({ sleep: [sleep(0, 100, 'awake')] });
    expect(await p.getSteps(0, 200)).toHaveLength(1);
    expect(await p.getSleep(0, 200)).toHaveLength(1);
  });

  it('reset clears samples and subscribers', async () => {
    const p = createFakeHealthKitProvider({ steps: [step(0, 100, 1)] });
    const got: number[] = [];
    p.subscribe('steps', (s) => got.push(s.value));
    p.reset();
    p.emit('steps', step(100, 200, 2));
    expect(await p.getSteps(0, 500)).toHaveLength(1); // emitted post-reset is present
    expect(got).toEqual([]); // subscriber was cleared
  });
});
