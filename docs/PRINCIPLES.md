# Principles — architecture & engineering (digest)

**One page for humans and agents.** Deep dives are linked; keep this list in mind before every non-trivial change.

## Product & ecosystem

| Principle                         | Detail                                                                                                                                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Multi-product monorepo**        | **Several** end-user products can live under `apps/*`; they **share** `@biblia-studio/*` packages. Product-specific vision docs (e.g. [Bible editor vision](./15-bible-editor-product-vision.md)) describe one line at a time. |
| **Interoperable scripture stack** | Align with Door43 / unfoldingWord resources and APIs; cite upstream, don’t fork spec prose. Treat **[FIA](https://fia.bible/about)** as a complementary **translation/study** reference (not an RC/DCS spec).                  |
| **Docs-first**                    | Behavior should trace to `docs/` or [uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab) — see [ecosystem references](./01-ecosystem-references.md).                                                            |
| **Data & scripture integrity**    | No silent loss or mis-association of verse/content; call out edge cases in PRs.                                                                                                                                                |

## Structure & code placement

| Principle            | Detail                                                                                                                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Packages vs apps** | [`@biblia-studio/*`](./02-package-map.md) = shared domain & infrastructure; [`apps/*`](./05-hexagonal-apps.md) = composition, UI shell, wiring. Boundaries **emerge** over time — update the package map when stable ([new initiative workflow](./11-new-project-workflow.md)). |
| **Hexagonal apps**   | Use cases and domain at the center; Next/React and Door43 as **adapters** — [ports & adapters](./05-hexagonal-apps.md).                                                                                                                                                         |
| **UI layers**        | Prefer **lifeless** (hooks/logic) → **skinless/headless** (accessible structure) → **boneless** (tokens/styles) — [UI philosophy](./04-ui-philosophy.md).                                                                                                                       |

## Process & safety

| Principle         | Detail                                                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Small diffs**   | One coherent change; no drive-by refactors — [AGENTS.md](../AGENTS.md).                                                                                                   |
| **CI is the bar** | Same checks locally as [CI workflow](../.github/workflows/ci.yml): `lint`, `check-types`, `test`, `build`.                                                                |
| **Secrets**       | Never commit tokens; env vars only — [GitHub MCP](./07-github-mcp.md), [security](../SECURITY.md).                                                                        |
| **Human + agent** | Humans approve boundaries and merge; agents follow [workflow automation](./12-workflow-automation.md) (`/new-initiative`, issue/PR reminders).                            |
| **Step closure**  | After **each** step: update every doc, README, issue/PR, and ADR that step invalidated — [AGENTS.md](../AGENTS.md#after-each-step-closure-checklist).                     |
| **Milestones**    | Issues tie to a **milestone** when part of the roadmap; agents give **Alignment** updates and **escalate** on drift — [milestones & scope](./13-milestones-and-scope.md). |

## When to add an ADR

Irreversible or costly-to-change decisions (auth, sync, storage model) — [ADR guide](./adr/README.md).

## Related index

- [Overview](./00-overview.md) · [Bible editor product vision](./15-bible-editor-product-vision.md) · [Translation helps](./17-translation-helps-and-resources.md) · [Package map](./02-package-map.md) · [Hexagonal apps](./05-hexagonal-apps.md) · [UI philosophy](./04-ui-philosophy.md) · [Milestones & scope](./13-milestones-and-scope.md) · [AGENTS.md](../AGENTS.md)
