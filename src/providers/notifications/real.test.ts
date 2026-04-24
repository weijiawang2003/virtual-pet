import { realNotificationProvider } from './real';

describe('realNotificationProvider (stub)', () => {
  it('schedule() rejects with TODO(Phase 8)', async () => {
    await expect(
      realNotificationProvider.schedule({ title: 't', body: 'b', fireAt: 0 }),
    ).rejects.toThrow(/TODO\(Phase 8\)/);
  });

  it('cancel() rejects with TODO', async () => {
    await expect(realNotificationProvider.cancel('x')).rejects.toThrow(/TODO/);
  });

  it('cancelAll() rejects with TODO', async () => {
    await expect(realNotificationProvider.cancelAll()).rejects.toThrow(/TODO/);
  });

  it('listAll() rejects with TODO', async () => {
    await expect(realNotificationProvider.listAll()).rejects.toThrow(/TODO/);
  });
});
