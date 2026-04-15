# Repository Summary: bitmask-tool

## Purpose

`bitmask-tool` is a compact Astro + Vue developer utility for two-way bitmask calculations.

It allows users to:

1. Paste a status dictionary (JSON or JS object-like format)
2. Convert decimal/binary values to active status flags
3. Convert selected flags back to decimal and binary outputs

## Stack

- Bun (package manager + scripts)
- Astro 6
- Vue 3 (`script setup` + TypeScript)
- Tailwind CSS v4
- Cloudflare adapter (`@astrojs/cloudflare`) + Wrangler

## Runtime Behavior

- Dictionary parsing is done without `eval` in `src/lib/bitmask/parser.ts`
- Bitwise logic lives in `src/lib/bitmask/math.ts`
- Persistent storage keys:
  - `bitmask_dict` (dictionary input)
  - `bitmask_theme` (theme preference)
- Dark mode is class-based and initialized before hydration to avoid theme flash

## Directory Structure

```text
.github/
  copilot-instructions.md
  use-bun-instead-of-node-vite-npm-pnpm.md
.llm/
  repository-summary.md
public/
  favicon.ico
  favicon.svg
  llms.txt
  robots.txt
src/
  components/
    BitmaskStatusCalculator.vue
    bitmask/
      DictionaryInputPanel.vue
      DecimalToFlagsPanel.vue
      FlagsToDecimalPanel.vue
  lib/
    bitmask/
      math.ts
      parser.ts
      storage.ts
      types.ts
  pages/
    index.astro
  styles/
    global.css
astro.config.mjs
package.json
tailwind.config.mjs
wrangler.jsonc
README.md
```

## Key Files

- `src/components/BitmaskStatusCalculator.vue`
  - Main composition layer
  - Theme toggle + persistence
  - Routes parsed dictionary state into both converter panels

- `src/components/bitmask/DictionaryInputPanel.vue`
  - Dictionary text input and parse feedback

- `src/components/bitmask/DecimalToFlagsPanel.vue`
  - Accepts decimal or binary input
  - Displays active flags

- `src/components/bitmask/FlagsToDecimalPanel.vue`
  - Checkbox-based flag selection
  - Displays resulting decimal and binary

- `src/lib/bitmask/parser.ts`
  - Safe regex-based key/value parsing from dictionary input

- `src/lib/bitmask/math.ts`
  - Integer normalization
  - Bitwise active-check logic
  - Flag aggregation helpers

## Development Commands

- Install dependencies: `bun install`
- Start dev server: `bun run dev`
- Build production bundle: `bun run build`
- Preview worker build: `bun run preview`
- Generate Cloudflare types: `bun run generate-types`
- Deploy: `bun run deploy`

## Deployment

- Adapter: `@astrojs/cloudflare`
- Wrangler entrypoint: `@astrojs/cloudflare/entrypoints/server`
- Built assets directory: `dist/`
