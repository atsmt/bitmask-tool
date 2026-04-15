# Bitmask Status Calculator

A single-page developer utility for two-way bitmask conversions.

Built with Astro + Vue 3 + Tailwind CSS and deployed as static output (SSG).

## Features

- Parse status dictionaries from JSON or JS object-like input (no eval)
- Convert decimal or binary input to active flags
- Convert selected flags to decimal and binary output
- Persistent dictionary input via localStorage
- Light and dark mode toggle with persisted preference
- Responsive layout with compact, developer-focused UI

## Stack

- Astro
- Vue 3 (`script setup` + TypeScript)
- Tailwind CSS
- Bun

## Getting Started

1. Install dependencies:

```sh
bun install
```

2. Start development server:

```sh
bun run dev
```

3. Build production output:

```sh
bun run build
```

4. Preview production build locally:

```sh
bun run preview
```

## Dictionary Input Format

You can paste either:

- JSON:

```json
{
	"FileReceived": 1,
	"DataReceived": 2,
	"ThumbCreated": 4,
	"OcrDone": 8
}
```

- JS object style:

```js
const ReceiptStatus = {
	FileReceived: 1,
	DataReceived: 2,
	ThumbCreated: 4,
	OcrDone: 8
};
```

## Bitmask Input Rules (Mode 1)

Supported input examples:

- Decimal: `10`
- Binary with prefix: `0b1010`
- Binary without prefix: `1010`

## Deployment (Cloudflare Pages)

### Git-connected deploy (recommended)

Configure in Cloudflare Pages:

- Build command: `bun run build`
- Build output directory: `dist`

### CLI deploy (Wrangler)

```sh
bun add -d wrangler
bunx wrangler login
bunx wrangler pages project create bitmask-tool
bunx wrangler pages deploy dist --project-name bitmask-tool
```

## Project Structure

```text
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
public/
	robots.txt
```
