# First project — readiness checklist

Use this before **planning the first real feature** (beyond repo scaffolding).

## Repository (one-time)

| Step                                                                                      | Status                                                                      |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Latest `main` includes **CI** ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)) | Push/merge if not on GitHub yet                                             |
| **Labels** `agent` and `needs-triage` exist                                               | `gh label create …` (see [Contributing](../CONTRIBUTING.md)) or GitHub UI   |
| **Branch protection** on `main` requires PR + green **CI**                                | [Configure after first successful CI run](./09-ci-and-branch-protection.md) |
| **`CODEOWNERS`** present                                                                  | [`.github/CODEOWNERS`](../.github/CODEOWNERS)                               |
| **`SECURITY.md`** present                                                                 | [root `SECURITY.md`](../SECURITY.md)                                        |

## Planning session (your team)

1. **Goal** — One sentence: what the first deliverable is (e.g. “read-only Door43 repo list in `apps/web`”).
2. **Issue** — Open an [**Agent task**](../.github/ISSUE_TEMPLATE/agent-task.yml) with acceptance criteria and **Out of scope**.
3. **ADR only if needed** — If the decision is hard to reverse (auth, data model), add `docs/adr/0001-….md`; otherwise skip.
4. **Branch** — `agent/<issue>-short-name` per [GitHub agent workflow](./08-github-agent-workflow.md).
5. **PR** — Draft first; mark ready when `lint` / `check-types` / `build` pass locally and on CI.

When the table above is satisfied and an issue exists with clear acceptance criteria, you are ready to **start implementation planning** in Cursor against that issue.
