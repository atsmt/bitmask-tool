<script setup lang="ts">
import { computed, ref } from "vue";
import { isFlagActive, parseBitmaskInput, toInteger } from "../../lib/bitmask/math";
import type { StatusFlag } from "../../lib/bitmask/types";

const defineDecimalProps = defineProps<{
  statuses: StatusFlag[];
  modelValue: number;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: number): void;
}>();

const rawBitmaskInput = ref(String(defineDecimalProps.modelValue));

const parsedInput = computed(() => parseBitmaskInput(rawBitmaskInput.value));

const normalizedDecimal = computed(() => {
  if (parsedInput.value.kind === "invalid") {
    return toInteger(defineDecimalProps.modelValue);
  }

  return parsedInput.value.value;
});

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement | null;
  rawBitmaskInput.value = target?.value ?? "";
  const parsedValue = parseBitmaskInput(rawBitmaskInput.value);

  if (parsedValue.kind === "invalid") {
    return;
  }

  emit("update:modelValue", parsedValue.value);
}

function flagIsActive(flagValue: number): boolean {
  return isFlagActive(normalizedDecimal.value, flagValue);
}
</script>

<template>
  <section
    class="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm ring-1 ring-slate-900/5 backdrop-blur"
  >
    <header class="mb-3">
      <h2 class="text-base font-semibold text-slate-900">Decimal/binary => flags</h2>
    </header>

    <label for="decimal-input" class="mb-1.5 block text-xs font-medium text-slate-700">
      Enter decimal or binary number
    </label>
    <input
      id="decimal-input"
      type="text"
      inputmode="numeric"
      :value="rawBitmaskInput"
      class="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
      placeholder="10, 0b1010, or 1010"
      @input="onInput"
    />

    <p
      v-if="parsedInput.kind === 'invalid'"
      class="mt-1 text-xs text-rose-600"
      role="status"
      aria-live="polite"
    >
      Enter a valid decimal integer or binary value like 1010 or 0b1010.
    </p>

    <div class="mt-3 rounded-xl bg-slate-50 p-3">
      <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
        Active statuses for decimal {{ normalizedDecimal }}
      </p>

      <ul
        v-if="defineDecimalProps.statuses.length > 0"
        class="mt-2 max-h-56 space-y-1.5 overflow-y-auto pr-1"
      >
        <li
          v-for="status in defineDecimalProps.statuses"
          :key="status.name"
          class="flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs"
          :class="
            flagIsActive(status.value)
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 bg-white text-slate-600'
          "
        >
          <span class="font-medium">{{ status.name }}</span>
          <span class="font-mono">{{ status.value }}</span>
        </li>
      </ul>
      <p v-else class="mt-2 text-xs text-slate-500">
        Parse a valid dictionary to see status matches.
      </p>
    </div>
  </section>
</template>
