# Bible editor — product vision (north star)

**Audience:** humans prioritizing roadmap; agents anchoring **why** before **how**. This is **direction**, not a delivery contract — milestones and issues still define scope.

## One-sentence goal

A **simple Bible translation editor** that works **offline and online**, on **multiple platforms**, with the **working copy as a local Git repository** that **syncs to DCS** ([Door43](https://door43.org/) / [Gitea API](https://git.door43.org/api/swagger)), and that can **grow** toward collaboration, merge/review workflows, and **reuse** of the same editor in other apps (e.g. opened from a project-management task).

## Core constraints (MVP direction)

| Constraint           | Intent                                                                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Offline + online** | Usable without network; sync when connected. Implementation details (Service Worker, local DB, sync queue) come later — capture in ADRs when choices are costly to reverse.                                                                 |
| **Multiplatform**    | Shared **logic and editor core** in packages; thin **shells** per platform (web first in this monorepo; desktop/mobile may reuse the same core via Tauri/Capacitor/etc. later).                                                             |
| **Local = Git repo** | Scripture and project files live in a **normal Git working tree** so translators can use standard Git concepts and tools where helpful.                                                                                                     |
| **Sync to DCS**      | Remote is **Door43 Content Service** semantics: authenticate, push/pull against `git.door43.org` (or compatible) per [uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab) and [Swagger](https://git.door43.org/api/swagger). |

## Phased capabilities (rough order)

| Phase                         | Capability                                                                                                                                                      | Notes                                                                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **1 — Editor + file reality** | Edit **USFM** (or agreed slice) in a project; save to disk/repo; basic navigation                                                                               | Align with `@biblia-studio/formats`; keep UI **lifeless → skinless** per [UI philosophy](./04-ui-philosophy.md).                           |
| **2 — Sync**                  | Push/pull with DCS; conflict surfacing at least at **file** level                                                                                               | Likely **ADR**: auth model, offline queue, conflict policy.                                                                                |
| **3 — Collaboration (later)** | Multiple contributors; **merge** work from another book/USFM file with **UI to choose** incoming hunks or passages                                              | May overlap with Git merge + custom diff UI; spec with care for scripture boundaries.                                                      |
| **4 — Review & comments**     | Structured **review** of content and **comments** (anchored to passages or files)                                                                               | Storage model (in-repo vs server) → **ADR** if not plain Git notes.                                                                        |
| **5 — Reusable editor shell** | Same **editor module** embedded: standalone app **or** **project dashboard** → open task → **deep-link into editor** for the translation referenced by the task | Requires stable **ports**: “open book X / file Y at passage Z”; `@biblia-studio/editing` / `@biblia-studio/project` evolve with real apps. |

## How this fits our architecture

- **App-led, libraries follow** — Build the **smallest vertical slice** in an app; **promote** to `@biblia-studio/*` when behavior is real and reusable ([new project workflow](./11-new-project-workflow.md), [package map](./02-package-map.md)).
- **Hexagonal** — Sync, Git, and DCS are **driven adapters** behind ports; the editor core does not hard-code Door43 URLs ([hexagonal apps](./05-hexagonal-apps.md)).
- **Reusable editor** — Prefer **lifeless** (state, parsing, save pipeline) and **skinless** (accessible editing surface) packages so another app can compose the same core with a different **bone** (theme) or shell ([UI philosophy](./04-ui-philosophy.md)).

## When to write an ADR

Add an [ADR](./adr/README.md) when locking **auth**, **sync semantics**, **conflict/merge strategy**, or **where comments/reviews live** — not for every UI tweak.

## Related

- [Overview](./00-overview.md) · [Principles](./PRINCIPLES.md) · [Ecosystem references](./01-ecosystem-references.md) · [Milestones & scope](./13-milestones-and-scope.md)
