# Workflow automation

The **human + agent** initiative flow in [`docs/11-new-project-workflow.md`](./11-new-project-workflow.md) is supported by lightweight automation so steps are not only documented—they are **prompted** at the right time.

## 1. Cursor — `/new-initiative`

**Path:** [`.cursor/commands/new-initiative.md`](../.cursor/commands/new-initiative.md)

In Cursor chat, type **`/new-initiative`** and choose the command. It injects instructions for the agent to run the discovery conversation against doc 11 and related docs.

This is **local to the IDE**; nothing runs on GitHub until you push or use MCP.

After each **phase** or deliverable in that flow, agents should still run the repo-wide [**closure checklist** in `AGENTS.md`](../AGENTS.md#after-each-step-closure-checklist) (package map, READMEs, PR/issue links) so documentation stays aligned with code.

## 2. GitHub Actions — checklist & PR reminders

**Path:** [`.github/workflows/initiative-automation.yml`](../.github/workflows/initiative-automation.yml)

| Trigger                                                                 | What happens                                                                                                         |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Issue **opened** with label **`agent`** or title starting **`[agent]`** | A **single** comment is added with the four-phase checklist and links to docs (idempotent).                          |
| Issue **labeled** `agent` (e.g. added after creation)                   | Same comment if not already posted.                                                                                  |
| **Pull request** opened or reopened                                     | If the body has no `Closes #NN` / `Fixes #NN` / `Resolves #NN`, a **single** reminder comment is added (idempotent). |

**Skips:** PR job does not run for **`dependabot[bot]`** (dependency PR noise).

**CI:** This workflow does not replace [`ci.yml`](./09-ci-and-branch-protection.md); it only adds comments.

## 3. What is not automated

- Choosing product scope or approving package splits (**human**).
- Creating or editing issues/PRs (unless you use **GitHub MCP** in Cursor manually).
- Branch protection and required checks ([CI doc](./09-ci-and-branch-protection.md)).

## Related

- [New project workflow](./11-new-project-workflow.md)
- [GitHub agent workflow](./08-github-agent-workflow.md)
