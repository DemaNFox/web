// 1. Закидываем скрипт в app scripts
// 2. Указыаем целевой файл
// 3. Настраиваем тригер

function copyFullSheetWithFormulasOptimized() {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) { // Ждём 10 секунд, если скрипт уже выполняется
        Logger.log("Скрипт уже выполняется, пропускаем запуск.");
        return;
    }

    try {
        var startTime = new Date().getTime(); // Засекаем время старта

        var sourceSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        var sourceSheet = sourceSpreadsheet.getActiveSheet();
        var targetSpreadsheet = SpreadsheetApp.openById("ID"); // Целевой файл (id)
        var targetSheet = targetSpreadsheet.getSheets()[0];

        var lastRow = sourceSheet.getLastRow();
        var lastColumn = sourceSheet.getLastColumn();

        if (lastRow === 0 || lastColumn === 0) { // Проверка на пустой лист
            Logger.log("Исходный лист пуст, копирование отменено.");
            return;
        }

        var range = sourceSheet.getRange(1, 1, lastRow, lastColumn);
        var data = range.getValues(); // Получаем обычные значения
        var formulas = range.getFormulas(); // Получаем формулы
        var formats = range.getNumberFormats(); // Получаем числовые форматы (типы данных)

        // ✅ Теперь очищаем только изменённые ячейки (не удаляя форматирование)
        var targetRange = targetSheet.getRange(1, 1, lastRow, lastColumn);
        targetRange.clearContent(); // Очищаем только содержимое, не формат

        // ✅ Оптимизация: Вставляем данные и формулы сразу
        var outputData = [];
        for (var i = 0; i < data.length; i++) {
            outputData[i] = [];
            for (var j = 0; j < data[i].length; j++) {
                outputData[i][j] = formulas[i][j] ? formulas[i][j] : data[i][j];
            }
        }

        targetRange.setValues(outputData); // Вставляем данные и пустые ячейки
        targetRange.setNumberFormats(formats); // Вставляем числовые форматы

        // ✅ Очищаем лишние данные в целевом файле, если там больше строк/столбцов, чем в исходном
        var targetMaxRows = targetSheet.getMaxRows();
        var targetMaxCols = targetSheet.getMaxColumns();

        if (targetMaxRows > lastRow) {
            targetSheet.getRange(lastRow + 1, 1, targetMaxRows - lastRow, targetMaxCols).clearContent();
        }
        if (targetMaxCols > lastColumn) {
            targetSheet.getRange(1, lastColumn + 1, targetMaxRows, targetMaxCols - lastColumn).clearContent();
        }

        SpreadsheetApp.flush(); // Завершаем операции

        var endTime = new Date().getTime();
        Logger.log("Время выполнения (мс): " + (endTime - startTime));
    } finally {
        lock.releaseLock(); // Освобождаем блокировку
    }
}
