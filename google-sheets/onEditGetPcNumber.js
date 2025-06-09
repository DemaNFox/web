const RANGE_MAP = {
  "'sheet'!B3:B200": "'sheet'!E3:E200",
};

const PREFIX = 'ПК';

function onEditGetPcNumber(e) {
  const lock = LockService.getDocumentLock();
  const props = PropertiesService.getDocumentProperties();

  try {
    lock.waitLock(3000); // Блокировка на 3 секунды

    const execFlag = props.getProperty('executionFlag');
    if (execFlag === 'running') {
      console.warn('⚠️ Скрипт уже выполняется — выход');
      return;
    }

    props.setProperty('executionFlag', 'running');

    const editedRange = e.range;
    const editedSheet = editedRange.getSheet();
    const editedValue = e.value;

    console.log(`📝 Редактирование: ${editedSheet.getName()}!${editedRange.getA1Notation()} → "${editedValue}"`);

    const cacheKey = 'valueToPkMap';
    let valueToPkMap = JSON.parse(props.getProperty(cacheKey) || '{}');
    let usedPks = new Set(Object.values(valueToPkMap));

    for (const [inputRangeStr, outputRangeStr] of Object.entries(RANGE_MAP)) {
      const inputRange = SpreadsheetApp.getActiveSpreadsheet().getRange(inputRangeStr);
      const outputRange = SpreadsheetApp.getActiveSpreadsheet().getRange(outputRangeStr);
      const inputSheet = inputRange.getSheet();

      const inputValues = inputRange.getValues();
      const outputValues = outputRange.getValues();
      const inputRowOffset = inputRange.getRow();
      const outputColOffset = outputRange.getColumn();

      for (let i = 0; i < inputValues.length; i++) {
        const rawVal = inputValues[i][0];
        if (!rawVal) continue;

        const val = rawVal.toString().trim().replace(/\s+/g, ' ');
        const row = inputRowOffset + i;
        const outputCell = inputSheet.getRange(row, outputColOffset);
        const currentOutput = (outputValues[i][0] || '').toString().trim();

        const validations = inputRange.getCell(i + 1, 1).getDataValidation();
        if (validations) {
          const criteria = validations.getCriteriaType();
          const args = validations.getCriteriaValues();

          if (criteria === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST) {
            const allowedValues = args[0];
            const normalizedAllowed = allowedValues.map(s =>
              s.toString().trim().replace(/\s+/g, ' ')
            );

            console.log(`📜 Нормализованные значения (строка ${row}): ${normalizedAllowed.join(', ')}`);

            if (!normalizedAllowed.includes(val)) {
              console.warn(`⛔ "${val}" не найдено в списке разрешённых — пропущено`);
              continue;
            }
          }
        } else {
          console.log(`⚠️ Нет валидации на строке ${row}`);
        }

        if (!valueToPkMap[val]) {
          let nextNumber = 1;
          while (usedPks.has(`${PREFIX}${nextNumber}`)) nextNumber++;
          const nextPk = `${PREFIX}${nextNumber}`;
          valueToPkMap[val] = nextPk;
          usedPks.add(nextPk);
          console.log(`🆕 Назначено: ${val} → ${nextPk}`);
        }

        if (currentOutput !== valueToPkMap[val]) {
          outputCell.setValue(valueToPkMap[val]);
          console.log(`✏️ Записано в ${outputCell.getA1Notation()}: ${valueToPkMap[val]}`);
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
