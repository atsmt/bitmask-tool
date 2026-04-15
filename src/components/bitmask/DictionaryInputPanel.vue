<script setup lang="ts">
const defineDictionaryProps = defineProps<{
  modelValue: string;
  parseError: string | null;
  parsedCount: number;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

function onInput(event: Event): void {
  const target = event.target as HTMLTextAreaElement | null;
  emit("update:modelValue", target?.value ?? "");
}
</script>

<template>
  <section
    class="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm ring-1 ring-slate-900/5 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:ring-slate-100/10"
  >
    <header class="mb-3 flex items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Paste status dictionary</h2>
      </div>
      <span
        class="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-200"
      >
        {{ defineDictionaryProps.parsedCount }} parsed
      </span>
    </header>

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
      Dictionary parsed successfully.
    </p>
  </section>
</template>
