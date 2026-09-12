import { ListTable, PivotTable, PivotChart, themes } from '../src';
import { createDiv, removeDom } from './dom';

describe('default theme instance behavior', () => {
  const original = themes.DEFAULT;
  const tables: (ListTable | PivotTable | PivotChart)[] = [];
  const containers: HTMLElement[] = [];
  const columns = [{ field: 'name', title: 'Name' }];
  const records = [{ name: 'Example' }];

  function container() {
    const element = createDiv();
    element.style.width = '600px';
    element.style.height = '400px';
    containers.push(element);
    return element;
  }

  afterEach(() => {
    tables.forEach(table => table.release());
    tables.length = 0;
    containers.forEach(removeDom);
    containers.length = 0;
    themes.setDefaultTheme(original);
  });

  test('uses the configured default for all table types and both constructor forms', () => {
    themes.setDefaultTheme(original.extends({ bodyStyle: { color: '#123456' } }));
    tables.push(
      new ListTable(container(), { columns, records }),
      new ListTable({ container: container(), columns, records }),
      new PivotTable(container(), { records: [] }),
      new PivotTable({ container: container(), records: [] }),
      new PivotChart(container(), { records: [] }),
      new PivotChart({ container: container(), records: [] })
    );
    tables.forEach(table => expect(table.theme.bodyStyle.color).toBe('#123456'));
  });

  test('leaves existing instances unchanged and uses the new default on updateOption', () => {
    const table = new ListTable(container(), { columns, records });
    tables.push(table);
    const previous = table.theme;
    const previousColor = previous.bodyStyle.color;
    themes.setDefaultTheme(original.extends({ bodyStyle: { color: '#123456' } }));

    expect(table.theme).toBe(previous);
    expect(table.theme.bodyStyle.color).toBe(previousColor);
    table.updateOption({ columns, records });
    expect(table.theme.bodyStyle.color).toBe('#123456');
  });

  test('preserves explicit themes, replacement updates and property assignment', () => {
    themes.setDefaultTheme(original.extends({ bodyStyle: { color: '#123456' } }));
    const custom = themes.DARK.extends({ bodyStyle: { color: '#654321' } });
    const table = new ListTable(container(), { columns, records, theme: custom });
    tables.push(table);

    expect(table.theme.bodyStyle.color).toBe('#654321');
    table.updateTheme({ headerStyle: { color: '#abcdef' } });
    expect(table.theme.bodyStyle.color).toBe(themes.of({}).bodyStyle.color);
    table.theme = custom;
    expect(table.theme.bodyStyle.color).toBe('#654321');
    table.updateTheme(themes.DEFAULT);
    expect(table.theme.bodyStyle.color).toBe('#123456');
    table.updateOption({ columns, records, theme: custom });
    expect(table.theme.bodyStyle.color).toBe('#654321');
  });
});
