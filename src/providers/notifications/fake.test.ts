import { createFakeNotificationProvider } from './fake';

const req = (title: string, fireAt: number) => ({ title, body: `body of ${title}`, fireAt });

describe('createFakeNotificationProvider', () => {
  it('starts empty', async () => {
    const p = createFakeNotificationProvider();
    expect(await p.listAll()).toEqual([]);
  });

  it('schedule returns a unique id per call', async () => {
    const p = createFakeNotificationProvider();
    const a = await p.schedule(req('a', 1000));
    const b = await p.schedule(req('b', 2000));
    expect(a).not.toBe(b);
    expect(a).toMatch(/^fake-notif-/);
  });

  it('id prefix is configurable', async () => {
    const p = createFakeNotificationProvider('test');
    const id = await p.schedule(req('x', 1000));
    expect(id).toMatch(/^test-\d+$/);
  });

  it('listAll is sorted by fireAt ascending', async () => {
    const p = createFakeNotificationProvider();
    await p.schedule(req('c', 3000));
    await p.schedule(req('a', 1000));
    await p.schedule(req('b', 2000));
    const all = await p.listAll();
    expect(all.map((n) => n.title)).toEqual(['a', 'b', 'c']);
  });

  it('cancel removes matching id', async () => {
    const p = createFakeNotificationProvider();
    const id = await p.schedule(req('a', 1000));
    await p.schedule(req('b', 2000));
    await p.cancel(id);
    const all = await p.listAll();
    expect(all.map((n) => n.title)).toEqual(['b']);
  });

  it('cancel on unknown id is a no-op', async () => {
    const p = createFakeNotificationProvider();
    await p.schedule(req('a', 1000));
    await p.cancel('does-not-exist');
    expect(await p.listAll()).toHaveLength(1);
  });

  it('cancelAll empties the queue', async () => {
    const p = createFakeNotificationProvider();
    await p.schedule(req('a', 1000));
    await p.schedule(req('b', 2000));
    await p.cancelAll();
    expect(await p.listAll()).toEqual([]);
  });

  it('listAll returns a frozen array', async () => {
    const p = createFakeNotificationProvider();
    await p.schedule(req('a', 1000));
    const all = await p.listAll();
    expect(Object.isFrozen(all)).toBe(true);
  });

  it('fireDue returns entries with fireAt <= now and removes them', () => {
    const p = createFakeNotificationProvider();
    // Use scheduled helpers directly (sync path ok — fake resolves immediately).
    void p.schedule(req('past', 500));
    void p.schedule(req('now', 1000));
    void p.schedule(req('future', 2000));
    const fired = p.fireDue(1000);
    expect(fired.map((n) => n.title).sort()).toEqual(['now', 'past']);
  });

  it('fireDue is idempotent when called again with same now', async () => {
    const p = createFakeNotificationProvider();
    await p.schedule(req('a', 100));
    expect(p.fireDue(200).map((n) => n.title)).toEqual(['a']);
    expect(p.fireDue(200)).toEqual([]);
  });

  it('reset clears queue and id counter', async () => {
    const p = createFakeNotificationProvider();
    await p.schedule(req('a', 1000));
    p.reset();
    expect(await p.listAll()).toEqual([]);
    const id = await p.schedule(req('b', 500));
    expect(id).toMatch(/-1$/); // counter reset to 1
  });

  it('data field is preserved through schedule/listAll', async () => {
    const p = createFakeNotificationProvider();
    await p.schedule({ ...req('a', 1000), data: { petId: 'pikachu', kind: 'hungry' } });
    const all = await p.listAll();
    expect(all[0]!.data).toEqual({ petId: 'pikachu', kind: 'hungry' });
  });
});
