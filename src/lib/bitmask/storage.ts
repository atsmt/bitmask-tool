import type { DictionaryProfile } from "./types";

export const BITMASK_DICT_STORAGE_KEY = "bitmask_dict";
const BITMASK_DICTS_STORAGE_KEY = "bitmask_dicts";
const BITMASK_ACTIVE_DICT_ID_STORAGE_KEY = "bitmask_active_dict_id";
const DEFAULT_DICTIONARY_NAME = "Default dictionary";
const UNTITLED_DICTIONARY_NAME = "Untitled dictionary";

export const DEFAULT_DICTIONARY_TEXT = `const ReceiptStatus = {
  OrderInCart: 1,
  PaymentStarted: 2,
  PaymentFinished: 4,
  OrderDelivered: 8
};`;

interface DictionaryProfilesLoadResult {
  dictionaries: DictionaryProfile[];
  activeDictionaryId: string | null;
}

export function createDictionaryProfile(name: string, text: string): DictionaryProfile {
  return {
    id: createDictionaryId(),
    name: normalizeDictionaryName(name),
    text
  };
}

export function loadDictionaryProfilesFromStorage(): DictionaryProfilesLoadResult {
  if (typeof window === "undefined") {
    return {
      dictionaries: [],
      activeDictionaryId: null
    };
  }

  try {
    const rawValue = window.localStorage.getItem(BITMASK_DICTS_STORAGE_KEY);

    if (!rawValue) {
      return {
        dictionaries: [],
        activeDictionaryId: null
      };
    }

    const parsedValue = JSON.parse(rawValue) as unknown;
    const dictionaries = parseStoredDictionaryProfiles(parsedValue);

    if (dictionaries.length === 0) {
      return {
        dictionaries: [],
        activeDictionaryId: null
      };
    }

    const storedActiveId = window.localStorage.getItem(BITMASK_ACTIVE_DICT_ID_STORAGE_KEY);
    const activeDictionaryId = dictionaries.some((dictionary) => dictionary.id === storedActiveId)
      ? storedActiveId
      : dictionaries[0].id;

    return {
      dictionaries,
      activeDictionaryId
    };
  } catch {
    return {
      dictionaries: [],
      activeDictionaryId: null
    };
  }
}

export function saveDictionaryProfilesToStorage(
  dictionaries: DictionaryProfile[],
  activeDictionaryId: string | null
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (dictionaries.length === 0) {
      window.localStorage.removeItem(BITMASK_DICTS_STORAGE_KEY);
      window.localStorage.removeItem(BITMASK_ACTIVE_DICT_ID_STORAGE_KEY);
      window.localStorage.removeItem(BITMASK_DICT_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(BITMASK_DICTS_STORAGE_KEY, JSON.stringify(dictionaries));

    const resolvedActiveId = dictionaries.some((dictionary) => dictionary.id === activeDictionaryId)
      ? activeDictionaryId
      : dictionaries[0].id;

    if (resolvedActiveId) {
      window.localStorage.setItem(BITMASK_ACTIVE_DICT_ID_STORAGE_KEY, resolvedActiveId);
    } else {
      window.localStorage.removeItem(BITMASK_ACTIVE_DICT_ID_STORAGE_KEY);
    }

    const activeDictionary =
      dictionaries.find((dictionary) => dictionary.id === resolvedActiveId) ?? dictionaries[0];

    saveDictionaryToStorage(activeDictionary?.text ?? "");
  } catch {
    // Ignore storage errors so the calculator remains usable in private mode.
  }
}

export function getDefaultDictionaryName(): string {
  return DEFAULT_DICTIONARY_NAME;
}

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

function createDictionaryId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `dict_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function parseStoredDictionaryProfiles(input: unknown): DictionaryProfile[] {
  const collection =
    Array.isArray(input)
      ? input
      : isRecord(input) && Array.isArray(input.dictionaries)
        ? input.dictionaries
        : [];

  const usedIds = new Set<string>();
  const dictionaries: DictionaryProfile[] = [];

  for (const item of collection) {
    if (!isRecord(item)) {
      continue;
    }

    const name = typeof item.name === "string" ? normalizeDictionaryName(item.name) : UNTITLED_DICTIONARY_NAME;
    const text = typeof item.text === "string" ? item.text : "";
    const rawId = typeof item.id === "string" ? item.id.trim() : "";
    const id = rawId && !usedIds.has(rawId) ? rawId : createDictionaryId();

    usedIds.add(id);
    dictionaries.push({
      id,
      name,
      text
    });
  }

  return dictionaries;
}

function normalizeDictionaryName(name: string): string {
  const trimmedName = name.trim();
  return trimmedName || UNTITLED_DICTIONARY_NAME;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null;
}
