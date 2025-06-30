const RANGE_MAP = {
  "'sheet'!B3:B200": "'sheet'!E3:E200",
};

const PREFIX = 'ПК';

function onEditGetPcNumber(e) {
  const lock = LockService.getDocumentLock();
  const props = PropertiesService.getDocumentProperties();

  try {
    if (!e || !e.range) return;
    lock.waitLock(3000);

    const execFlag = props.getProperty('executionFlag');
    if (execFlag === 'running') return;
    props.setProperty('executionFlag', 'running');

    const editedRange = e.range;
    const editedSheet = editedRange.getSheet();
    const editedValue = e.value;
    const cacheKey = 'valueToPkMap';

    let valueToPkMap = JSON.parse(props.getProperty(cacheKey) || '{}');
    let usedPks = new Set(Object.values(valueToPkMap));

    for (const [inputRangeStr, outputRangeStr] of Object.entries(RANGE_MAP)) {
      const inputRange = SpreadsheetApp.getActiveSpreadsheet().getRange(inputRangeStr);
      const outputRange = SpreadsheetApp.getActiveSpreadsheet().getRange(outputRangeStr);
      const inputSheet = inputRange.getSheet();

      if (inputSheet.getName() !== editedSheet.getName()) continue;
      const erRow = editedRange.getRow();
      const erCol = editedRange.getColumn();
      const erLastRow = editedRange.getLastRow();
      const erLastCol = editedRange.getLastColumn();

      const irRow = inputRange.getRow();
      const irCol = inputRange.getColumn();
      const irLastRow = inputRange.getLastRow();
      const irLastCol = inputRange.getLastColumn();

      const inRange =
        erRow >= irRow &&
        erLastRow <= irLastRow &&
        erCol >= irCol &&
        erLastCol <= irLastCol;

      if (!inRange) continue;


      const inputValues = inputRange.getValues();
      const outputValues = outputRange.getValues();
      const inputRowOffset = inputRange.getRow();
      const inputColOffset = inputRange.getColumn();
      const outputColOffset = outputRange.getColumn();

      for (let i = 0; i < inputValues.length; i++) {
        const row = inputRowOffset + i;
        for (let j = 0; j < inputValues[i].length; j++) {
          const col = inputColOffset + j;
          const rawVal = inputValues[i][j];
          if (!rawVal) continue;

          const val = rawVal.toString().trim().replace(/\s+/g, ' ');
          const outputCell = inputSheet.getRange(row, outputColOffset);
          const currentOutput = (outputValues[i][0] || '').toString().trim();

          const cell = inputSheet.getRange(row, col);
          const validations = cell.getDataValidation();
          if (validations) {
            const criteria = validations.getCriteriaType();
            const args = validations.getCriteriaValues();
            if (criteria === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST) {
              const allowedValues = args[0];
              const normalizedAllowed = allowedValues.map(s => s.toString().trim().replace(/\s+/g, ' '));
              if (!normalizedAllowed.includes(val)) continue;
            }
          }

          if (!valueToPkMap[val]) {
            let nextNumber = 1;
            while (usedPks.has(`${PREFIX}${nextNumber}`)) nextNumber++;
            const nextPk = `${PREFIX}${nextNumber}`;
            valueToPkMap[val] = nextPk;
            usedPks.add(nextPk);
          }

          if (currentOutput !== valueToPkMap[val]) {
            outputCell.setValue(valueToPkMap[val]);
          }
        }
      }
    }

    props.setProperty(cacheKey, JSON.stringify(valueToPkMap));
  } catch (err) {
    console.warn(`⛔ Ошибка или блокировка: ${err}`);
  } finally {
    props.setProperty('executionFlag', 'idle');
    lock.releaseLock();
  }
}
