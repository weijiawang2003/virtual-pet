import { createFakeClock } from './fake-clock';

describe('createFakeClock', () => {
  it('starts at 0 by default', () => {
    expect(createFakeClock().now()).toBe(0);
  });

  it('starts at the injected initial value', () => {
    expect(createFakeClock(12345).now()).toBe(12345);
  });

  it('advances by the given ms', () => {
    const c = createFakeClock(100);
    c.advance(50);
    expect(c.now()).toBe(150);
    c.advance(0);
    expect(c.now()).toBe(150);
  });

  it('setNow overrides the time', () => {
    const c = createFakeClock(100);
    c.setNow(7);
    expect(c.now()).toBe(7);
  });

  it('rejects negative advance (age must never go backward)', () => {
    const c = createFakeClock();
    expect(() => c.advance(-1)).toThrow(/ms ≥ 0/);
  });

  it('rejects non-finite advance and setNow', () => {
    const c = createFakeClock();
    expect(() => c.advance(Number.POSITIVE_INFINITY)).toThrow(/finite/);
    expect(() => c.setNow(Number.NaN)).toThrow(/finite/);
  });
});
