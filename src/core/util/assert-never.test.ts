import { assertNever } from './assert-never';

describe('assertNever', () => {
  it('throws when called (discriminant exhaustion failure)', () => {
    expect(() => assertNever('unreachable' as never)).toThrow(/Unreachable/);
  });
});
