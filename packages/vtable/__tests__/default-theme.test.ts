import internalThemes, * as themes from '../src/themes';
import { theme as registerTheme, clearAll } from '../src/register';

describe('setDefaultTheme', () => {
  const original = themes.DEFAULT;

  afterEach(() => {
    clearAll();
    themes.setDefaultTheme(original);
  });

  test('keeps the public export, internal fallback and name lookup in sync', () => {
    const registry = themes.get();
    themes.setDefaultTheme(original.extends({ bodyStyle: { color: '#123456' } }));

    expect(internalThemes.DEFAULT).toBe(themes.DEFAULT);
    expect(registry.DEFAULT).toBe(themes.DEFAULT);
    expect(themes.of('default')).toBe(themes.DEFAULT);
    expect(themes.DEFAULT.bodyStyle.color).toBe('#123456');
    expect(themes.DEFAULT.extends({ headerStyle: { color: '#654321' } }).bodyStyle.color).toBe('#123456');
  });

  test('replaces styles without reusing previously resolved caches or accumulating overrides', () => {
    themes.setDefaultTheme(original.extends({ bodyStyle: { color: '#123456' } }));
    const previous = themes.DEFAULT;
    const extended = previous.extends({ headerStyle: { color: '#654321' } });
    expect(previous.bodyStyle.color).toBe('#123456');

    themes.setDefaultTheme(original.extends({ headerStyle: { color: '#abcdef' } }));

    expect(themes.DEFAULT).not.toBe(previous);
    expect(themes.DEFAULT.bodyStyle.color).toBe(original.bodyStyle.color);
    expect(themes.DEFAULT.headerStyle.color).toBe('#abcdef');
    expect(previous.bodyStyle.color).toBe('#123456');
    expect(extended.bodyStyle.color).toBe('#123456');
  });

  test('preserves inherited values and callback styles when installing a TableTheme', () => {
    const bgColor = () => '#abcdef';
    const parent = original.extends({ bodyStyle: { color: '#123456', bgColor } });
    const child = parent.extends({ headerStyle: { color: '#654321' } });
    themes.setDefaultTheme(child);

    expect(themes.DEFAULT).not.toBe(child);
    expect(themes.DEFAULT.bodyStyle.color).toBe('#123456');
    expect(themes.DEFAULT.bodyStyle.bgColor).toBe(bgColor);
    expect(themes.DEFAULT.headerStyle.color).toBe('#654321');
  });

  test('does not merge the default into standalone or registered themes', () => {
    const custom = { headerStyle: { color: '#654321' } };
    const fallbackColor = themes.of(custom).bodyStyle.color;
    registerTheme('custom-default-test', custom);
    themes.setDefaultTheme({ defaultStyle: { color: '#123456' } });

    expect(themes.of(custom).bodyStyle.color).toBe(fallbackColor);
    expect(themes.of('custom-default-test').bodyStyle.color).toBe(fallbackColor);
    expect(themes.of('DARK')).toBe(themes.DARK);
    expect(themes.of('missing-default-test')).toBeNull();
  });

  test('keeps the existing registered-name precedence and clear behavior', () => {
    const registered = original.extends({ bodyStyle: { color: '#654321' } });
    registerTheme('DEFAULT', registered);
    themes.setDefaultTheme({ defaultStyle: { color: '#123456' } });

    expect(themes.of('DEFAULT')).toBe(registered);
    expect(internalThemes.DEFAULT.bodyStyle.color).toBe('#123456');
    clearAll();
    expect(themes.of('DEFAULT')).toBe(themes.DEFAULT);
  });
});
