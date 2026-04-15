# Bitmask Tool - Copilot Instructions

## Critical Instruction: Context7

Always use Context7 when working with external libraries, framework APIs, setup steps, or configuration behavior.

## Project Overview

This repository is a focused developer utility application.

- App name: Bitmask Status Calculator
- Runtime/tooling: Bun
- Framework: Astro 6
- UI: Vue 3 (`<script setup lang="ts">`)
- Styling: Tailwind CSS v4
- Deployment target: Cloudflare (Astro Cloudflare adapter + Wrangler)

## Primary Product Goal

Provide a clean, fast utility that converts bitmasks in both directions:

1. Decimal/binary input -> active flags
2. Selected flags -> decimal and binary output

## Architecture Notes

- Page entry: `src/pages/index.astro`
- Main app shell: `src/components/BitmaskStatusCalculator.vue`
- Feature panels:
  - `src/components/bitmask/DictionaryInputPanel.vue`
  - `src/components/bitmask/DecimalToFlagsPanel.vue`
  - `src/components/bitmask/FlagsToDecimalPanel.vue`
- Domain logic:
  - Parsing: `src/lib/bitmask/parser.ts`
  - Bitwise/math: `src/lib/bitmask/math.ts`
  - Storage constants/helpers: `src/lib/bitmask/storage.ts`
  - Shared types: `src/lib/bitmask/types.ts`

## Critical Behavioral Constraints

- Dictionary parsing must remain safe: never use `eval` or dynamic code execution.
- Keep parser behavior robust for JSON and JS object-like input.
- Preserve two-way conversion correctness:
  - Flag active check: `(value & flag) === flag`
  - Flags aggregation: bitwise OR accumulation
- Preserve persisted local storage keys and behavior:
  - `bitmask_dict`
  - `bitmask_theme`
- Preserve dark mode no-flash behavior (pre-hydration theme class setup in `index.astro`).

## Editing Guidelines

- Make the smallest possible change for the request.
- Do not refactor unrelated files.
- Keep UI minimal, compact, and developer-friendly.
- Maintain accessibility and clear labels for inputs/toggles.
- Prefer readable TypeScript over clever abstractions.

## Commands

- Install: `bun install`
- Dev: `bun run dev`
- Build: `bun run build`
- Preview worker build: `bun run preview`
- Deploy: `bun run deploy`

## Deployment Notes

- Astro uses the Cloudflare adapter.
- Wrangler configuration is in `wrangler.jsonc`.
- Build artifacts are produced in `dist/`.
