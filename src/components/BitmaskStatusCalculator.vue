<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import DictionaryInputPanel from "./bitmask/DictionaryInputPanel.vue";
import DecimalToFlagsPanel from "./bitmask/DecimalToFlagsPanel.vue";
import FlagsToDecimalPanel from "./bitmask/FlagsToDecimalPanel.vue";
import { calculateFlagsDecimal } from "../lib/bitmask/math";
import { parseStatusDictionary } from "../lib/bitmask/parser";
import {
  DEFAULT_DICTIONARY_TEXT,
  loadDictionaryFromStorage,
  saveDictionaryToStorage
} from "../lib/bitmask/storage";

const THEME_STORAGE_KEY = "bitmask_theme";

type ThemeMode = "light" | "dark";

const rawDictionaryText = ref(DEFAULT_DICTIONARY_TEXT);
const decimalInput = ref(0);
const selectedFlagNames = ref<string[]>([]);
const themeMode = ref<ThemeMode>("light");

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

onMounted(() => {
  const savedDictionary = loadDictionaryFromStorage();

  if (savedDictionary?.trim()) {
    rawDictionaryText.value = savedDictionary;
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

watch(rawDictionaryText, (nextValue) => {
  saveDictionaryToStorage(nextValue);
});

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
  <div class="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.12),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(15,23,42,0.08),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-950 transition-colors dark:bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.16),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(148,163,184,0.1),transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] dark:text-slate-100">
    <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header class="mb-5 flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.26em] text-sky-600 dark:text-sky-300">
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
          class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-sky-400 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:text-sky-300"
          @click="toggleTheme"
        >
          {{ isDarkMode ? "Light mode" : "Dark mode" }}
        </button>
      </header>

      <div class="grid items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <DictionaryInputPanel
          v-model="rawDictionaryText"
          :parse-error="parseError"
          :parsed-count="statuses.length"
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
