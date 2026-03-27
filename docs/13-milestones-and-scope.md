# Milestones, scope, and staying on track

**Audience:** one **human** maintainer plus **AI agents**. Goal: catch **drift** early and make **stop / narrow / split / new milestone** an explicit choice—not a surprise at review time.

## What we call a **milestone**

A **milestone** is a **named bucket of work with a shared “why”** and a clear end state. In GitHub, use **[Milestones](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-milestones)** and attach **every issue** that belongs to that phase of the roadmap.

| Approach                         | When to use it                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| **GitHub Milestone** on the repo | Preferred — issues list “Milestone” in the UI; agents can read it via API/MCP when available. |
| **Label** (e.g. `milestone-v1`)  | OK if you avoid milestone UI; document the meaning in the label description.                  |
| **Project board column**         | Optional visual; still **link issues to a milestone or parent issue** so scope is searchable. |

**Initiative** vs **milestone:** an **initiative** is a larger bet (often [doc 11](./11-new-project-workflow.md)); a **milestone** is a concrete chunk of deliverables on the way there. One initiative may span several milestones.

## Human habits (lightweight)

1. **Name milestones** with an outcome, not a month only — e.g. “M1 — read-only Door43 repo list in `apps/web`”.
2. **Put acceptance criteria in the issue body** — what “done” means for that issue.
3. **Re-read open issues** against the milestone weekly or when velocity feels wrong — agents will surface drift; you still own **priority**.

## What agents must do

### 1. Anchor to the issue and milestone

When picking up work, **restate in one sentence**: what the issue asks for, and **which milestone** (or label) it serves. If the issue has **no** milestone and the work clearly belongs to a roadmap phase, **say so** and suggest the human assign one—do not silently invent roadmap scope.

### 2. Add an **Alignment** block often

At **the end of each step** (and in the final task summary), include a short **Alignment** subsection:

```markdown
### Alignment

- **Issue goal:** …
- **Milestone:** … (or “none — chore / ad-hoc”)
- **On track:** yes / **at risk** — why
```

If **at risk**, skip straight to [Escalation](#escalation-options-for-humans).

### 3. Flag **drift signals** immediately

Stop implementing and escalate (see below) when **any** of these appear:

| Signal                                                                              | Why it matters                                               |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Work **no longer matches** the issue title or acceptance criteria                   | Scope creep or wrong issue.                                  |
| Completing the “right” thing **requires** unrelated packages, APIs, or product bets | Belongs in a **new issue** or **new milestone**.             |
| The issue is a **duplicate** or **subset** of another open issue                    | Risk of double work or conflicting direction.                |
| Upstream or security constraints **block** the original approach                    | Human must choose: desist, alternative, or time-boxed spike. |
| You are about to add **large** deps, auth, or storage without an issue/ADR          | Pause; see [ADR guide](./adr/README.md).                     |

### 4. Never “expand” a milestone in code alone

If the **definition of done** for the milestone has effectively changed (new features, new apps), **do not** only update code—call it out and point to **new issue / milestone / initiative** per [New project workflow](./11-new-project-workflow.md).

## Escalation options (for humans)

When an agent raises drift, **you** choose. Typical paths:

| Option             | When                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Desist**         | Pause or close the issue; deprioritize the milestone or mark issues blocked.                                             |
| **Narrow scope**   | Rewrite issue acceptance criteria; split remaining work to new issues.                                                   |
| **New issue**      | One clear slice (still same milestone).                                                                                  |
| **New milestone**  | The current milestone’s scope was wrong; reorganize issues and dates.                                                    |
| **New initiative** | Cross-cutting product or architecture bet — use [doc 11](./11-new-project-workflow.md) and `/new-initiative` if helpful. |

Agents should end with **recommended** option(s) and **one sentence each** for tradeoffs—not merge decisions.

## Relation to other rules

- **Step closure** — Still run [AGENTS.md § closure checklist](../AGENTS.md#after-each-step-closure-checklist) for docs and delivery.
- **GitHub workflow** — Issues and PRs stay the system of record — [GitHub agent workflow](./08-github-agent-workflow.md).

## Milestones (this repo)

| Milestone                                                 | Status | Delivered / tracking                                                                                                                                                                                                                                                                                                             |
| --------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M1 — Door43 read-only in web**                          | Closed | [PR #9](https://github.com/abelpz/biblia-studio/pull/9) — issue [#8](https://github.com/abelpz/biblia-studio/issues/8)                                                                                                                                                                                                           |
| **M2 — WYSIWYG USFM v1 (ProseMirror)**                    | Closed | [Milestone #2](https://github.com/abelpz/biblia-studio/milestone/2) — closed issues [#10](https://github.com/abelpz/biblia-studio/issues/10)–[#12](https://github.com/abelpz/biblia-studio/issues/12) (USFM v1 in `formats`, ProseMirror bridge in `editing`, `/editor` in `web`); [vision](./15-bible-editor-product-vision.md) |
| **M3 — Translation helps: catalog, metadata, GL pairing** | Closed | [PR #16](https://github.com/abelpz/biblia-studio/pull/16) (issue [#14](https://github.com/abelpz/biblia-studio/issues/14)), [PR #17](https://github.com/abelpz/biblia-studio/pull/17) (issue [#15](https://github.com/abelpz/biblia-studio/issues/15)); glossary [Translation Helps](./17-translation-helps-and-resources.md).   |
| **M4 — Translation helps in web**                         | Open   | Issue [#18](https://github.com/abelpz/biblia-studio/issues/18) — **`/translation-helps`** (tc-ready list + optional GL→GL compare)                                                                                                                                                                                               |

Update this table when new milestones start.

## M3 inventory (delivered Mar 2026)

| Area            | On **`main` (merged)**                                                                                                                                                                                                                                                 | Next slices (not in M3)                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Door43**      | Repo search, version, **`listTcReadyTranslationHelpsResources`**, **`fetchDoor43CatalogMetadata`**, **`parseCatalogMetadata`**, **`DOOR43_API_V1_BASE_URL`**, catalog summary **`catalogOwner`** / **`catalogRepo`** / **`catalogRef`** (see `packages/door43` README) | Pagination / `stage` tuning, richer catalog query helpers                                |
| **Translation** | **`compareGlToGlTcReadyTranslationHelps`**, **`findTargetCatalogEntriesClaimingSource`** + tests + README                                                                                                                                                              | Book × help matrix, tag vs default-branch WIP                                            |
| **Docs**        | **`docs/17-translation-helps-and-resources.md`**, package map updates                                                                                                                                                                                                  | Planned API / ADR per [doc 17](./17-translation-helps-and-resources.md) “Open decisions” |
| **Apps/web**    | Door43 repo list (M1), `/editor` (M2); **`/translation-helps`** ([#18](https://github.com/abelpz/biblia-studio/issues/18))                                                                                                                                             | Source-first drill-down, book × help matrix UI                                           |

Optional: create a GitHub **Milestone** retroactively and attach closed issues [#14](https://github.com/abelpz/biblia-studio/issues/14)–[#15](https://github.com/abelpz/biblia-studio/issues/15) for reporting.

## Active milestone

**M4 — Translation helps in web** — [#18](https://github.com/abelpz/biblia-studio/issues/18).

## Related

- [Bible editor product vision](./15-bible-editor-product-vision.md) — long-term product direction when naming milestones
- [AGENTS.md](../AGENTS.md) — closure checklist, when to stop
- [New project workflow](./11-new-project-workflow.md) — initiatives and emerging packages
- [AI & human workflow](./06-ai-and-human-workflow.md) — roles and communication norms
