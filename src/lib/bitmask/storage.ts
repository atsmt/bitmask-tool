export const BITMASK_DICT_STORAGE_KEY = "bitmask_dict";

export const DEFAULT_DICTIONARY_TEXT = `const ReceiptStatus = {
  FileReceived: 1,
  DataReceived: 2,
  ThumbCreated: 4,
  OcrDone: 8
};`;

export function loadDictionaryFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(BITMASK_DICT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveDictionaryToStorage(value: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(BITMASK_DICT_STORAGE_KEY, value);
  } catch {
    // Ignore storage errors so the calculator remains usable in private mode.
  }
}
