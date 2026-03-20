# Contributing to Biblia Studio

## Quick start

```sh
bun install
bun run lint
bun run check-types
bun run build
```

See [`README.md`](./README.md) and [`AGENTS.md`](./AGENTS.md) (for AI-assisted work).

## Issues & PRs

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

## Architecture notes

- [`docs/02-package-map.md`](./docs/02-package-map.md) — packages
- [`docs/05-hexagonal-apps.md`](./docs/05-hexagonal-apps.md) — apps
- [`docs/adr/README.md`](./docs/adr/README.md) — when to record major decisions
