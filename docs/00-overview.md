# Overview

**Biblia Studio** is a [Bun](https://bun.sh/) + [Turborepo](https://turborepo.dev/) monorepo for **libraries and tools** used to build Bible software: **editing**, **translation**, **project management**, **study**, and **publishing**.

## Principles

A concise **digest** for day-to-day work (including agents) lives in [**Principles**](./PRINCIPLES.md); the bullets below expand the same themes.

- **Interoperable resources** — We align with [unfoldingWord](https://www.unfoldingword.org/) and [Door43](https://door43.org/) conventions (e.g. [Resource Container](https://resource-container.readthedocs.io/), USFM scripture, translation helps) so tools can share data and workflows. Where relevant we also align with **[FIA](https://fia.bible/about)** (Familiarize, Internalize, Articulate) as a **community translation** resource model — book context, glossary, media, and a structured passage process for oral-preference teams — without conflating it with DCS or RC specs ([ecosystem references](./01-ecosystem-references.md)).
- **Docs-first** — Implementation follows clearly versioned specs and guides. Our [ecosystem references](./01-ecosystem-references.md) point to the canonical upstream documentation; this repo adds **Biblia Studio–specific** architecture, package boundaries, and implementation notes.
- **Small, composable packages** — Domain logic lives in scoped `@biblia-studio/*` packages. Apps (`apps/*`) compose those packages; shared UI and lint/tsconfig remain under `@repo/*` from the Turborepo starter until we choose to rename them.
- **Layered UI** — We favor composing **lifeless** (logic/hooks), **skinless** or **headless** (accessible structure/behavior), and **boneless** (design tokens / utility styling) per [Argyle’s model](https://nerdy.dev/headless-boneless-and-skinless-ui). See [UI philosophy](./04-ui-philosophy.md).
- **Hexagonal apps** — `apps/*` use **ports and adapters**: use cases and domain at the center; Next.js/React and Door43 as **adapters**. See [Hexagonal architecture](./05-hexagonal-apps.md) ([Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)).
- **AI-led development** — Coding agents follow [`AGENTS.md`](../AGENTS.md); humans review for product, security, and architecture. See [AI & human workflow](./06-ai-and-human-workflow.md).

## Repository layout

| Area                 | Path                                                   | Role                                                                                   |
| -------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Documentation        | `docs/`                                                | Product and technical docs maintained in this repo                                     |
| Bible-tool libraries | `packages/*`                                           | `@biblia-studio/*` packages (see [package map](./02-package-map.md))                   |
| Applications         | `apps/*`                                               | Next.js (or future) apps; [hexagonal](./05-hexagonal-apps.md) composition at the edges |
| Shared config        | `packages/eslint-config`, `packages/typescript-config` | Lint and TS bases for the whole workspace                                              |

## What this repo is not (yet)

Upstream collab docs describe **formats, APIs, and migration** across the Door43 ecosystem. Biblia Studio **does not replace** that material — it **extends** it with our monorepo structure, TypeScript APIs, and tool-specific design. See [Extending upstream docs](./03-extending-upstream-docs.md).
