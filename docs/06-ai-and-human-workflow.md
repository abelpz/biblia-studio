# AI agents and human review

Biblia Studio is built primarily by **AI coding agents**, with **humans** responsible for direction, review, and merge decisions. This doc aligns expectations and reduces repeated mistakes.

## Roles

| Role                 | Responsibility                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Agent**            | Implement scoped tasks; follow [`AGENTS.md`](../AGENTS.md) and architecture docs; run checks; document assumptions.      |
| **Human reviewer**   | Validate product fit, security, architecture boundaries, dependency risk, and accessibility; approve or request changes. |
| **Human maintainer** | Own roadmap, credentials, releases, and escalation when agents hit policy limits.                                        |

## What agents must do

1. **Read the doc stack** listed in [`AGENTS.md`](../AGENTS.md) before large or cross-cutting work.
2. **Keep diffs focused** — one coherent change per session/task; avoid opportunistic cleanup.
3. **Respect package boundaries** — see [Package map](./02-package-map.md).
4. **Hexagonal apps** — core/use cases do not import Next.js or `fetch` directly; see [Hexagonal apps](./05-hexagonal-apps.md).
5. **Run verification** — at minimum `bun run lint` and `bun run check-types`; `bun run build` when build-affecting paths change.
6. **Surface uncertainty** — explicit questions for humans when requirements conflict with docs or common sense.

## What human reviewers should verify

- [ ] **Security** — No secrets in repo; env vars only; safe handling of auth tokens and user content.
- [ ] **Data & scripture integrity** — Parsing, merging, or publishing paths do not silently corrupt or drop content; edge cases called out.
- [ ] **Architecture** — UI/routes as driving adapters; Door43/format code behind ports or in `@biblia-studio/*` as agreed.
- [ ] **UI philosophy** — Styling and primitives align with [UI philosophy](./04-ui-philosophy.md) unless the PR documents a deliberate exception.
- [ ] **Upstream alignment** — Door43 / RC / USFM behavior matches cited specs or issues are filed for intentional divergence.
- [ ] **Dependencies** — New packages justified; license compatible; supply-chain risk acceptable.
- [ ] **Tests & docs** — Meaningful behavior changes include tests and/or doc updates (README, `docs/`, or package README).
- [ ] **Accessibility** — Interactive UI: keyboard, labels, focus; no “click-only” critical paths without reviewer sign-off.

## Repo automation & templates

| Artifact                                                                      | Status                                                                                                                       |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **CI** ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml))            | **Done** — `lint`, `check-types`, `build` on PRs and `main`. See [CI & branch protection](./09-ci-and-branch-protection.md). |
| **Issue templates** ([`.github/ISSUE_TEMPLATE/`](../.github/ISSUE_TEMPLATE/)) | **Done** — Agent task + Human decision forms.                                                                                |
| **`CONTRIBUTING.md`** ([root](../CONTRIBUTING.md))                            | **Done** — Short contributor entry point.                                                                                    |
| **`docs/adr/README.md`** ([ADR guide](./adr/README.md))                       | **Done** — Convention for future decision records (add `0001-…md` when needed).                                              |
| **`CODEOWNERS`** ([`.github/CODEOWNERS`](../.github/CODEOWNERS))              | **Done** — Review routing (`@abelpz`; expand when the team grows).                                                           |
| **`SECURITY.md`** ([root](../SECURITY.md))                                    | **Done** — Vulnerability reporting (advisory / private contact).                                                             |
| **GitHub labels** (`agent`, `needs-triage`)                                   | **Done** on `abelpz/biblia-studio` via `gh label create`.                                                                    |

### Optional GitHub settings

| Artifact                                            | Notes                                                                                                                        |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Require a pull request before merging to `main`** | Not required by current rules — [turn on](./09-ci-and-branch-protection.md) if you want to disallow direct pushes to `main`. |

**Branch protection** (required passing **`checks`** on `main`, strict) is **enabled** on `abelpz/biblia-studio`; see [CI & branch protection](./09-ci-and-branch-protection.md).

## Communication norms

- Agents: end summaries with **what changed**, **commands run**, and **risks / follow-ups**.
- Humans: prefer **concrete** change requests (file + intent) over generic “make it better.”

## Related

- [`AGENTS.md`](../AGENTS.md) — concise agent rules
- [GitHub agent workflow](./08-github-agent-workflow.md) — issue-driven PR flow with GitHub MCP
- [Extending upstream docs](./03-extending-upstream-docs.md) — what we document vs link
