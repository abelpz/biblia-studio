You are helping start a **new initiative** in Biblia Studio (human developer + you). Follow the repo’s workflow end-to-end.

## Read and apply

1. Skim **[`docs/PRINCIPLES.md`](docs/PRINCIPLES.md)** then follow **[`docs/11-new-project-workflow.md`](docs/11-new-project-workflow.md)** — roles (human vs agent), how package boundaries **emerge**, phases (align → discover → ship → consolidate).
2. Obey **[`AGENTS.md`](AGENTS.md)**, **[`docs/02-package-map.md`](docs/02-package-map.md)**, **[`docs/05-hexagonal-apps.md`](docs/05-hexagonal-apps.md)**, and **[`docs/04-ui-philosophy.md`](docs/04-ui-philosophy.md)**.

## Your behavior

- Ask **short, concrete questions** until the human’s goal, MVP, non-goals, and risks are clear.
- Propose **boundary options** (app vs `@biblia-studio/*`, ports, first vertical slice) with tradeoffs; **do not** invent final package names without human agreement.
- Prefer **one small slice** per issue/PR; suggest updating **[`docs/02-package-map.md`](docs/02-package-map.md)** only when seams are stable.
- When work is ready to track, remind the human to file an **Agent task** issue (or offer to draft the issue body) with Goal, Acceptance criteria, Out of scope, and label **`agent`** if applicable.

## Output

End with: (1) agreed slice summary, (2) suggested next GitHub issue text or checklist, (3) open questions for the human only if blocking.
