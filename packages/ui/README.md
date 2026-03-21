# `@repo/ui`

Shared React components for Biblia Studio apps.

**UI approach:** Prefer composing **lifeless** (hooks/logic), **skinless** or **headless** (accessible structure), and **boneless** (tokens / utility styling) as described in [`docs/04-ui-philosophy.md`](../../docs/04-ui-philosophy.md), based on [Adam Argyle’s article](https://nerdy.dev/headless-boneless-and-skinless-ui).

## Storybook & tests

- **Storybook:** `bun run storybook` (port **6006**) — component catalog with [`@storybook/addon-docs`](https://storybook.js.org/docs/writing-docs/doc-blocks).
- **Vitest:** `bun run test` — uses `jsdom` + Testing Library for components (`src/*.test.tsx`).
- **Static build:** `bun run build-storybook` → `storybook-static/` (gitignored).
