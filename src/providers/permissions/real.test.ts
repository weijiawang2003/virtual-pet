import { realPermissionProvider } from './real';
import { PERMISSION_KINDS } from './types';

describe('realPermissionProvider (stub)', () => {
  it('get() rejects with not-implemented for every kind', async () => {
    for (const k of PERMISSION_KINDS) {
      await expect(realPermissionProvider.get(k)).rejects.toThrow(/not wired/);
    }
  });

  it('request() rejects with not-implemented for every kind', async () => {
    for (const k of PERMISSION_KINDS) {
      await expect(realPermissionProvider.request(k)).rejects.toThrow(/not wired/);
    }
  });

  it('snapshot() rejects with not-implemented', async () => {
    await expect(realPermissionProvider.snapshot()).rejects.toThrow(/not wired/);
  });
});
