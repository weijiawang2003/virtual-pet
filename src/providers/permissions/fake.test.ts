import { createFakePermissionProvider, listPermissionKinds } from './fake';
import { PERMISSION_KINDS, PERMISSION_STATUSES } from './types';

describe('createFakePermissionProvider — defaults', () => {
  it('starts every kind in notDetermined', async () => {
    const p = createFakePermissionProvider();
    const snap = await p.snapshot();
    for (const k of PERMISSION_KINDS) {
      expect(snap[k]).toBe('notDetermined');
    }
  });

  it('snapshot has exactly the five expected keys', async () => {
    const p = createFakePermissionProvider();
    const snap = await p.snapshot();
    expect(Object.keys(snap).sort()).toEqual([...PERMISSION_KINDS].sort());
  });

  it('respects the seed', async () => {
    const p = createFakePermissionProvider({ location: 'granted', health: 'denied' });
    expect(await p.get('location')).toBe('granted');
    expect(await p.get('health')).toBe('denied');
    expect(await p.get('notifications')).toBe('notDetermined');
  });
});

describe('4 × 5 status/kind matrix', () => {
  for (const kind of PERMISSION_KINDS) {
    for (const status of PERMISSION_STATUSES) {
      it(`get('${kind}') returns '${status}' after set`, async () => {
        const p = createFakePermissionProvider();
        p.set(kind, status);
        expect(await p.get(kind)).toBe(status);
      });

      it(`snapshot reflects set('${kind}', '${status}')`, async () => {
        const p = createFakePermissionProvider();
        p.set(kind, status);
        const snap = await p.snapshot();
        expect(snap[kind]).toBe(status);
      });

      it(`request('${kind}') echoes '${status}' (no UX magic in fake)`, async () => {
        const p = createFakePermissionProvider();
        p.set(kind, status);
        expect(await p.request(kind)).toBe(status);
      });
    }
  }
});

describe('bulk helpers', () => {
  it('grantAll sets every kind to granted', async () => {
    const p = createFakePermissionProvider();
    p.grantAll();
    const snap = await p.snapshot();
    for (const k of PERMISSION_KINDS) {
      expect(snap[k]).toBe('granted');
    }
  });

  it('denyAll sets every kind to denied', async () => {
    const p = createFakePermissionProvider();
    p.denyAll();
    const snap = await p.snapshot();
    for (const k of PERMISSION_KINDS) {
      expect(snap[k]).toBe('denied');
    }
  });

  it('reset returns to notDetermined for all', async () => {
    const p = createFakePermissionProvider({ location: 'granted' });
    p.grantAll();
    p.reset();
    const snap = await p.snapshot();
    for (const k of PERMISSION_KINDS) {
      expect(snap[k]).toBe('notDetermined');
    }
  });
});

describe('invariants', () => {
  it('set then get returns the same value for every kind/status pair', async () => {
    const p = createFakePermissionProvider();
    for (const k of PERMISSION_KINDS) {
      for (const s of PERMISSION_STATUSES) {
        p.set(k, s);
        expect(await p.get(k)).toBe(s);
      }
    }
  });

  it('request is idempotent for granted/denied', async () => {
    const p = createFakePermissionProvider();
    p.set('location', 'granted');
    const a = await p.request('location');
    const b = await p.request('location');
    expect(a).toBe(b);
    expect(a).toBe('granted');

    p.set('health', 'denied');
    expect(await p.request('health')).toBe(await p.request('health'));
  });

  it('snapshot is frozen (no accidental mutation)', async () => {
    const p = createFakePermissionProvider();
    const snap = await p.snapshot();
    expect(Object.isFrozen(snap)).toBe(true);
  });

  it('listPermissionKinds returns the canonical five', () => {
    expect([...listPermissionKinds()].sort()).toEqual([
      'calendar',
      'health',
      'location',
      'media',
      'notifications',
    ]);
  });
});
