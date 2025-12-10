const STORAGE_PREFIX = 'ai-command-center-';

export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  },
  remove: (key: string): void => {
    localStorage.removeItem(STORAGE_PREFIX + key);
  }
};

