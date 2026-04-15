<script setup lang="ts">
import { ref, watch } from "vue";

interface DictionaryOption {
  id: string;
  name: string;
}

const defineDictionaryProps = defineProps<{
  modelValue: string;
  parseError: string | null;
  parsedCount: number;
  dictionaryOptions: DictionaryOption[];
  activeDictionaryId: string;
  activeDictionaryName: string;
  canDeleteDictionary: boolean;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "select-dictionary", value: string): void;
  (event: "add-dictionary"): void;
  (event: "rename-dictionary", value: string): void;
  (event: "delete-dictionary"): void;
}>();

const dictionaryNameDraft = ref(defineDictionaryProps.activeDictionaryName);

watch(
  () => [defineDictionaryProps.activeDictionaryId, defineDictionaryProps.activeDictionaryName],
  () => {
    dictionaryNameDraft.value = defineDictionaryProps.activeDictionaryName;
  }
);

function onInput(event: Event): void {
  const target = event.target as HTMLTextAreaElement | null;
  emit("update:modelValue", target?.value ?? "");
}

function onDictionarySelect(event: Event): void {
  const target = event.target as HTMLSelectElement | null;
  emit("select-dictionary", target?.value ?? "");
}

function onDictionaryNameInput(event: Event): void {
  const target = event.target as HTMLInputElement | null;
  dictionaryNameDraft.value = target?.value ?? "";
}

function saveDictionaryName(): void {
  emit("rename-dictionary", dictionaryNameDraft.value);
}

function addDictionary(): void {
  emit("add-dictionary");
}

function deleteDictionary(): void {
  emit("delete-dictionary");
}
</script>

<template>
  <section
    class="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm ring-1 ring-slate-900/5 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:ring-slate-100/10"
  >
    <header class="mb-3 flex items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Status collections</h2>
      </div>
      <span
        class="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-200"
      >
        {{ defineDictionaryProps.parsedCount }} parsed
      </span>
    </header>

    <div class="mb-3 space-y-2.5">
      <div>
        <label for="dictionary-selector" class="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
          Select a collection
        </label>
        <div class="flex flex-wrap items-center gap-2">
          <select
            id="dictionary-selector"
            :value="defineDictionaryProps.activeDictionaryId"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-900/50"
            @change="onDictionarySelect"
          >
            <option
              v-for="dictionary in defineDictionaryProps.dictionaryOptions"
              :key="dictionary.id"
              :value="dictionary.id"
            >
              {{ dictionary.name }}
            </option>
          </select>

          <button
            type="button"
            class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-sky-400 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-slate-100"
            @click="addDictionary"
          >
            New
          </button>

          <button
            type="button"
            class="rounded-lg border border-rose-300 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-700 transition hover:border-rose-400 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white dark:border-rose-900/60 dark:bg-slate-900 dark:text-rose-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/30 dark:disabled:border-slate-700 dark:disabled:text-slate-500 dark:disabled:hover:bg-slate-900"
            :disabled="!defineDictionaryProps.canDeleteDictionary"
            @click="deleteDictionary"
          >
            Delete
          </button>
        </div>
      </div>

      <div>
        <label for="dictionary-name" class="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
          Collection name
        </label>
        <div class="flex flex-wrap items-center gap-2">
          <input
            id="dictionary-name"
            type="text"
            :value="dictionaryNameDraft"
            class="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-900/50"
            maxlength="80"
            @input="onDictionaryNameInput"
            @blur="saveDictionaryName"
            @keydown.enter.prevent="saveDictionaryName"
          />

          <button
            type="button"
            class="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-sky-400 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-slate-100"
            @click="saveDictionaryName"
          >
            Save name
          </button>
        </div>
      </div>
    </div>

    <label for="dictionary-input" class="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
      Paste here JSON or JS object literal
    </label>

    <textarea
      id="dictionary-input"
      :value="defineDictionaryProps.modelValue"
      class="h-44 w-full resize-y rounded-xl border border-slate-300 bg-white px-2.5 py-2 font-mono text-xs text-slate-900 shadow-inner outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-900/50"
      placeholder="const ReceiptStatus = { OrderInCart: 1, OrderInitiated: 2 }"
      spellcheck="false"
      @input="onInput"
    />

    <p class="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
      Supports raw object assignments and strict JSON. Parser is regex-based and never executes input.
    </p>

    <p
      v-if="defineDictionaryProps.parseError"
      class="mt-1.5 text-xs text-rose-600"
      role="status"
      aria-live="polite"
    >
      {{ defineDictionaryProps.parseError }}
    </p>
    <p v-else class="mt-1.5 text-xs text-emerald-700 dark:text-emerald-300" role="status" aria-live="polite">
      Collection parsed successfully.
    </p>
  </section>
</template>
