---
description: Prefer Bun commands and Bun-managed scripts for this repository.
globs: "*.ts, *.tsx, *.astro, *.html, *.css, *.js, *.jsx, package.json, astro.config.mjs, wrangler.jsonc"
alwaysApply: false
---

Use Bun as the default package manager and script runner.

- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bun add <pkg>` and `bun add -d <pkg>` for dependency changes
- Use `bunx <tool>` for one-off CLI execution

## Repository-Specific Guidance

- Keep Astro + Vue + Tailwind architecture.
- Do not replace Astro/Vite pipeline with `Bun.serve()` in this project.
- Keep deployment flow aligned with Wrangler scripts in `package.json`.

## Common Commands

- `bun run dev`
- `bun run build`
- `bun run preview`
- `bun run deploy`

## Testing

If tests are added, prefer `bun test`.
