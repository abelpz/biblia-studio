# AI agents and human review

Biblia Studio is built primarily by **AI coding agents**, with **humans** as **guides**—direction, priorities, and review. Agents are expected to **run** delivery they can automate (git, checks, GitHub MCP) instead of handing the human a todo list unless the human asked for instructions only. Merge and other **irreversible** steps follow [`AGENTS.md` § GitHub delivery](../AGENTS.md#github-delivery). This doc aligns expectations and reduces repeated mistakes.

## Roles

| Role                 | Responsibility                                                                                                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Agent**            | Implement scoped tasks; follow [`AGENTS.md`](../AGENTS.md) and architecture docs; run checks; execute git/GitHub steps when appropriate; **ask** before scope expansion, merge, or destructive actions unless the thread already said to proceed. |
| **Human (guide)**    | Set direction and boundaries; review product fit, security, architecture, dependencies, a11y; answer **should I proceed?** when agents hit decision points. Not the default “runner” for mechanical steps agents can do.                          |
| **Human maintainer** | Own roadmap, credentials, releases, and escalation when agents hit policy limits.                                                                                                                                                                 |

## What agents must do

1. **Read the doc stack** listed in [`AGENTS.md`](../AGENTS.md) before large or cross-cutting work.
2. **Keep diffs focused** — one coherent change per session/task; avoid opportunistic cleanup.
3. **Respect package boundaries** — see [Package map](./02-package-map.md).
4. **Hexagonal apps** — core/use cases do not import Next.js or `fetch` directly; see [Hexagonal apps](./05-hexagonal-apps.md).
5. **Run verification** — at minimum `bun run lint` and `bun run check-types`; `bun run build` when build-affecting paths change.
6. **Surface uncertainty** — explicit questions for humans when requirements conflict with docs or common sense.
7. **Close out each step** — Before pausing or moving on, run the [**closure checklist** in `AGENTS.md`](../AGENTS.md#after-each-step-closure-checklist): update package map, READMEs, workflow docs, PR/issue links, and ADRs that the step touched — not only code.
8. **Stay aligned with milestones** — Restate issue + milestone; add an **Alignment** block (on track / at risk); **escalate** on scope drift per [Milestones & scope](./13-milestones-and-scope.md).
9. **Close substantive replies with Done / Next / Suggest** — per [`AGENTS.md` § Human partnership](../AGENTS.md#human-partnership-reports-and-ownership).

## What human reviewers (guide) should verify

- [ ] **Security** — No secrets in repo; env vars only; safe handling of auth tokens and user content.
- [ ] **Data & scripture integrity** — Parsing, merging, or publishing paths do not silently corrupt or drop content; edge cases called out.
- [ ] **Architecture** — UI/routes as driving adapters; Door43/format code behind ports or in `@biblia-studio/*` as agreed.
- [ ] **UI philosophy** — Styling and primitives align with [UI philosophy](./04-ui-philosophy.md) unless the PR documents a deliberate exception.
- [ ] **Upstream alignment** — Door43 / RC / USFM behavior matches cited specs or issues are filed for intentional divergence.
- [ ] **Dependencies** — New packages justified; license compatible; supply-chain risk acceptable.
- [ ] **Tests & docs** — Meaningful behavior changes include tests and/or doc updates (README, `docs/`, or package README).
- [ ] **Milestone fit** — Issue still matches milestone / acceptance criteria; agent called out drift or **Alignment** if scope moved ([Milestones & scope](./13-milestones-and-scope.md)).
- [ ] **Accessibility** — Interactive UI: keyboard, labels, focus; no “click-only” critical paths without reviewer sign-off.

## Repo automation & templates

| Artifact                                                                                                                                                              | Status                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **CI** ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml))                                                                                                    | **Done** — `lint`, `check-types`, `build` on PRs and `main`. See [CI & branch protection](./09-ci-and-branch-protection.md). |
| **Issue templates** ([`.github/ISSUE_TEMPLATE/`](../.github/ISSUE_TEMPLATE/))                                                                                         | **Done** — Agent task + Human decision forms.                                                                                |
| **`CONTRIBUTING.md`** ([root](../CONTRIBUTING.md))                                                                                                                    | **Done** — Short contributor entry point.                                                                                    |
| **`docs/adr/README.md`** ([ADR guide](./adr/README.md))                                                                                                               | **Done** — Convention for future decision records (add `0001-…md` when needed).                                              |
| **`CODEOWNERS`** ([`.github/CODEOWNERS`](../.github/CODEOWNERS))                                                                                                      | **Done** — Review routing (`@abelpz`; expand when the team grows).                                                           |
| **`SECURITY.md`** ([root](../SECURITY.md))                                                                                                                            | **Done** — Vulnerability reporting (advisory / private contact).                                                             |
| **GitHub labels** (`agent`, `needs-triage`)                                                                                                                           | **Done** on `abelpz/biblia-studio` via `gh label create`.                                                                    |
| **Initiative automation** ([`initiative-automation.yml`](../.github/workflows/initiative-automation.yml), [`/new-initiative`](../.cursor/commands/new-initiative.md)) | **Done** — see [Workflow automation](./12-workflow-automation.md).                                                           |

### Optional GitHub settings

| Artifact                                            | Notes                                                                                                                        |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Require a pull request before merging to `main`** | Not required by current rules — [turn on](./09-ci-and-branch-protection.md) if you want to disallow direct pushes to `main`. |

**Branch protection** (required passing **`checks`** on `main`, strict) is **enabled** on `abelpz/biblia-studio`; see [CI & branch protection](./09-ci-and-branch-protection.md).

## Communication norms

- Agents: end every **substantive** message with **Done** / **Next** / **Suggest** (few-word recommended next step the human can approve with “yes, do that”) per [`AGENTS.md` § Human partnership](../AGENTS.md#human-partnership-reports-and-ownership). In the body, include **what changed** (including **docs and config**), **commands run**, and **risks / follow-ups**. If a [closure checklist](../AGENTS.md#after-each-step-closure-checklist) row was N/A, say so briefly.
- Humans: prefer **concrete** change requests (file + intent) over generic “make it better.”

## Related

- [`AGENTS.md`](../AGENTS.md) — concise agent rules
- [GitHub agent workflow](./08-github-agent-workflow.md) — issue-driven PR flow with GitHub MCP
- [New project workflow](./11-new-project-workflow.md) — human + agent joint discovery; modular packages emerge
- [Workflow automation](./12-workflow-automation.md) — `/new-initiative` + GitHub reminder workflow
- [Milestones & scope](./13-milestones-and-scope.md) — drift signals, escalation, Alignment summaries
- [Extending upstream docs](./03-extending-upstream-docs.md) — what we document vs link
