(async () => {
  const getMemoryUsage = () => {
    if ('memory' in performance) {
      const used = performance.memory.usedJSHeapSize / 1024 / 1024;
      const total = performance.memory.totalJSHeapSize / 1024 / 1024;
      return {
        usedMB: used.toFixed(2),
        totalMB: total.toFixed(2),
      };
    } else {
      return null;
    }
  };

  const walkDOM = (node) => {
    let count = 1;
    for (let child of node.childNodes) {
      count += walkDOM(child);
    }
    return count;
  };

  const getTextSize = () => {
    const texts = Array.from(document.querySelectorAll('p, span, div, pre, code'))
      .map(el => el.innerText || '')
      .filter(Boolean);
    const textContent = texts.join('\n');
    return new Blob([textContent]).size / 1024; // in KB
  };

  const getImageStats = () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    let totalSize = 0;
    for (let img of imgs) {
      if (img.complete && img.naturalWidth > 0) {
        const src = img.src;
        if (src.startsWith('data:image')) {
          const base64 = src.split(',')[1];
          totalSize += (base64.length * 3) / 4 / 1024; // KB
        }
      }
    }
    return {
      count: imgs.length,
      totalSizeKB: totalSize.toFixed(2),
    };
  };

  const domNodeCount = walkDOM(document.body);
  const textSizeKB = getTextSize();
  const imageStats = getImageStats();
  const memory = getMemoryUsage();

  console.log('%c📊 ChatGPT Вкладка — Аудит Использования Памяти', 'color: cyan; font-weight: bold; font-size: 16px;');
  if (memory) {
    console.log(`🧠 JS Heap: ${memory.usedMB} MB / ${memory.totalMB} MB`);
  } else {
    console.warn('⚠️ performance.memory не поддерживается в этом браузере.');
  }
  console.log(`🧱 DOM узлов: ${domNodeCount}`);
  console.log(`📄 Текстовый контент: ~${textSizeKB.toFixed(2)} KB`);
  console.log(`🖼️ Картинки: ${imageStats.count} шт., ~${imageStats.totalSizeKB} KB`);
})();
