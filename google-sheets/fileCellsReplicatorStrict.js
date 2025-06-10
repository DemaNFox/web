function copySpecificCellsToSpecificSheets() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    Logger.log("Скрипт уже выполняется, пропускаем запуск.");
    return;
  }

  try {
    const sourceSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const debugInfo = []; // Массив для сбора отладочной информации


    TARGETBOOK = "12RUe9CVoUvjLKHubFYvgN69fmOEB20Uo0YDaQhgQAng"

    XABA =  "Xaba"
    const config = {
      XABA : {
        "targetSpreadsheetId": TARGETBOOK,
        "targetSheetName": XABA,
        "cellsMapping": [
          {source: "A3:A200", target: "D4"}, // numbers
          {source: "F3:G200", target: "E4"}, // time
          {source: "B3:C200", target: "A4"}, // names
        ]
      },
    };

          for (const [sourceSheetName, sheetConfig] of Object.entries(config)) {
      const sourceSheet = sourceSpreadsheet.getSheetByName(sourceSheetName);
      if (!sourceSheet) {
        const msg = `Лист "${sourceSheetName}" не найден в источнике, пропускаем.`;
        Logger.log(msg);
        debugInfo.push(msg);
        continue;
      }

      let targetSpreadsheet;
      try {
        targetSpreadsheet = SpreadsheetApp.openById(sheetConfig.targetSpreadsheetId);
      } catch (e) {
        const msg = `Не удалось открыть целевую таблицу с ID ${sheetConfig.targetSpreadsheetId} для листа "${sourceSheetName}": ${e}`;
        Logger.log(msg);
        debugInfo.push(msg);
        continue;
      }

      const targetSheet = targetSpreadsheet.getSheetByName(sheetConfig.targetSheetName);
      if (!targetSheet) {
        const msg = `Целевой лист "${sheetConfig.targetSheetName}" не найден в документе ${sheetConfig.targetSpreadsheetId}, пропускаем.`;
        Logger.log(msg);
        debugInfo.push(msg);
        continue;
      }

      for (const mapping of sheetConfig.cellsMapping) {
        try {
          const sourceRange = sourceSheet.getRange(mapping.source);
          const values = sourceRange.getValues();
          const numRows = sourceRange.getNumRows();
          const numCols = sourceRange.getNumColumns();
          const targetRange = targetSheet.getRange(mapping.target).offset(0, 0, numRows, numCols);

          // Проверяем валидацию данных для целевого диапазона
          try {
            const dataValidations = targetRange.getDataValidations();
            for (let i = 0; i < dataValidations.length; i++) {
              for (let j = 0; j < dataValidations[i].length; j++) {
                if (dataValidations[i][j] != null) {
                  const validation = dataValidations[i][j];
                  if (validation.getCriteriaType() == SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST) {
                    const allowedValues = validation.getCriteriaValues()[0];
                    const cellValue = values[i][j];
                    if (cellValue && !allowedValues.includes(cellValue)) {
                      const msg = `Валидация: значение "${cellValue}" не разрешено в ${sheetConfig.targetSheetName}!${targetRange.getA1Notation()} (допустимы: ${allowedValues.join(', ')})`;
                      Logger.log(msg);
                      debugInfo.push(msg);
                    }
                  }
                }
              }
            }
          } catch (e) {
            Logger.log(`Ошибка при проверке валидации: ${e}`);
          }

          // Пытаемся вставить данные
          targetRange.setValues(values);
          
          const successMsg = `Успешно: ${sourceSheetName}!${mapping.source} -> ${sheetConfig.targetSheetName}!${mapping.target}`;
          Logger.log(successMsg);
          debugInfo.push(successMsg);
        } catch (e) {
          const errorMsg = `Ошибка при копировании ${sourceSheetName}!${mapping.source} -> ${sheetConfig.targetSheetName}!${mapping.target}: ${e}`;
          Logger.log(errorMsg);
          debugInfo.push(errorMsg);
          
          // Дополнительная информация об ошибке валидации
          if (e.message.includes("violates the data validation rules")) {
            const targetRange = targetSheet.getRange(mapping.target);
            try {
              const validation = targetRange.getDataValidation();
              if (validation) {
                const allowedValues = validation.getCriteriaValues()[0];
                debugInfo.push(`Допустимые значения: ${allowedValues.join(', ')}`);
              }
            } catch (validationError) {
              debugInfo.push(`Не удалось получить правила валидации: ${validationError}`);
            }
          }
        }
      }
    }

    // Выводим полный отчет
    Logger.log("===== ПОЛНЫЙ ОТЧЕТ =====");
    debugInfo.forEach(msg => Logger.log(msg));
    
    // Можно также отправить отчет по email или записать в отдельный лист
    // sendDebugReport(debugInfo);
    
    SpreadsheetApp.flush();
    Logger.log("Копирование завершено.");
  } finally {
    lock.releaseLock();
  }
}
