# Package map

Workspace packages under `@biblia-studio/*` are **intentionally bounded** by concern. They may depend on each other acyclically (e.g. higher-level tools depend on `formats` and `door43`, not the reverse). **Multiple** `apps/*` products are expected to **reuse** the same packages so we do not fork domain logic per app.

**Evolving boundaries:** When starting new work, you do not need the final package split on day one. Follow [New project / initiative workflow](./11-new-project-workflow.md) and **update this document** when responsibilities shift or new packages are promoted from apps.

**Apps** (`apps/*`) compose use cases with **ports and adapters** ([hexagonal architecture](./05-hexagonal-apps.md)); `@biblia-studio/*` packages often supply **driven-side** building blocks (e.g. Door43) that adapters implement behind a port.

**`apps/web`** — `src/ports` holds driven **port** types (e.g. public Door43 repo search); `src/adapters/driven` implements them by calling `@biblia-studio/door43`. Route modules under `app/` stay thin and call those adapters.

## Foundation

| Package                  | Folder             | Responsibility                                                                                                                                                                                                                                  |
| ------------------------ | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@biblia-studio/core`    | `packages/core`    | Shared types, constants, and cross-cutting helpers that are not format- or API-specific.                                                                                                                                                        |
| `@biblia-studio/formats` | `packages/formats` | Scripture and resource **formats**: USFM/USX boundaries, Resource Container metadata, alignment with [collab format guides](https://github.com/unfoldingWord/uW-Tools-Collab/tree/main/docs).                                                   |
| `@biblia-studio/door43`  | `packages/door43`  | **Door43 integration**: HTTP client shapes, auth/session assumptions, repository discovery — guided by the [Door43 API developer material](https://github.com/unfoldingWord/uW-Tools-Collab) and [Swagger](https://git.door43.org/api/swagger). |

## Bible-tool domains

| Package                      | Folder                 | Responsibility                                                                                                                                                                                                                                            |
| ---------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@biblia-studio/editing`     | `packages/editing`     | Translation **editing** UX primitives: buffers, validation hooks, merge/conflict-oriented types (consumes `formats`, may use `door43`).                                                                                                                   |
| `@biblia-studio/translation` | `packages/translation` | **Translation** workflow concepts: checks, progress, roles, handoffs — without owning full UI.                                                                                                                                                            |
| `@biblia-studio/project`     | `packages/project`     | **Project management**: organizations, repositories, milestones, assignments — orchestration over `door43` and metadata.                                                                                                                                  |
| `@biblia-studio/study`       | `packages/study`       | **Study** tools: scripture + helps composition (notes, words, questions, academy links) using `formats`. May compose UX aligned with **[FIA](https://fia.bible/about)** where product requires it ([ecosystem references](./01-ecosystem-references.md)). |
| `@biblia-studio/publishing`  | `packages/publishing`  | **Publishing** pipelines: validation packs, export targets, readiness checks.                                                                                                                                                                             |

## Shared Turborepo utilities (starter)

| Package                                           | Role                                                                                                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@repo/ui`                                        | Shared React components for apps; follows [UI philosophy](./04-ui-philosophy.md) ([Argyle](https://nerdy.dev/headless-boneless-and-skinless-ui)). |
| `@repo/eslint-config` / `@repo/typescript-config` | Lint and TS configuration.                                                                                                                        |

## Dependency sketch

```mermaid
flowchart TB
  subgraph foundation
    core["@biblia-studio/core"]
    formats["@biblia-studio/formats"]
    door43["@biblia-studio/door43"]
  end
  editing["@biblia-studio/editing"]
  translation["@biblia-studio/translation"]
  project["@biblia-studio/project"]
  study["@biblia-studio/study"]
  publishing["@biblia-studio/publishing"]
  formats --> core
  door43 --> core
  editing --> formats
  editing --> door43
  translation --> formats
  translation --> door43
  project --> door43
  study --> formats
  publishing --> formats
  publishing --> door43
```

Exact imports will evolve; keep **foundation → domains** direction to avoid cycles.
