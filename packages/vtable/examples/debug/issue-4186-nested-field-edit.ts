import * as VTable from '../../src';
import { InputEditor } from '@visactor/vtable-editors';

const CONTAINER_ID = 'vTable';
const FIELD = 'facts.2025-02.qty';
const inputEditor = new InputEditor({});
VTable.register.editor('issue4186-input', inputEditor);

const records = [
  {
    id: 1,
    facts: {
      '2025-02': {
        qty: 10
      }
    }
  }
];

const updateResult = (status: HTMLElement, source: HTMLElement) => {
  const record = records[0] as any;
  const nestedValue = record.facts?.['2025-02']?.qty;
  const flatValue = record[FIELD];
  const pass = nestedValue === 18 && !Object.prototype.hasOwnProperty.call(record, FIELD);

  status.textContent = `${pass ? 'PASS' : 'FAIL'} | nested=${nestedValue}, flat=${String(flatValue)}`;
  status.style.color = pass ? '#237804' : '#a8071a';
  source.textContent = JSON.stringify(record, null, 2);
  return pass;
};

const createControls = () => {
  const container = document.getElementById(CONTAINER_ID)!;
  const controls = document.createElement('div');
  controls.style.cssText = 'margin-bottom: 12px; font: 13px/1.5 sans-serif;';

  const runButton = document.createElement('button');
  runButton.textContent = 'Run #4186 check';

  const resetButton = document.createElement('button');
  resetButton.textContent = 'Reset';
  resetButton.style.marginLeft = '8px';

  const status = document.createElement('span');
  status.id = 'issue4186Status';
  status.style.marginLeft = '12px';
  status.textContent = 'READY | nested=10';

  const source = document.createElement('pre');
  source.id = 'issue4186Source';
  source.style.cssText = 'margin: 8px 0 0; padding: 8px; background: #f5f5f5;';
  source.textContent = JSON.stringify(records[0], null, 2);

  controls.append(runButton, resetButton, status, source);
  container.parentElement?.insertBefore(controls, container);

  return { runButton, resetButton, status, source };
};

export function createTable() {
  const controls = createControls();
  const tableInstance = new VTable.ListTable(document.getElementById(CONTAINER_ID)!, {
    records,
    columns: [
      { field: 'id', title: 'ID', width: 100 },
      { field: FIELD, title: '2025-02 Quantity', width: 220, editor: 'issue4186-input' }
    ],
    editCellTrigger: 'doubleclick',
    widthMode: 'standard',
    defaultRowHeight: 40
  });

  const runCheck = async () => {
    tableInstance.changeCellValue(1, tableInstance.columnHeaderLevelCount, '18');
    await new Promise(resolve => requestAnimationFrame(resolve));
    const pass = updateResult(controls.status, controls.source);
    (window as any).BUGSERVER_SCREENSHOT?.();
    return pass;
  };

  controls.runButton.onclick = runCheck;
  controls.resetButton.onclick = () => {
    records[0].facts['2025-02'].qty = 10;
    delete (records[0] as any)[FIELD];
    tableInstance.setRecords(records);
    controls.status.textContent = 'READY | nested=10';
    controls.status.style.color = '';
    controls.source.textContent = JSON.stringify(records[0], null, 2);
  };
  tableInstance.on('change_cell_value', () => updateResult(controls.status, controls.source));

  (window as any).tableInstance = tableInstance;
  (window as any).issue4186Run = runCheck;
}
