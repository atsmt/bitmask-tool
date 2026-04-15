<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import DictionaryInputPanel from "./bitmask/DictionaryInputPanel.vue";
import DecimalToFlagsPanel from "./bitmask/DecimalToFlagsPanel.vue";
import FlagsToDecimalPanel from "./bitmask/FlagsToDecimalPanel.vue";
import { calculateFlagsDecimal } from "../lib/bitmask/math";
import { parseStatusDictionary } from "../lib/bitmask/parser";
import type { DictionaryProfile } from "../lib/bitmask/types";
import {
  DEFAULT_DICTIONARY_TEXT,
  createDictionaryProfile,
  getDefaultDictionaryName,
  loadDictionaryFromStorage,
  loadDictionaryProfilesFromStorage,
  saveDictionaryProfilesToStorage
} from "../lib/bitmask/storage";

const THEME_STORAGE_KEY = "bitmask_theme";

type ThemeMode = "light" | "dark";

const dictionaries = ref<DictionaryProfile[]>([]);
const activeDictionaryId = ref("");
const decimalInput = ref(0);
const selectedFlagNames = ref<string[]>([]);
const themeMode = ref<ThemeMode>("light");

const activeDictionary = computed(
  () =>
    dictionaries.value.find((dictionary) => dictionary.id === activeDictionaryId.value) ?? null
);

const rawDictionaryText = computed({
  get: () => activeDictionary.value?.text ?? "",
  set: (nextValue: string) => {
    if (!activeDictionary.value) {
      return;
    }

    dictionaries.value = dictionaries.value.map((dictionary) =>
      dictionary.id === activeDictionaryId.value
        ? { ...dictionary, text: nextValue }
        : dictionary
    );
  }
});

const activeDictionaryName = computed(() => activeDictionary.value?.name ?? "");

const dictionaryOptions = computed(() =>
  dictionaries.value.map((dictionary) => ({
    id: dictionary.id,
    name: dictionary.name
  }))
);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark";
}

function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function syncThemeClass(mode: ThemeMode): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", mode === "dark");
}

function toggleTheme(): void {
  themeMode.value = themeMode.value === "dark" ? "light" : "dark";
}

function resolveActiveDictionaryId(
  dictionaryList: DictionaryProfile[],
  dictionaryId: string
): string {
  if (dictionaryList.some((dictionary) => dictionary.id === dictionaryId)) {
    return dictionaryId;
  }

  return dictionaryList[0]?.id ?? "";
}

function getNextDictionaryName(): string {
  const existingNames = new Set(
    dictionaries.value.map((dictionary) => dictionary.name.toLowerCase())
  );

  let nextIndex = dictionaries.value.length + 1;

  while (true) {
    const candidateName = `Dictionary ${nextIndex}`;

    if (!existingNames.has(candidateName.toLowerCase())) {
      return candidateName;
    }

    nextIndex += 1;
  }
}

function selectDictionary(nextDictionaryId: string): void {
  if (!dictionaries.value.some((dictionary) => dictionary.id === nextDictionaryId)) {
    return;
  }

  activeDictionaryId.value = nextDictionaryId;
}

function addDictionary(): void {
  const nextDictionary = createDictionaryProfile(getNextDictionaryName(), "");
  dictionaries.value = [...dictionaries.value, nextDictionary];
  activeDictionaryId.value = nextDictionary.id;
  decimalInput.value = 0;
  selectedFlagNames.value = [];
}

function renameActiveDictionary(nextName: string): void {
  if (!activeDictionary.value) {
    return;
  }

  const normalizedName = nextName.trim() || "Untitled dictionary";

  dictionaries.value = dictionaries.value.map((dictionary) =>
    dictionary.id === activeDictionaryId.value
      ? { ...dictionary, name: normalizedName }
      : dictionary
  );
}

function deleteActiveDictionary(): void {
  if (!activeDictionary.value || dictionaries.value.length <= 1) {
    return;
  }

  if (typeof window !== "undefined") {
    const shouldDelete = window.confirm(
      `Delete dictionary "${activeDictionary.value.name}"?`
    );

    if (!shouldDelete) {
      return;
    }
  }

  const nextDictionaries = dictionaries.value.filter(
    (dictionary) => dictionary.id !== activeDictionary.value?.id
  );

  dictionaries.value = nextDictionaries;
  activeDictionaryId.value = nextDictionaries[0]?.id ?? "";
  decimalInput.value = 0;
  selectedFlagNames.value = [];
}

onMounted(() => {
  const storedDictionaries = loadDictionaryProfilesFromStorage();

  if (storedDictionaries.dictionaries.length > 0) {
    dictionaries.value = storedDictionaries.dictionaries;
    activeDictionaryId.value =
      storedDictionaries.activeDictionaryId ?? storedDictionaries.dictionaries[0].id;
  } else {
    const savedDictionary = loadDictionaryFromStorage();
    const initialDictionaryText =
      savedDictionary?.trim() || DEFAULT_DICTIONARY_TEXT;
    const defaultDictionary = createDictionaryProfile(
      getDefaultDictionaryName(),
      initialDictionaryText
    );

    dictionaries.value = [defaultDictionary];
    activeDictionaryId.value = defaultDictionary.id;
  }

  let nextTheme = getSystemTheme();

  if (typeof window !== "undefined") {
    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

      if (isThemeMode(storedTheme)) {
        nextTheme = storedTheme;
      }
    } catch {
      // Ignore storage access issues and fall back to system preference.
    }
  }

  themeMode.value = nextTheme;
  syncThemeClass(nextTheme);
});

watch(
  [dictionaries, activeDictionaryId],
  ([nextDictionaries, nextActiveId]) => {
    if (nextDictionaries.length === 0) {
      return;
    }

    const resolvedActiveId = resolveActiveDictionaryId(
      nextDictionaries,
      nextActiveId
    );

    if (resolvedActiveId !== nextActiveId) {
      activeDictionaryId.value = resolvedActiveId;
      return;
    }

    saveDictionaryProfilesToStorage(nextDictionaries, resolvedActiveId);
  },
  { deep: true }
);

watch(themeMode, (nextTheme) => {
  syncThemeClass(nextTheme);

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch {
    // Ignore storage access issues and keep theme switch functional.
  }
});

const parseResult = computed(() => parseStatusDictionary(rawDictionaryText.value));
const statuses = computed(() => parseResult.value.statuses);
const parseError = computed(() => parseResult.value.error);

watch(statuses, (nextStatuses) => {
  const validNameSet = new Set(nextStatuses.map((status) => status.name));

  selectedFlagNames.value = selectedFlagNames.value.filter((name) => validNameSet.has(name));
});

const flagsToDecimalResult = computed(() =>
  calculateFlagsDecimal(statuses.value, selectedFlagNames.value)
);

const flagsToBinaryResult = computed(() => {
  const decimalValue = Math.max(0, flagsToDecimalResult.value);
  return decimalValue.toString(2);
});

const isDarkMode = computed(() => themeMode.value === "dark");
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.12),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(15,23,42,0.08),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-950 transition-colors dark:bg-[radial-gradient(circle_at_18%_16%,rgba(148,163,184,0.12),transparent_42%),radial-gradient(circle_at_85%_4%,rgba(71,85,105,0.16),transparent_36%),linear-gradient(180deg,#05070a_0%,#11161d_100%)] dark:text-slate-100">
    <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header class="mb-5 flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.26em] text-sky-600 dark:text-slate-300">
            For Developers
          </p>
          <h1 class="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Bitmask Status Calculator
          </h1>
          <p class="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
            Quickly convert decimal/binary bitmasks to status flags and reverse.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-sky-400 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-slate-100 dark:focus:ring-slate-600 cursor-pointer"
          :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
          :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <svg
            v-if="isDarkMode"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            class="h-4 w-4"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            class="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M21 13.2A9 9 0 1 1 10.8 3a7.2 7.2 0 0 0 10.2 10.2Z" />
          </svg>
        </button>
      </header>

      <div class="grid items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <DictionaryInputPanel
          v-model="rawDictionaryText"
          :parse-error="parseError"
          :parsed-count="statuses.length"
          :dictionary-options="dictionaryOptions"
          :active-dictionary-id="activeDictionaryId"
          :active-dictionary-name="activeDictionaryName"
          :can-delete-dictionary="dictionaries.length > 1"
          @select-dictionary="selectDictionary"
          @add-dictionary="addDictionary"
          @rename-dictionary="renameActiveDictionary"
          @delete-dictionary="deleteActiveDictionary"
        />

        <DecimalToFlagsPanel v-model="decimalInput" :statuses="statuses" />

        <FlagsToDecimalPanel
          v-model="selectedFlagNames"
          :statuses="statuses"
          :calculated-decimal="flagsToDecimalResult"
          :calculated-binary="flagsToBinaryResult"
        />
      </div>
    </main>
  </div>
</template>
