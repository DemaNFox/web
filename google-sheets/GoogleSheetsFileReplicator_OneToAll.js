function copyEachSheetToItsOwnSpreadsheet() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    Logger.log("Скрипт уже выполняется, пропускаем запуск.");
    return;
  }

  try {
    const sourceSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    // Укажи соответствия: Имя листа => ID таблицы, куда его копировать
    const sheetsToCopy = {
      "xaba": "1St42c4t3NCRBuDOA-5_fSZFuPG7GQRmTp59xnBcTxEA",
      "timi": "1gOffFJOnUoFhyK4Jbug2daJ966GZ_6byKfoT33fPQks",
    };

    for (const [sheetName, targetSpreadsheetId] of Object.entries(sheetsToCopy)) {
      const sourceSheet = sourceSpreadsheet.getSheetByName(sheetName);
      if (!sourceSheet) {
        Logger.log(`Лист "${sheetName}" не найден, пропускаем.`);
        continue;
      }

      const lastRow = sourceSheet.getLastRow();
      const lastColumn = sourceSheet.getLastColumn();
      if (lastRow === 0 || lastColumn === 0) {
        Logger.log(`Лист "${sheetName}" пуст, пропускаем.`);
        continue;
      }

      const targetSpreadsheet = SpreadsheetApp.openById(targetSpreadsheetId);
      const targetSheets = targetSpreadsheet.getSheets();

      const targetSheet = targetSheets[0];
      targetSheet.clear(); // очищаем старые данные

      const sourceRange = sourceSheet.getRange(1, 1, lastRow, lastColumn);
      const values = sourceRange.getValues();
      const formats = sourceRange.getNumberFormats();

      const targetRange = targetSheet.getRange(1, 1, lastRow, lastColumn);
      targetRange.setValues(values);
      targetRange.setNumberFormats(formats);

      // Удалим лишние строки и колонки
      const maxRows = targetSheet.getMaxRows();
      const maxCols = targetSheet.getMaxColumns();
      if (maxRows > lastRow) {
        targetSheet.deleteRows(lastRow + 1, maxRows - lastRow);
      }
      if (maxCols > lastColumn) {
        targetSheet.deleteColumns(lastColumn + 1, maxCols - lastColumn);
      }

      targetSheet.setName(sheetName); // Переименовать в оригинальное имя, если нужно
      Logger.log(`Лист "${sheetName}" успешно скопирован.`);
    }

    SpreadsheetApp.flush();
    Logger.log("Все листы обработаны.");
  } finally {
    lock.releaseLock();
  }
}
