import type { StringKey } from './keys';
import { t } from './t';

describe('t', () => {
  let warnSpy: jest.SpyInstance;
  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('returns the zh-CN translation for a known key', () => {
    expect(t('action.feed', 'zh-CN')).toBe('喂食');
  });

  it('returns the en-US translation for a known key', () => {
    expect(t('action.feed', 'en-US')).toBe('Feed');
  });

  it('interpolates {{name}} in a template', () => {
    expect(t('notif.feed.title', 'en-US', { name: 'Pikachu' })).toBe('Pikachu is hungry');
  });

  it('supports numeric variables', () => {
    // No current key uses a number, but interpolation should coerce.
    // Verify via a template-style check on a title with a name slot.
    expect(t('notif.feed.title', 'zh-CN', { name: 42 })).toBe('42 饿啦');
  });

  it('leaves untouched placeholders when a var is missing', () => {
    expect(t('notif.feed.title', 'en-US')).toBe('{{name}} is hungry');
  });

  it('ignores extra vars without throwing', () => {
    expect(t('action.feed', 'en-US', { anything: 'noop' })).toBe('Feed');
  });

  it('returns the key itself for an unknown StringKey and warns', () => {
    const bogus = 'does.not.exist' as StringKey;
    expect(t(bogus, 'en-US')).toBe('does.not.exist');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('missing key'));
  });

  it('interpolation still works in the fallback path', () => {
    const bogus = '{{name}}.missing' as StringKey;
    expect(t(bogus, 'en-US', { name: 'x' })).toBe('x.missing');
  });
});
