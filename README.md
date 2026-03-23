# Biblia Studio

**Biblia Studio** is a [Bun](https://bun.sh/) + [Turborepo](https://turborepo.dev/) monorepo for **shared libraries and multiple applications** that power Bible tools: **editing**, **translation**, **project management**, **study**, and **publishing** — not a single app, but a family of products reusing the same packages. We align with the [unfoldingWord](https://www.unfoldingword.org/) / [Door43](https://door43.org/) ecosystem (resource formats, APIs, and translation helps) and may integrate **[FIA](https://fia.bible/about)**-style translation prep and study flows where product goals call for it ([ecosystem references](./docs/01-ecosystem-references.md)).

Development is **AI-agent led** with **human review** — read [`docs/PRINCIPLES.md`](./docs/PRINCIPLES.md) (digest), then [`AGENTS.md`](./AGENTS.md) and [`docs/06-ai-and-human-workflow.md`](./docs/06-ai-and-human-workflow.md). **CI** runs on every PR ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)); enable [**branch protection**](./docs/09-ci-and-branch-protection.md) on `main` to require green checks. Contributors: see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Documentation in this repo

| Resource                                                                                 | Description                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[`docs/PRINCIPLES.md`](./docs/PRINCIPLES.md)**                                         | One-page architecture & engineering digest (for humans and agents)                                                                                                                                                                                |
| **[`docs/README.md`](./docs/README.md)**                                                 | Index of internal technical docs                                                                                                                                                                                                                  |
| **[`docs/00-overview.md`](./docs/00-overview.md)**                                       | Mission, principles, layout                                                                                                                                                                                                                       |
| **[`docs/01-ecosystem-references.md`](./docs/01-ecosystem-references.md)**               | Upstream canonical docs ([uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab), [docs.page](https://docs.page/unfoldingWord/uW-Tools-Collab), [Door43 Swagger](https://git.door43.org/api/swagger), [FIA](https://fia.bible/about)) |
| **[`docs/02-package-map.md`](./docs/02-package-map.md)**                                 | `@biblia-studio/*` package boundaries                                                                                                                                                                                                             |
| **[`docs/03-extending-upstream-docs.md`](./docs/03-extending-upstream-docs.md)**         | How we extend (not replace) collab documentation                                                                                                                                                                                                  |
| **[`docs/04-ui-philosophy.md`](./docs/04-ui-philosophy.md)**                             | UI layers: [headless, boneless, skinless & lifeless](https://nerdy.dev/headless-boneless-and-skinless-ui) (Argyle / nerdy.dev)                                                                                                                    |
| **[`docs/05-hexagonal-apps.md`](./docs/05-hexagonal-apps.md)**                           | Apps use [hexagonal architecture](https://alistair.cockburn.us/hexagonal-architecture/) (ports & adapters)                                                                                                                                        |
| **[`docs/06-ai-and-human-workflow.md`](./docs/06-ai-and-human-workflow.md)**             | AI agents + human review — roles, checklists, future CI/ADRs                                                                                                                                                                                      |
| **[`AGENTS.md`](./AGENTS.md)**                                                           | Short rules for coding agents (read this first in agent sessions)                                                                                                                                                                                 |
| **[`docs/07-github-mcp.md`](./docs/07-github-mcp.md)**                                   | GitHub MCP for Cursor ([`.cursor/mcp.json`](./.cursor/mcp.json) + `GITHUB_MCP_PAT`)                                                                                                                                                               |
| **[`docs/08-github-agent-workflow.md`](./docs/08-github-agent-workflow.md)**             | Issue → branch → PR via MCP; humans merge                                                                                                                                                                                                         |
| **[`docs/09-ci-and-branch-protection.md`](./docs/09-ci-and-branch-protection.md)**       | CI job list + branch protection setup                                                                                                                                                                                                             |
| **[`CONTRIBUTING.md`](./CONTRIBUTING.md)**                                               | Clone, checks, issues/PRs, ADRs                                                                                                                                                                                                                   |
| **[`docs/adr/README.md`](./docs/adr/README.md)**                                         | Architecture Decision Records (add when needed)                                                                                                                                                                                                   |
| **[`docs/10-first-project.md`](./docs/10-first-project.md)**                             | Checklist before planning the first substantive project                                                                                                                                                                                           |
| **[`docs/11-new-project-workflow.md`](./docs/11-new-project-workflow.md)**               | Human + agent workflow; discover package boundaries and modularity                                                                                                                                                                                |
| **[`docs/12-workflow-automation.md`](./docs/12-workflow-automation.md)**                 | Automate prompts: `/new-initiative`, GitHub Actions comments                                                                                                                                                                                      |
| **[`docs/13-milestones-and-scope.md`](./docs/13-milestones-and-scope.md)**               | Milestones, **Alignment** summaries, scope drift & escalation                                                                                                                                                                                     |
| **[`docs/14-github-bootstrap.md`](./docs/14-github-bootstrap.md)**                       | Labels, branch protection notes, MCP token reminder                                                                                                                                                                                               |
| **[`docs/15-bible-editor-product-vision.md`](./docs/15-bible-editor-product-vision.md)** | One product line (among several): Bible editor vision — offline/online, Git + DCS                                                                                                                                                                 |
| **[`SECURITY.md`](./SECURITY.md)**                                                       | How to report security issues privately                                                                                                                                                                                                           |

Upstream **Door43 / unfoldingWord developer documentation** is maintained in **[unfoldingWord/uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab)**; Biblia Studio adds monorepo-specific architecture and implementation guides here.

## Workspace packages

### Bible-tool libraries (`@biblia-studio/*`)

| Package                                                | Role                         |
| ------------------------------------------------------ | ---------------------------- |
| [`@biblia-studio/core`](./packages/core)               | Shared primitives            |
| [`@biblia-studio/formats`](./packages/formats)         | Scripture & resource formats |
| [`@biblia-studio/door43`](./packages/door43)           | Door43 API integration       |
| [`@biblia-studio/editing`](./packages/editing)         | Translation editing          |
| [`@biblia-studio/translation`](./packages/translation) | Translation workflows        |
| [`@biblia-studio/project`](./packages/project)         | Project management           |
| [`@biblia-studio/study`](./packages/study)             | Study / helps composition    |
| [`@biblia-studio/publishing`](./packages/publishing)   | Publishing & validation      |

### Starter shared config (`@repo/*`)

[`@repo/ui`](./packages/ui), [`@repo/eslint-config`](./packages/eslint-config), [`@repo/typescript-config`](./packages/typescript-config) — from the Turborepo template; apps under `apps/*` consume these. Shared UI should follow [`docs/04-ui-philosophy.md`](./docs/04-ui-philosophy.md).

## Apps

- **`apps/web`** — primary web shell (Next.js)
- **`apps/docs`** — secondary Next app (rename or repurpose as needed)

Both follow **[hexagonal architecture](https://alistair.cockburn.us/hexagonal-architecture/)** — see [`docs/05-hexagonal-apps.md`](./docs/05-hexagonal-apps.md) for ports/adapters, how UI and `@biblia-studio/*` fit, and a suggested folder layout.

## Commands

```sh
bun install          # runs lefthook install (git hooks) via prepare
bun run dev          # all apps with a dev script
bun run build
bun run lint
bun run check-types
bun run test
bun run docs:api     # TypeDoc HTML → docs/api (gitignored; see typedoc.json)
```

**Storybook** (`@repo/ui`): `cd packages/ui && bun run storybook` — port **6006**. **Dev container:** [`.devcontainer/devcontainer.json`](./.devcontainer/devcontainer.json). Copy [`.env.example`](./.env.example) for local env var names (never commit secrets).

Filtered examples:

```sh
bunx turbo dev --filter=web
bunx turbo lint --filter=@biblia-studio/formats
```

## Turborepo reference

- [Running tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Remote caching](https://turborepo.dev/docs/core-concepts/remote-caching) — optional: `bunx turbo login` / `bunx turbo link`; set `TURBO_TOKEN` / `TURBO_TEAM` if your org uses Vercel Remote Cache (see [`.env.example`](./.env.example))
