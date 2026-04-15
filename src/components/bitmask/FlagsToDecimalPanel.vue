<script setup lang="ts">
import { computed } from "vue";
import type { StatusFlag } from "../../lib/bitmask/types";

const defineFlagsProps = defineProps<{
  statuses: StatusFlag[];
  modelValue: string[];
  calculatedDecimal: number;
  calculatedBinary: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string[]): void;
}>();

const selectedNames = computed({
  get: () => defineFlagsProps.modelValue,
  set: (nextValue: string[]) => {
    emit("update:modelValue", nextValue);
  }
});
</script>

<template>
  <section
    class="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm ring-1 ring-slate-900/5 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:ring-slate-100/10"
  >
    <header class="mb-3">
      <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Flags => decimal/binary</h2>
    </header>

    <div
      class="mb-3 grid grid-cols-2 gap-2 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
      role="status"
      aria-live="polite"
    >
      <div>
        <p class="text-[11px] font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">Decimal</p>
        <p class="mt-0.5 font-mono text-lg font-semibold">{{ defineFlagsProps.calculatedDecimal }}</p>
      </div>
      <div>
        <p class="text-[11px] font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">Binary</p>
        <p class="mt-0.5 truncate font-mono text-lg font-semibold">{{ defineFlagsProps.calculatedBinary }}</p>
      </div>
    </div>

    <div v-if="defineFlagsProps.statuses.length > 0" class="space-y-1.5">
      <label
        v-for="status in defineFlagsProps.statuses"
        :key="status.name"
        class="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500 dark:hover:bg-slate-800"
      >
        <div class="flex items-center gap-2">
          <input
            v-model="selectedNames"
            type="checkbox"
            :value="status.name"
            class="h-4 w-4 rounded border-slate-400 text-sky-600 focus:ring-sky-300 dark:border-slate-500 dark:text-slate-200 dark:focus:ring-slate-600"
          />
          <span class="font-medium text-slate-800 dark:text-slate-200">{{ status.name }}</span>
        </div>
        <span class="font-mono text-slate-600 dark:text-slate-300">{{ status.value }}</span>
      </label>
    </div>
    <p v-else class="text-xs text-slate-500 dark:text-slate-400">
      Parse a valid dictionary to enable checkbox selection.
    </p>
  </section>
</template>
