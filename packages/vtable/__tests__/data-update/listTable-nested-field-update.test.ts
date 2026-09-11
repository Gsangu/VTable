// @ts-nocheck
import { ListTable } from '../../src';
import { createDiv } from '../dom';

describe('ListTable nested field updates', () => {
  test('updates a nested field and reports its old and changed values', () => {
    const field = 'facts.2025-02.qty';
    const records = [{ facts: { '2025-02': { qty: 10 } } }];
    const table = new ListTable({
      container: createDiv(),
      columns: [{ field, title: 'Quantity' }],
      records
    });
    const events: any[] = [];
    table.on('change_cell_value', event => events.push(event));

    table.changeCellValueByRecord(0, field, '12', { autoRefresh: false });

    expect(records[0].facts['2025-02'].qty).toBe(12);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      col: 0,
      row: 1,
      recordIndex: 0,
      field,
      rawValue: 10,
      currentValue: 10,
      changedValue: 12
    });
    table.release();
  });

  test('updates nested fields in a batch change and reports the aggregate event', () => {
    const field = 'facts.2025-02.qty';
    const records = [{ facts: { '2025-02': { qty: 10 } } }];
    const table = new ListTable({
      container: createDiv(),
      columns: [{ field, title: 'Quantity' }],
      records
    });
    const cellEvents: any[] = [];
    const batchEvents: any[] = [];
    table.on('change_cell_value', event => cellEvents.push(event));
    table.on('change_cell_values', event => batchEvents.push(event));

    table.changeCellValuesByRecords([{ recordIndex: 0, field, value: '12' }], { autoRefresh: false });

    expect(records[0].facts['2025-02'].qty).toBe(12);
    expect(cellEvents).toHaveLength(1);
    expect(cellEvents[0].changedValue).toBe(12);
    expect(batchEvents).toHaveLength(1);
    expect(batchEvents[0].values).toEqual(cellEvents);
    table.release();
  });

  test('updates an array field path and reports its old and changed values', () => {
    const field = ['facts', '2025-02', 'qty'];
    const records = [{ facts: { '2025-02': { qty: 10 } } }];
    const table = new ListTable({
      container: createDiv(),
      columns: [{ field, title: 'Quantity' }],
      records
    });
    const events: any[] = [];
    table.on('change_cell_value', event => events.push(event));

    table.changeCellValueByRecord(0, [...field], '12', { autoRefresh: false });

    expect(records[0].facts['2025-02'].qty).toBe(12);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      col: 0,
      recordIndex: 0,
      rawValue: 10,
      currentValue: 10,
      changedValue: 12
    });
    table.release();
  });

  test('matches copied array fields when resolving a custom sort function', () => {
    const field = ['facts', 'qty'];
    const orderFn = jest.fn();
    const table = new ListTable({
      container: createDiv(),
      columns: [{ field, title: 'Quantity', sort: orderFn }],
      records: [{ facts: { qty: 10 } }]
    });

    expect(table._getSortFuncFromHeaderOption(undefined, [...field])).toBe(orderFn);
    table.release();
  });

  test('reports stored values when updates create records', () => {
    const field = ['facts', 'qty'];
    const records: any[] = [];
    const table = new ListTable({
      container: createDiv(),
      columns: [{ field, title: 'Quantity' }],
      records
    });
    const cellEvents: any[] = [];
    const batchEvents: any[] = [];
    table.on('change_cell_value', event => cellEvents.push(event));
    table.on('change_cell_values', event => batchEvents.push(event));
    table.dataSource.beforeChangedRecordsMap.set('0', { facts: { qty: 0 } });

    table.changeCellValueByRecord(0, [...field], '12', {
      autoRefresh: false,
      noTriggerChangeCellValuesEvent: true
    });

    expect(records[0].facts.qty).toBe(12);
    expect(cellEvents[0].changedValue).toBe(12);

    table.dataSource.beforeChangedRecordsMap.set('1', { facts: { qty: 0 } });
    table.changeCellValuesByRecords([{ recordIndex: 1, field: [...field], value: '14' }], { autoRefresh: false });

    expect(records[1].facts.qty).toBe(14);
    expect(cellEvents[1].changedValue).toBe(14);
    expect(batchEvents[0].values).toEqual([cellEvents[1]]);
    table.release();
  });
});
