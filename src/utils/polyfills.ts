
/**
 * Polyfills for browser compatibility
 * Include this file to ensure our application works across all supported browsers.
 */

// URL.createObjectURL polyfill for browsers that might not support it
if (typeof window !== 'undefined' && !window.URL) {
  window.URL = window.URL || window.webkitURL;
}

// Fetch API polyfill check
if (typeof window !== 'undefined' && !window.fetch) {
  console.warn('Fetch API is not supported in this browser. Some functionality might be limited.');
}

// LocalStorage check
export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// SessionStorage check
export const isSessionStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// For environments where localStorage isn't available, provide a fallback
export const createStorageFallback = () => {
  let storage: Record<string, string> = {};
  
  return {
    getItem(key: string): string | null {
      return storage[key] || null;
    },
    setItem(key: string, value: string): void {
      storage[key] = value;
    },
    removeItem(key: string): void {
      delete storage[key];
    },
    clear(): void {
      storage = {};
    }
  };
};

// Export default browser storage or fallback if unavailable
export const getStorage = () => {
  if (isLocalStorageAvailable()) {
    return localStorage;
  } else {
    console.warn('localStorage is not available. Using in-memory storage fallback.');
    return createStorageFallback();
  }
};
