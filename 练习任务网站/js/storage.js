(function (root) {
  const KEYS = {
    customTasks: 'practice.customTasks.v1',
    records: 'practice.records.v1',
    hiddenTaskIds: 'practice.hiddenTaskIds.v1',
    settings: 'practice.settings.v1',
  };

  function readJson(key, fallback) {
    try {
      const raw = root.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn('读取本地数据失败', key, error);
      return fallback;
    }
  }

  function writeJson(key, value) {
    root.localStorage.setItem(key, JSON.stringify(value));
  }

  function getCustomTasks() {
    return readJson(KEYS.customTasks, []);
  }

  function setCustomTasks(tasks) {
    writeJson(KEYS.customTasks, Array.isArray(tasks) ? tasks : []);
  }

  function getRecords() {
    return readJson(KEYS.records, []);
  }

  function setRecords(records) {
    writeJson(KEYS.records, Array.isArray(records) ? records : []);
  }

  function getHiddenTaskIds() {
    return readJson(KEYS.hiddenTaskIds, []);
  }

  function setHiddenTaskIds(ids) {
    writeJson(KEYS.hiddenTaskIds, Array.isArray(ids) ? ids : []);
  }

  function getSettings() {
    return readJson(KEYS.settings, {
      preferredLevel: 1,
      currentTaskId: '',
    });
  }

  function setSettings(settings) {
    writeJson(KEYS.settings, {
      ...getSettings(),
      ...(settings || {}),
    });
  }

  function exportAll() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      customTasks: getCustomTasks(),
      records: getRecords(),
      hiddenTaskIds: getHiddenTaskIds(),
      settings: getSettings(),
    };
  }

  function importAll(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('导入数据格式无效');
    }

    if (Array.isArray(data.customTasks)) setCustomTasks(data.customTasks);
    if (Array.isArray(data.records)) setRecords(data.records);
    if (Array.isArray(data.hiddenTaskIds)) setHiddenTaskIds(data.hiddenTaskIds);
    if (data.settings && typeof data.settings === 'object') setSettings(data.settings);
  }

  function clearAll() {
    Object.values(KEYS).forEach((key) => root.localStorage.removeItem(key));
  }

  root.PracticeStorage = {
    getCustomTasks,
    setCustomTasks,
    getRecords,
    setRecords,
    getHiddenTaskIds,
    setHiddenTaskIds,
    getSettings,
    setSettings,
    exportAll,
    importAll,
    clearAll,
  };
})(window);
