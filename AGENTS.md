# Instructions for AI coding agents

Humans supervise and review all changes. Optimize for **small, reviewable diffs**, **traceable decisions**, and **safe handling of scripture-related and Door43-adjacent systems**.

## Read first

**Digest (start here for architecture):** [`docs/PRINCIPLES.md`](./docs/PRINCIPLES.md) — one page: stack, layering, process, links to deep docs.

1. **[`README.md`](./README.md)** — scope and commands
2. **[`docs/00-overview.md`](./docs/00-overview.md)** — principles
3. **[`docs/02-package-map.md`](./docs/02-package-map.md)** — where code belongs
4. **[`docs/04-ui-philosophy.md`](./docs/04-ui-philosophy.md)** — UI layers
5. **[`docs/05-hexagonal-apps.md`](./docs/05-hexagonal-apps.md)** — apps: ports & adapters
6. **[`docs/06-ai-and-human-workflow.md`](./docs/06-ai-and-human-workflow.md)** — review gates, security, dependencies
7. **[`docs/07-github-mcp.md`](./docs/07-github-mcp.md)** — GitHub MCP: set `GITHUB_MCP_PAT`, restart Cursor
8. **[`docs/08-github-agent-workflow.md`](./docs/08-github-agent-workflow.md)** — **default GitHub workflow** (issues → branch → push → PR via MCP); humans merge
9. **[`docs/10-first-project.md`](./docs/10-first-project.md)** — checklist before the first real feature (CI on GitHub, branch protection, labels)
10. **[`docs/11-new-project-workflow.md`](./docs/11-new-project-workflow.md)** — **human + agent** discovery; package boundaries and modularity **emerge**—update [`docs/02-package-map.md`](./docs/02-package-map.md) when seams stabilize
11. **[`docs/12-workflow-automation.md`](./docs/12-workflow-automation.md)** — **`/new-initiative`** in Cursor; GitHub bot comments on agent issues / PRs without `Closes #`; merged PR **head branches** are deleted via [`cleanup-merged-branch.yml`](./.github/workflows/cleanup-merged-branch.yml)
12. **[`docs/13-milestones-and-scope.md`](./docs/13-milestones-and-scope.md)** — milestones vs drift; **Alignment** summaries; when to escalate (desist, new issue, new milestone)
13. **[`docs/15-bible-editor-product-vision.md`](./docs/15-bible-editor-product-vision.md)** — north-star product: offline/online Bible editor, local Git + DCS sync, phased collaboration, reusable editor in multiple apps

For Door43 / unfoldingWord **formats and APIs**, link to upstream; do not copy large spec text — see [`docs/01-ecosystem-references.md`](./docs/01-ecosystem-references.md). For **[FIA](https://fia.bible/about)** (translation prep / study process), link the site; it is **not** an RC/DCS spec — keep storage behind adapters like any other content.

### GitHub delivery

When work is tracked on GitHub, follow **[`docs/08-github-agent-workflow.md`](./docs/08-github-agent-workflow.md)**: one issue per slice, branch `agent/<issue>-slug`, PR with `Closes #NN`, draft until verified, **do not merge** unless a human explicitly requests it for that task.

## Hard rules

- **Scope** — Change only what the task requires. No drive-by refactors or unrelated formatting.
- **Architecture** — `@biblia-studio/*` = shared domain and infrastructure building blocks. `apps/*` = composition, **hexagonal** wiring, UI. Do not put Door43 fetch logic or USFM parsing inside React leaves; use ports/adapters and packages.
- **UI** — Prefer lifeless → skinless/headless → boneless per [`docs/04-ui-philosophy.md`](./docs/04-ui-philosophy.md).
- **Secrets** — Never commit tokens, passwords, or private keys. Use env vars documented in README or package README; use placeholders in examples.
- **Upstream truth** — Specs for RC/USFM/Door43 live in [uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab) and linked docs; cite them when behavior is spec-driven.
- **Dependencies** — New runtime dependencies need a one-line justification in the PR/summary (security, size, maintenance). Prefer stdlib / existing stack unless clearly insufficient.
- **Tests** — Add or update tests when behavior is non-trivial or regression-prone; run the narrowest relevant check before finishing (`bun run check-types`, `bun run lint`, targeted test if present).

## After each step (closure checklist)

### What counts as a **step**?

A **step** is a **bounded slice** of work after which you might pause, report back, push, or switch context. Examples:

| Example                                                                      | Usually one step                                                    |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Implement one **subtask** or checkbox from an issue                          | Yes                                                                 |
| Complete one **phase** of a plan (e.g. “add types → add adapter → wire app”) | Each phase is a step                                                |
| One **commit-ready** unit (would look odd to split across commits)           | Often one step                                                      |
| “Drive-by” fix while doing something else                                    | **Not** a separate step — stay in the same step or open a new issue |

**Task** usually means the **whole** user request or GitHub issue (may span several steps). You run the **closure checklist after every step**, and the **`lint` / `check-types` / `build` block** before you consider the **whole task** done (or before you mark a PR ready for review).

### When is a step **finished**?

A step is **finished** only when **all** of the following are true:

1. **Intent met** — The slice does what you said it would (no half-done API or broken intermediate state unless agreed).
2. **Closure checklist** — Table below run; irrelevant rows called **N/A** in your summary.
3. **If you push or open/update a PR** — GitHub row satisfied (`Closes #`, body matches reality, draft → ready when checks pass).

**Do not stop** a step until you have updated **everything this step invalidated** — not only code.

Run through this list **before** you say the step is done:

| Checkpoint                    | Update if applicable                                                                                                                                                                                                                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Package boundaries**        | [`docs/02-package-map.md`](./docs/02-package-map.md) — new/renamed packages, moved responsibilities, or new dependencies between packages.                                                                                                                                                                                                        |
| **Public API or usage**       | Relevant `packages/*/README.md` or `apps/*/README.md` — exports, env vars, scripts, or how to run.                                                                                                                                                                                                                                                |
| **Workflow or automation**    | If issue/PR rules, CI, Cursor commands, or GitHub Actions changed: [`docs/08-github-agent-workflow.md`](./docs/08-github-agent-workflow.md), [`docs/09-ci-and-branch-protection.md`](./docs/09-ci-and-branch-protection.md), [`docs/12-workflow-automation.md`](./docs/12-workflow-automation.md), or [`.cursor/commands/`](./.cursor/commands/). |
| **Ecosystem or architecture** | If behavior ties to Door43, RC, USFM, or FIA: [`docs/01-ecosystem-references.md`](./docs/01-ecosystem-references.md) or the right doc in `docs/` — link upstream; keep [`docs/PRINCIPLES.md`](./docs/PRINCIPLES.md) consistent if you changed a stated rule.                                                                                      |
| **Irreversible decisions**    | New ADR under [`docs/adr/`](./docs/adr/README.md) when the change is hard to undo (auth, storage, sync contracts).                                                                                                                                                                                                                                |
| **GitHub delivery**           | PR body has **`Closes #NN`** (or equivalent) when it resolves an issue; issue/PR description matches what you actually shipped; draft → ready when checks are green per [`docs/08-github-agent-workflow.md`](./docs/08-github-agent-workflow.md).                                                                                                 |
| **Human visibility**          | Final summary lists **docs and config** updated, not only source files — so reviewers see the full surface area.                                                                                                                                                                                                                                  |

If a row does not apply, **say so explicitly** (e.g. “No package map change — boundaries unchanged.”).

## Milestones and scope (stay on track)

Full guide: [`docs/13-milestones-and-scope.md`](./docs/13-milestones-and-scope.md).

- **Anchor work** — Restate the issue goal and milestone (or say “none / ad-hoc”) when you start and when you hand off.
- **Alignment block** — After each step and in the final summary, include **Alignment**: issue goal, milestone, **on track: yes / at risk** (+ why if at risk).
- **Escalate instead of drifting** — If work no longer matches the issue, needs a new product bet, or blows up scope, **stop** and recommend: desist, narrow scope, new issue, new milestone, or new initiative—**do not** expand scope in silence.

## Before you finish a task

```sh
bun run lint
bun run check-types
bun run test
```

If you touched production build paths:

```sh
bun run build
```

**CI** runs the same steps on pull requests ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)): `lint`, `check-types`, `test`, `build`. PRs should pass before merge.

Report what you ran and any failures or skips.

## When to stop and leave notes for humans

- Ambiguous product or security tradeoff
- New third-party service or OAuth scope
- Breaking API or data migration
- Copying or mirroring large upstream documentation (link + short summary instead)
- **Milestone or scope drift** — work no longer matches the issue, acceptance criteria, or milestone; see [`docs/13-milestones-and-scope.md`](./docs/13-milestones-and-scope.md)

State open questions explicitly at the end of your summary so reviewers can decide quickly.
