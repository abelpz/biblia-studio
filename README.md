# Biblia Studio

**Biblia Studio** is a [Bun](https://bun.sh/) + [Turborepo](https://turborepo.dev/) monorepo for **libraries and applications** that power Bible tools: **editing**, **translation**, **project management**, **study**, and **publishing**. We align with the [unfoldingWord](https://www.unfoldingword.org/) / [Door43](https://door43.org/) ecosystem (resource formats, APIs, and translation helps).

Development is **AI-agent led** with **human review** — start from [`AGENTS.md`](./AGENTS.md) and [`docs/06-ai-and-human-workflow.md`](./docs/06-ai-and-human-workflow.md).

## Documentation in this repo

| Resource | Description |
| --- | --- |
| **[`docs/README.md`](./docs/README.md)** | Index of internal technical docs |
| **[`docs/00-overview.md`](./docs/00-overview.md)** | Mission, principles, layout |
| **[`docs/01-ecosystem-references.md`](./docs/01-ecosystem-references.md)** | Upstream canonical docs ([uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab), [docs.page](https://docs.page/unfoldingWord/uW-Tools-Collab), [Door43 Swagger](https://git.door43.org/api/swagger)) |
| **[`docs/02-package-map.md`](./docs/02-package-map.md)** | `@biblia-studio/*` package boundaries |
| **[`docs/03-extending-upstream-docs.md`](./docs/03-extending-upstream-docs.md)** | How we extend (not replace) collab documentation |
| **[`docs/04-ui-philosophy.md`](./docs/04-ui-philosophy.md)** | UI layers: [headless, boneless, skinless & lifeless](https://nerdy.dev/headless-boneless-and-skinless-ui) (Argyle / nerdy.dev) |
| **[`docs/05-hexagonal-apps.md`](./docs/05-hexagonal-apps.md)** | Apps use [hexagonal architecture](https://alistair.cockburn.us/hexagonal-architecture/) (ports & adapters) |
| **[`docs/06-ai-and-human-workflow.md`](./docs/06-ai-and-human-workflow.md)** | AI agents + human review — roles, checklists, future CI/ADRs |
| **[`AGENTS.md`](./AGENTS.md)** | Short rules for coding agents (read this first in agent sessions) |

Upstream **Door43 / unfoldingWord developer documentation** is maintained in **[unfoldingWord/uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab)**; Biblia Studio adds monorepo-specific architecture and implementation guides here.

## Workspace packages

### Bible-tool libraries (`@biblia-studio/*`)

| Package | Role |
| --- | --- |
| [`@biblia-studio/core`](./packages/core) | Shared primitives |
| [`@biblia-studio/formats`](./packages/formats) | Scripture & resource formats |
| [`@biblia-studio/door43`](./packages/door43) | Door43 API integration |
| [`@biblia-studio/editing`](./packages/editing) | Translation editing |
| [`@biblia-studio/translation`](./packages/translation) | Translation workflows |
| [`@biblia-studio/project`](./packages/project) | Project management |
| [`@biblia-studio/study`](./packages/study) | Study / helps composition |
| [`@biblia-studio/publishing`](./packages/publishing) | Publishing & validation |

### Starter shared config (`@repo/*`)

[`@repo/ui`](./packages/ui), [`@repo/eslint-config`](./packages/eslint-config), [`@repo/typescript-config`](./packages/typescript-config) — from the Turborepo template; apps under `apps/*` consume these. Shared UI should follow [`docs/04-ui-philosophy.md`](./docs/04-ui-philosophy.md).

## Apps

- **`apps/web`** — primary web shell (Next.js)
- **`apps/docs`** — secondary Next app (rename or repurpose as needed)

Both follow **[hexagonal architecture](https://alistair.cockburn.us/hexagonal-architecture/)** — see [`docs/05-hexagonal-apps.md`](./docs/05-hexagonal-apps.md) for ports/adapters, how UI and `@biblia-studio/*` fit, and a suggested folder layout.

## Commands

```sh
bun install
bun run dev          # all apps with a dev script
bun run build
bun run lint
bun run check-types
```

Filtered examples:

```sh
bunx turbo dev --filter=web
bunx turbo lint --filter=@biblia-studio/formats
```

## Turborepo reference

- [Running tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Remote caching](https://turborepo.dev/docs/core-concepts/remote-caching) — optional: `bunx turbo login` / `bunx turbo link`
