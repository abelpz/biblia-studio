# First project — readiness checklist

Use this before **planning the first real feature** (beyond repo scaffolding).

## Repository (one-time)

| Step                                                                                      | Status                                                                                                                           |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Latest `main` includes **CI** ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)) | **Done** — runs on every PR and push to `main`                                                                                   |
| **Labels** `agent` and `needs-triage` exist                                               | **Done** on `abelpz/biblia-studio`                                                                                               |
| **Branch protection** on `main` requires green **CI** (`checks` job, strict)              | **Done** — see [CI & branch protection](./09-ci-and-branch-protection.md); optionally add “require PR” in GitHub branch settings |
| **`CODEOWNERS`** present                                                                  | [`.github/CODEOWNERS`](../.github/CODEOWNERS)                                                                                    |
| **`SECURITY.md`** present                                                                 | [root `SECURITY.md`](../SECURITY.md)                                                                                             |

## Planning session (your team)

1. **Goal** — One sentence: what the first deliverable is (e.g. “read-only Door43 repo list in `apps/web`”).
2. **Issue** — Open an [**Agent task**](../.github/ISSUE_TEMPLATE/agent-task.yml) with acceptance criteria and **Out of scope**.
3. **ADR only if needed** — If the decision is hard to reverse (auth, data model), add `docs/adr/0001-….md`; otherwise skip.
4. **Branch** — `agent/<issue>-short-name` per [GitHub agent workflow](./08-github-agent-workflow.md).
5. **PR** — Draft first; mark ready when `lint` / `check-types` / `build` pass locally and on CI.

When you have a **goal** and an **Agent task** issue with acceptance criteria, you are ready to **start planning and implementation** in Cursor against that issue — the repository checklist above is already satisfied for `abelpz/biblia-studio`.
