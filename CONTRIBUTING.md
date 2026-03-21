# Contributing to Biblia Studio

## Quick start

```sh
bun install
bun run lint
bun run check-types
bun run test
bun run build
```

See [`README.md`](./README.md) and [`AGENTS.md`](./AGENTS.md) (for AI-assisted work).

## Editor (VS Code / Cursor)

- **[`.editorconfig`](./.editorconfig)** — charset, indentation, trailing whitespace.
- **[`.vscode/extensions.json`](./.vscode/extensions.json)** — recommended: ESLint, Prettier, EditorConfig (install when prompted).
- **[`.vscode/settings.json`](./.vscode/settings.json)** — format on save, workspace TypeScript, ESLint fix on save.
- **[Lefthook](https://lefthook.dev/)** — [`lefthook.yml`](./lefthook.yml) runs **lint-staged** (Prettier) on pre-commit; `bun install` runs `lefthook install` via the `prepare` script.

## Principles (humans + agents)

Read **[`docs/PRINCIPLES.md`](./docs/PRINCIPLES.md)** first for a one-page view of architecture and process; **[`AGENTS.md`](./AGENTS.md)** is the full agent contract. Some tools also read **[`CLAUDE.md`](./CLAUDE.md)** at the repo root.

## Issues & PRs

- **New initiative:** Use [`docs/11-new-project-workflow.md`](./docs/11-new-project-workflow.md) — human and agent discover scope together; **package boundaries emerge**—update [`docs/02-package-map.md`](./docs/02-package-map.md) when stable. **Automate prompts:** [`/new-initiative`](./.cursor/commands/new-initiative.md) in Cursor; [GitHub Actions](.github/workflows/initiative-automation.yml) — see [`docs/12-workflow-automation.md`](./docs/12-workflow-automation.md).
- **Agent work:** [Agent task issue template](.github/ISSUE_TEMPLATE/agent-task.yml) — goal, acceptance criteria, out of scope.
- **Decisions:** [Human decision template](.github/ISSUE_TEMPLATE/human-decision.yml).
- **PRs:** Follow [`docs/08-github-agent-workflow.md`](./docs/08-github-agent-workflow.md) — link issues with `Closes #NN`, keep drafts until checks pass.

## CI

Every PR runs **lint, typecheck, and build** ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)). Branch protection should require this check on `main` — see [`docs/09-ci-and-branch-protection.md`](./docs/09-ci-and-branch-protection.md).

## Security

See [`SECURITY.md`](./SECURITY.md) — report vulnerabilities privately (Security Advisories or maintainer contact), not via public issues.

## Code review routing

[`.github/CODEOWNERS`](./.github/CODEOWNERS) requests reviews from `@abelpz` on touched paths; update when you add maintainers.

## Labels

The repo uses **`agent`** and **`needs-triage`** for the [agent workflow](./docs/08-github-agent-workflow.md). They can be created with:

```sh
gh label create agent --color 0E8A16 --description "Work suitable for an AI coding agent" --repo abelpz/biblia-studio
gh label create needs-triage --color FBCA04 --description "Human should refine scope before an agent starts" --repo abelpz/biblia-studio
```

(Already applied on the canonical repo; reuse when forking.)

## First feature

Read [`docs/10-first-project.md`](./docs/10-first-project.md) before planning the first substantive piece of work.

## DX tooling (in repo)

| Tool                           | Notes                                                                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vitest**                     | `bun run test` (via Turborepo); per-package `vitest.config.ts` in `packages/*`                                                                |
| **Lefthook** + **lint-staged** | Pre-commit: Prettier on staged files; `bun install` runs `lefthook install`                                                                   |
| **Dependabot**                 | [`.github/dependabot.yml`](./.github/dependabot.yml) — weekly Bun deps, grouped devDependencies                                               |
| **TypeDoc**                    | `bun run docs:api` → `docs/api/` (gitignored); uses [`tsconfig.typedoc.json`](./tsconfig.typedoc.json) for `@biblia-studio/*` path resolution |
| **Storybook**                  | `packages/ui`: `bun run storybook` / `bun run build-storybook`; output `storybook-static/` (gitignored)                                       |
| **CodeQL**                     | [`.github/workflows/codeql.yml`](./.github/workflows/codeql.yml)                                                                              |
| **Devcontainer**               | [`.devcontainer/devcontainer.json`](./.devcontainer/devcontainer.json) — Bun image                                                            |
| **GitHub bootstrap**           | [`docs/14-github-bootstrap.md`](./docs/14-github-bootstrap.md) — labels, MCP token, branch protection notes                                   |

## Architecture notes

- [`docs/02-package-map.md`](./docs/02-package-map.md) — packages
- [`docs/05-hexagonal-apps.md`](./docs/05-hexagonal-apps.md) — apps
- [`docs/adr/README.md`](./docs/adr/README.md) — when to record major decisions
