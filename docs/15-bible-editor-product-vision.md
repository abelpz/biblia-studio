# Bible editor — product vision (north star)

**Audience:** humans prioritizing roadmap; agents anchoring **why** before **how**. This is **direction**, not a delivery contract — milestones and issues still define scope.

## One product among several

This monorepo will ship **more than one** end-user product (multiple `apps/*` and possibly other shells). Shared work lives in **`@biblia-studio/*`** packages so each product can reuse formats, Door43 integration, editing primitives, and UI layers without duplicating domain rules. **This document** describes only the **Bible translation editor** product line — not the whole roadmap. Add separate vision or initiative docs for other products when they firm up ([new project workflow](./11-new-project-workflow.md)).

## One-sentence goal

A **simple Bible translation editor** that works **offline and online**, on **multiple platforms**, with the **working copy as a local Git repository** that **syncs to DCS** ([Door43](https://door43.org/) / [Gitea API](https://git.door43.org/api/swagger)), and that can **grow** toward collaboration, merge/review workflows, and **reuse** of the same editor in other apps (e.g. opened from a project-management task).

## Core constraints (MVP direction)

| Constraint           | Intent                                                                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Offline + online** | Usable without network; sync when connected. Implementation details (Service Worker, local DB, sync queue) come later — capture in ADRs when choices are costly to reverse.                                                                 |
| **Multiplatform**    | Shared **logic and editor core** in packages; thin **shells** per platform (web first in this monorepo; desktop/mobile may reuse the same core via Tauri/Capacitor/etc. later).                                                             |
| **Local = Git repo** | Scripture and project files live in a **normal Git working tree** so translators can use standard Git concepts and tools where helpful.                                                                                                     |
| **Sync to DCS**      | Remote is **Door43 Content Service** semantics: authenticate, push/pull against `git.door43.org` (or compatible) per [uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab) and [Swagger](https://git.door43.org/api/swagger). |

## Editor: WYSIWYG, ProseMirror, minimal USFM

| Decision                                    | Intent                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **WYSIWYG**                                 | Translators work in a **visual, structured** view (chapters, verses, paragraphs, inline styles) — **not** raw backslash markup as the primary surface. Raw USFM may exist as an advanced view or export only.                                                                                                                                                                                                                                                                                      |
| **[ProseMirror](https://prosemirror.net/)** | Use **ProseMirror** (schema + document model + `prosemirror-view`) as the editor engine: battle-tested for structured text, extensible plugins, and a clear path to **comments** / **annotations** later. Keep the PM-specific logic in **`@biblia-studio/editing`** (or a subpath) as it stabilizes; apps supply **skin** and **shell** ([UI philosophy](./04-ui-philosophy.md)).                                                                                                                 |
| **Minimal USFM marker set**                 | Support only a **small, explicit allowlist** of USFM markers at first — enough for basic scripture drafting (e.g. identification headers, chapter `\c`, verse `\v`, paragraph `\p`, and a short list of **character** / **list** markers as needed). Everything else is **out of scope** until we add it with fixtures, round-trip tests, and alignment with [collab / USFM references](./01-ecosystem-references.md). **Expand the set deliberately**; do not pretend to support full USFM in v1. |

**Round-trip:** The ProseMirror document is the **canonical editing state**; **serialize** to USFM for save and Git, **parse** USFM to open existing files. Parsing and validation belong in **`@biblia-studio/formats`** (or shared helpers) so the same rules apply in CI and in the editor.

**Dependency:** Adding ProseMirror (or related packages) requires a **one-line justification** in the PR per [`AGENTS.md`](../AGENTS.md); no extra runtime deps without a reason.

## Phased capabilities (rough order)

| Phase                         | Capability                                                                                                                                                      | Notes                                                                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **1 — Editor + file reality** | **WYSIWYG** USFM via **ProseMirror**; **minimal marker** allowlist; round-trip with `@biblia-studio/formats`; save to disk/repo; basic navigation               | No raw-USFM-first UX; expand markers only with tests. See **Editor** section above.                                                        |
| **2 — Sync**                  | Push/pull with DCS; conflict surfacing at least at **file** level                                                                                               | Likely **ADR**: auth model, offline queue, conflict policy.                                                                                |
| **3 — Collaboration (later)** | Multiple contributors; **merge** work from another book/USFM file with **UI to choose** incoming hunks or passages                                              | May overlap with Git merge + custom diff UI; spec with care for scripture boundaries.                                                      |
| **4 — Review & comments**     | Structured **review** of content and **comments** (anchored to passages or files)                                                                               | Storage model (in-repo vs server) → **ADR** if not plain Git notes.                                                                        |
| **5 — Reusable editor shell** | Same **editor module** embedded: standalone app **or** **project dashboard** → open task → **deep-link into editor** for the translation referenced by the task | Requires stable **ports**: “open book X / file Y at passage Z”; `@biblia-studio/editing` / `@biblia-studio/project` evolve with real apps. |

## How this fits our architecture

- **App-led, libraries follow** — Build the **smallest vertical slice** in an app; **promote** to `@biblia-studio/*` when behavior is real and reusable ([new project workflow](./11-new-project-workflow.md), [package map](./02-package-map.md)).
- **Hexagonal** — Sync, Git, and DCS are **driven adapters** behind ports; the editor core does not hard-code Door43 URLs ([hexagonal apps](./05-hexagonal-apps.md)).
- **Reusable editor** — Prefer **lifeless** (state, parsing, save pipeline) and **skinless** (accessible editing surface) packages so another app can compose the same core with a different **bone** (theme) or shell ([UI philosophy](./04-ui-philosophy.md)).

## When to write an ADR

Add an [ADR](./adr/README.md) when locking **auth**, **sync semantics**, **conflict/merge strategy**, **where comments/reviews live**, or a **stable USFM marker contract** (if multiple apps must agree) — not for every UI tweak.

## Related

- [Overview](./00-overview.md) · [Principles](./PRINCIPLES.md) · [Ecosystem references](./01-ecosystem-references.md) · [Milestones & scope](./13-milestones-and-scope.md)
