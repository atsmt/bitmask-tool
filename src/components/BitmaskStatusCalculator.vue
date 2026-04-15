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

const rawDictionaryText = ref(DEFAULT_DICTIONARY_TEXT);
const decimalInput = ref(0);
const selectedFlagNames = ref<string[]>([]);

onMounted(() => {
  const savedDictionary = loadDictionaryFromStorage();

  if (savedDictionary?.trim()) {
    rawDictionaryText.value = savedDictionary;
  }
});

watch(rawDictionaryText, (nextValue) => {
  saveDictionaryToStorage(nextValue);
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
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.12),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(15,23,42,0.08),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
    <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header class="mb-5">
        <p class="text-xs font-semibold uppercase tracking-[0.26em] text-sky-600">
          For Developers
        </p>
        <h1 class="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Bitmask Status Calculator
        </h1>
        <p class="mt-2 max-w-3xl text-sm text-slate-600">
          Quickly convert decimal/binary bitmasks to status flags and reverse.
        </p>
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
