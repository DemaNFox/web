function copyFullSheetValuesWithFormats() {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) {
        Logger.log("Скрипт уже выполняется, пропускаем запуск.");
        return;
    }

    try {
        var startTime = new Date().getTime();

        var sourceSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        var sourceSheet = sourceSpreadsheet.getActiveSheet();
        var targetSpreadsheet = SpreadsheetApp.openById("1LTGLoUpxWKXAQWwNe5hi3SeloegV15311-HFIAz7K6M");
        var targetSheet = targetSpreadsheet.getSheets()[0];

        var lastRow = sourceSheet.getLastRow();
        var lastColumn = sourceSheet.getLastColumn();

        if (lastRow === 0 || lastColumn === 0) {
            Logger.log("Исходный лист пуст, копирование отменено.");
            return;
        }

        var sourceRange = sourceSheet.getRange(1, 1, lastRow, lastColumn);
        var data = sourceRange.getValues(); // Только значения

        var targetRange = targetSheet.getRange(1, 1, lastRow, lastColumn);
        targetRange.clearContent(); // Очищаем только содержимое
        targetRange.setValues(data); // Вставляем значения
        targetRange.setNumberFormats(sourceRange.getNumberFormats()); // Применяем формат отображения

        // Очищаем лишние данные за пределами
        var targetMaxRows = targetSheet.getMaxRows();
        var targetMaxCols = targetSheet.getMaxColumns();

        if (targetMaxRows > lastRow) {
            targetSheet.getRange(lastRow + 1, 1, targetMaxRows - lastRow, targetMaxCols).clearContent();
        }
        if (targetMaxCols > lastColumn) {
            targetSheet.getRange(1, lastColumn + 1, targetMaxRows, targetMaxCols - lastColumn).clearContent();
        }

        SpreadsheetApp.flush();

        var endTime = new Date().getTime();
        Logger.log("Время выполнения (мс): " + (endTime - startTime));
    } finally {
        lock.releaseLock();
    }
}
