# Translation Helps and resources

**Audience:** humans and agents planning **translation helps production**, **project management tooling**, **study** features, or **resource coverage** APIs (what exists in which language for a **verse**, **passage**, or **book** — and what is **missing**).

This page is a **Biblia Studio glossary and product intent**: we **link** format and platform details to [uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab) and related upstream docs instead of copying long specifications.

**Implementation contracts** (function signatures, types, planned explicit source-set compare): [Translation helps domain API](./18-translation-helps-domain-api.md).

## Vocabulary

| Term                          | What we mean (here)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Resource**                  | In the **Door43 / unfoldingWord** ecosystem, a **versioned body of content** packaged and distributed for translators and readers — typically aligned with **Resource Container (RC)** concepts (manifest, ingredients, licensing, revision). Scripture text, **Translation Helps**, Open Bible Stories, and other ingredients are all **resources** in this sense. Upstream truth: [uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab) and [Ecosystem references](./01-ecosystem-references.md). |
| **Translation Helps**         | **Helps** that support **translation** work: contextual explanations, terminology, checking questions, training material, etc., in structured formats (e.g. notes, word articles, questions, academy) rather than scripture USFM alone. Exact identifiers and file layouts are **spec-defined** upstream; implementations follow specs behind **ports and adapters**.                                                                                                                                             |
| **Interlinked helps**         | Translation help **resources are not isolated**: they **reference the same scripture scope** (book/chapter/verse, passages, pericopes) and **cross-reference** each other (e.g. notes ↔ terms ↔ questions) via shared **anchors** in upstream data. That structure is what allows us to answer: **for book _B_ or passage _P_, which help types should exist, and which languages already have them?** Details live in collab / RC docs; we consume them, we do not redefine linking rules here.                  |
| **Scope (query granularity)** | **Book**, **passage** (continuous range or pericope), or **verse** — the slice of scripture for which we want coverage. The API and domain layer should express queries in terms teams actually use; **mapping** to on-disk chunks or RC ingredients is an implementation concern.                                                                                                                                                                                                                                |

### Gateway workflows (do not conflate)

| Term                            | What we mean (here)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gateway language (GL)**       | A regional or majority language used as a **hub**: translators or readers who **understand** the GL can use helps and scripture **in that language** as a bridge toward another language.                                                                                                                                                                                                                                                                                                                                                                  |
| **GL → GL (Translation Helps)** | **Adapting Translation Helps** from one **gateway language** to another (e.g. Spanish GL helps → French GL helps). This is **helps production**, not scripture replacement. **Coverage and gaps are defined by comparing a source GL to a target GL:** for the same scripture scope, what exists (or is current) in the **source GL** vs what exists, is missing, or is stale in the **target GL**. The **source GL** is often the org **baseline** (frequently English), but the pairing is always **source GL ↔ target GL**, not “baseline vs minority.” |
| **GL → Minority (Scripture)**   | **Translating the Bible** (scripture text) **from** a gateway language **into** a **minority language** whose speakers understand the gateway. Translation **helps in the gateway** support that work, but the **deliverable** is **scripture** in the minority language, not a new set of helps (though minority-language helps may follow later).                                                                                                                                                                                                        |

**Product rule:** Features that report **helps coverage** and **gaps** for GL→GL work **compare source GL to target GL** (same subjects/resources, two language columns). **Baseline** is usually “which GL we treat as source of truth,” often configurable—not a separate category from source GL. **GL → Minority** scripture tracking is a **different** pipeline (e.g. project milestones on scripture books), even though both may appear in the same organization’s dashboard someday.

### Baseline and coverage

| Term                              | What we mean (here)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **English / baseline helps**      | Often the **reference** set for “what could exist” when comparing gateways. In GL→GL, the **baseline language** is usually the **source GL** (often `en`, but **configurable**).                                                                                                                                                                                                                                                                                                                       |
| **Gap / coverage**                | For **source GL** **A**, **target GL** **B**, and scope **S** (book / passage / verse): compare what **exists** and is **current** in **B** against what **A** (or catalog rules) implies should exist for GL→GL helps. **Gap** = missing, stale, or not-yet-translated help units in **B** relative to **A**. Definition of a “unit” (per note, per verse anchor, per ingredient) is **issue-driven** per resource type.                                                                              |
| **Released vs in-progress**       | The Door43 **catalog** is **index-oriented**: default **`stage`** values emphasize **published** catalog entries (e.g. production releases). **Work in progress** may live on **branches**, **draft releases**, or entries visible only at broader **`stage`** values ([`swagger.v1.json`](https://git.door43.org/swagger.v1.json) — `catalogSearch` `stage`). “What needs translating” should not assume the catalog is the **complete** set of repos—only what is **catalog-listed** for that query. |
| **Release tag vs default branch** | **Latest release tag** (or the tag the catalog indexes for **prod**) is a **snapshot**: what shippers consider published. **Default branch** (often `master`) is the **working tree**: books and files may exist here **before** they appear in that tag. Comparing both answers “what is done for release” vs “what is already drafted in process.”                                                                                                                                                   |

## End-user outcomes (target experience)

Translators and leads ultimately need **two** kinds of answers (book is the primary slice below; verse/chunk detail comes later).

### 1) Which books need work, and which helps apply to those books?

For chosen **source GL** resources and resolved **target** resources ([source-first pairing](#source-first-pairing-recommended-catalog-is-not-the-whole-story)):

- **Scripture (aligned Bible / bundle):** From RC **`projects`** (per **book** id: USFM path, `sort`, categories), derive **which books** are **missing** on the target vs source, **out of date** vs baseline, or **out of scope** by policy.
- **Translation Helps tied to that book:** Using **`relation`**, **`source`**, and format guides ([uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab)), list **which help resources** (TN, TQ, TWL, TW scope, OBS story set, etc.) **should exist for book N**—then, for each, check **per-book ingredients** (e.g. `tn_MAT.tsv`) for **presence** and (policy) **completeness** vs the **source** book.

Output is a **matrix**: **book × resource** (scripture + each help type) with states like _missing / in progress / released / stale_.

### 2) Book in `master` but not in latest release — what is done vs still to translate?

When a **book** appears in **`manifest.yaml`** on the **default branch** but **not** (or not fully) in the **latest release tag** **snapshot**:

- Load **`projects`** (or equivalent) at **two refs**: **latest release tag** and **default branch** (Git contents API, raw manifest, or zip per ref).
- **Already translated (in process):** Books/files/rows that **exist** on **default branch** and meet a **minimum bar** (file present, non-empty, passes chosen checks)—per team policy.
- **Still needs translation:** Books **only** on branch outline but **empty** / missing ingredient, or **book missing** on branch; or **helps** rows present in **source** for that book but **absent** or **stub** in target on **default branch**; or branch lags **source** updates.

This is **WIP progress**, not only “released vs absent”: the user sees **partial** completion inside the repo before the next tag.

**Implementation note:** Door43 is **Git-backed**; branch vs tag reads are **adapter** concerns ([hexagonal apps](./05-hexagonal-apps.md)). Catalog **search** alone does not expose branch-level ingredient diffs—**manifest + file inventory** at **two refs** does.

**Shipped (v0):** Catalog GL→GL, source-first scan, Door43 links, and **manifest book-id matrix** for matched resources (`compareGlToGlTcReadyBookProjects` + `/translation-helps?matrix=1`). **Not shipped yet:** per-ingredient / verse-level matrix, interlink-derived checklists, and **tag vs `master` diffs** — see `@biblia-studio/translation` + `@biblia-studio/door43` (+ `formats` when parsing is required).

## User journey (GL→GL): two phases in time

**Cast:** A gateway-language translation lead who has **not** shipped target-language resources yet, then continues as work appears. **Two phases** are **when the target is still empty of useful releases** vs **when some target resources already exist** and the questions shift to **parity, WIP, and fine scope**. Same person, **later history**.

Cross-links: [source-first pairing](#source-first-pairing-recommended-catalog-is-not-the-whole-story), [metadata `source`](#scripture-pairing-rc-source--door43-catalog-metadata), [interlinked helps](#vocabulary), [human process](#human-process-unknown--what-needs-translating-source-gl--target-gl).

### Phase 1 — Target side is greenfield (nothing meaningful released yet)

1. **See what exists in the source GL and choose scope**  
   He inventories what is **available** in the **source** language: catalog (**`topic=tc-ready`**, optional **`subject`** filters), org repos, or policy list. He **picks** a **set of resources and/or subjects** to translate (not “everything in Door43”—an explicit **source set**).

2. **See what exists in the target GL**  
   He runs the same style of discovery for the **target** language and org (catalog, `stage` as needed). This may be **empty** or sparse for tc-ready.

3. **Line up target rows with what he picked (lineage)**  
   For each **chosen** source resource, he checks whether **any** target resource **relates** to it—especially via **`dublin_core.source`** (`identifier` + `language` [+ version]) for **scripture**, and via **same help `identifier` / `subject`** or **`relation`** for **Translation Helps** (see [scripture pairing](#scripture-pairing-rc-source--door43-catalog-metadata)).

4. **First gap list**
   - **If no target claims lineage** to a picked source row → that resource is on the **“needs translation / needs a new repo”** list.
   - **If** a related target exists → continue in **Phase 2**.

### Phase 2 — Target has related resources (released parity, WIP, book and passage depth)

5. **Released vs released (resource-level)**  
   For **paired** source/target resources, he compares what is **released** on the **source** (catalog **prod** / latest **release tag**) to what is **released** on the **target**: **books** in `manifest` **`projects`**, **ingredient files** present, versions (**`dublin_core.version`**, `source` version lag). He learns whether the target release is **fully** covering the same **books/files** as the source release—or simply **absent**.

6. **In progress: default branch but not released**  
   For gaps or partials, he checks whether work exists on the **default branch** (e.g. `master`) **without** appearing in the **latest release tag**—book listed in manifest, file added, etc.

7. **How much WIP vs what is missing**  
   For each **book** (or file) **in process**, he compares **unreleased** target content to **released** source: what **already exists** on branch vs what is **still missing** against the source release (empty file, missing book, missing TSV rows—policy defines “missing”).

8. **Book-specific derived lists (interlink traversal)**  
   For a **chosen book**, he walks **links** in source helps to **other resource types**—for example **Translation Notes** **SupportReference** → **Translation Academy** article ids; **Translation Words Links** → **Translation Words** article ids via **`TWLink` / `rc://`**. He builds **checklists** of **TA** and **TW** articles that **must** exist in the target for that book’s translation effort, even if those articles live in separate repos.

9. **Finer grain: chapters, verses, and entries**  
   He drills down from **book** to **chapter/verse** for **scripture** (USFM presence, alignment tokens) and to **specific rows or entries** for **TN, TWL, TW, TA, TQ**, etc.—which **verses** have notes, which **terms** are linked, which **questions** exist—always compared **source** vs **target** at the same scope.

10. **Passage filter**  
    He restricts the whole picture to a **passage** (continuous range or pericope): only resources and **entries** that **overlap** that portion of scripture, so planning and dashboards stay scoped to what the team is translating **now**.

**Product note:** Steps **1–4** are **catalog and metadata**-heavy; **5–7** add **Git tag + default branch**; **8–10** need **parsing** (TSV, Markdown, USFM) and **reference normalization**—natural home over time in `@biblia-studio/formats`, `@biblia-studio/translation`, and Door43/Git **adapters** ([package map](./02-package-map.md)).

## Prototype (v0): tc-ready catalog + GL→GL comparison

**Catalog layer (`@biblia-studio/door43`):** `listTcReadyTranslationHelpsResources()` calls **`GET https://git.door43.org/api/v1/catalog/search`** ([`swagger.v1.json`](https://git.door43.org/swagger.v1.json)) with `topic=tc-ready` (override via options), **`lang`**, optional catalog **`owner`** (`organization`), and optional **`subjects`** filter. Use **`DEFAULT_TC_READY_HELP_SUBJECTS`** or your own list. See [`packages/door43` README](../packages/door43/README.md).

**GL→GL prototype (`@biblia-studio/translation`):** `compareGlToGlTcReadyTranslationHelps({ sourceLanguage, targetLanguage, ... })` loads tc-ready catalog rows for **both** gateway languages and returns **`matched`**, **`missingInTarget`**, and **`onlyInTarget`**. A pair is **accepted** only if the **target**’s **`catalog/metadata`** **`dublin_core.source`** lists the **source** GL **`language` + resource `identifier`** (same rule for same-abbreviation rows and for lineage like **`es-419_glt`** → **`en_ult`**). **`compareTcReadySourceResourcesToTarget`** applies the same metadata check for explicit source lists when the target row has metadata coords—see [domain API](./18-translation-helps-domain-api.md). That is **catalog resource parity**, not verse-level or RC-ingredient parity; interlinking and “expected units” per scope follow [uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab) and future milestones. See [`packages/translation` README](../packages/translation/README.md).

**Book matrix v0:** `compareGlToGlTcReadyBookProjects(...)` builds on **matched** pairs: for each, it fetches **`GET .../catalog/metadata/...`** for **source** and **target** and diffs **`projects`** book **identifiers** — a first step toward the **book × resource** matrix (manifest-level books only; not per-ingredient completeness). **`apps/web`** exposes this on **`/translation-helps`** when GL→GL compare is active and **`matrix=1`** (optional **`matrixMax`** 1–40, default 15 matched pairs).

**Source-first scan:** `findTargetCatalogEntriesClaimingSource({ targetLanguage, sourceLanguage, sourceIdentifier, ... })` lists **target** tc-ready rows whose catalog **`dublin_core.source`** claims that lineage. **`apps/web`** exposes this on **`/translation-helps`** when both **`srcLang`** and **`srcId`** query params are set (**`lang`** = target catalog language; optional **`srcVer`**); **GL→GL compare** (`compare` ≠ `lang`) takes precedence over source-first vs plain catalog. For rows with **`owner` / `name`** (and ref) from catalog search, the web adapter also fills **Gitea repo**, **`GET .../catalog/metadata/...`**, and (when present) **bundle** (zip/tarball) links on the catalog, source-first, and GL→GL views.

### Catalog: `topic` vs `subject` (scripture vs helps)

- **`topic=tc-ready`** — Primary filter for “in the production / translationCore-style catalog slice.” Often **sufficient on its own** for an inventory pass: query once per **source GL** and once per **target GL** **without** narrowing by `subject`, then **classify rows by hand or by simple rules** (scripture bundles vs helps vs OBS, etc.).
- **`subject` (optional)** — Use when you want a **smaller** list (e.g. only Translation-Helps-style subjects) or to match tooling that thinks in catalog subject strings. For **scripture** (aligned Bibles, Bible bundles), teams often **do not** rely on a fixed subject allowlist; **tc-ready + language** already surfaces what is tagged for that workflow.
- **Machine phase** — Automation can default to **topic-only** discovery, then apply tunable classifiers (subject patterns, identifier maps like `ult`↔`glt`) instead of forcing humans to maintain one global subject list for every language pair.

### Scripture pairing: RC `source` + Door43 catalog metadata

Published scripture resources carry **Resource Container** metadata. The Door43 API exposes it on **`GET /api/v1/catalog/metadata/{owner}/{repo}/{ref}`** ([`swagger.v1.json`](https://git.door43.org/swagger.v1.json) — `catalogGetMetadata`); each **`GET /api/v1/catalog/search`** hit also includes a **`metadata_json_url`** (or equivalent) pointing at that payload for the catalog row’s **`owner` / `name` / tag or branch**.

Relevant fields in the JSON (under **`dublin_core`**):

| Field                       | Use for scripture matching                                                                                                                                                                                                                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`source`**                | Array of **`{ identifier, language, version, owner?, organization? }`** describing **upstream lineages**. Optional **`owner`** / **`organization`** pin which **DCS org** produced the upstream (match catalog **`owner`**). Match target ↔ source by **language + identifier**, disambiguate with org when the manifest supplies it. |
| **`version`**               | This resource’s own RC **version** string (not the same as Git tag naming everywhere, but aligned with the catalog **`ref`** you requested).                                                                                                                                                                                          |
| **`relation`**              | Related resources (helps, **UHB**/**UGNT** with optional `?v=`); complements **`source`** for dependency graphs.                                                                                                                                                                                                                      |
| **`publisher` / `creator`** | **Provenance** strings in the manifest (not the same as DCS **org** **`owner`**, but useful for auditing).                                                                                                                                                                                                                            |

**DCS org vs RC metadata:** the Git hosting **organization** (**`owner`** on catalog entries, e.g. `unfoldingWord`, `es-419_gl`) is the anchor for repo URLs; **publisher** in **`dublin_core`** is an RC field and may name a different legal/community entity.

**In code:** `@biblia-studio/door43` parses **`owner`** / **`organization`** on **`dublin_core.source`** entries and exposes **`door43MetadataClaimsUpstreamSource`** / **`normalizeDoor43CatalogOrg`**. **`findTargetCatalogEntriesClaimingSource`** accepts optional **`sourceCatalogOwner`**. **`compareGlToGlTcReadyTranslationHelps`** verifies metadata **`source`** (including org pins) for every matched pair when coords exist.

### Source-first pairing (recommended): catalog is not the whole story

The **catalog** answers “what has been **released** into this index for this query?” It does **not** by itself define the **authoritative list** of what your team **chooses** to treat as the source baseline (you may include repos not yet tc-ready, or exclude catalog noise).

**Preferred mental model:**

1. **Pick the source set** — Explicit list of **source GL** resources to plan from (e.g. org checklist, “all `unfoldingWord` en tc-ready”, spreadsheet, or policy file—not only “whatever the catalog returned last Tuesday”).
2. **Resolve targets by lineage** — For each chosen source resource, look in the **target GL** (and owning org) for resources whose **`dublin_core.source`** (and when needed **`relation`**) **references that source**: same **`language` + `identifier`** on the source side (see [metadata table](#scripture-pairing-rc-source--door43-catalog-metadata)). **Helps** often still align by **same abbreviation**; **scripture** should lean on **`source`** when abbreviations differ (`ult` vs `glt`).
3. **Branch: compare vs greenfield**
   - **If** at least one target candidate exists (catalog row **or** repo branch / draft with correct **`source`** in manifest): **run comparison** — RC **`version`**, `source` version lag, ingredient coverage, scope **S**.
   - **If** none: the gap is **“no derived resource yet”** (translate or create repo, then set **`source`** correctly in metadata)—**no** deep diff until something claims lineage.
4. **Unreleased work** — If translators care about **in-progress** work, widen **`stage`** on **`catalogSearch`** (e.g. `latest`, `preprod`, `branch` per Swagger) **or** query **Git** (default branch / feature branch `manifest.yaml`) so pairing is not limited to **production** catalog entries alone.

**`compareGlToGlTcReadyTranslationHelps`** covers **full** source- and target-language catalogs with **exact key + target-metadata lineage**; **`compareTcReadySourceResourcesToTarget`** is for an **explicit source list** (exact key to target only today). A **source-driven** workflow can still iterate **your** chosen sources and resolve targets via **`source`** (step 2), then compare only where step 3 applies.

## Human process: unknown → “what needs translating” (source GL → target GL)

Use this as the **manual** procedure first; each step maps to future checks in code (catalog, manifest, ingredients, diffs). It follows **source-first** pairing above.

1. **Anchor the pair**  
   Record **source GL** language id (e.g. `en`) and **target GL** (e.g. `es-419`). Note **Door43 org(s)** for baseline vs target (e.g. `unfoldingWord` vs `es-419_gl`).

2. **Define the source inventory (authoritative list)**  
   Decide which **source** resources are in scope (released catalog rows, internal tracker, or manifest list). Do **not** assume “catalog = full intent” unless that is your policy.

3. **Discover target candidates by `source` metadata (and helps heuristics)**  
   For each **source** resource, search the **target** language/org for repos or catalog entries whose **`dublin_core.source`** names that resource’s **`identifier` + `language`** (and optional **version** window). For helps, same **`identifier`** + **`subject`** is often enough when communities mirror English.

4. **Classify each source row**
   - **No target with matching lineage** → **new translation / new resource** (no diff yet).
   - **Target found** → proceed to comparison (versions, books, chunks).

5. **Catalog-only supplement (optional)**  
   **`topic=tc-ready`** searches on both langs can still surface **surprises** (extra target-only resources); log as **target-only** or policy exceptions.

6. **Choose scope**  
   For each **paired** resource, pick **scope** **S**: whole resource vs **book** vs **passage** vs **verse**.

7. **Content-level check**  
   Manifest, ingredients, **UHB**/**UGNT** versions in **`relation`**, **checking level**, alignment to scripture. Compare **S** against **source**.

8. **Interlink sanity**  
   [uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab): **`relation`**, **`rc://`**, consumable helps for **S**.

9. **Define “done”**  
   Release parity, **checking level**, validator—record as acceptance criteria.

10. **Hand off**  
    Issues/milestones; automation implements steps 2–9 with **`catalogSearch`**, **`catalogGetMetadata`**, **Git** (tag + default branch), **`stage`** as configured, and **[end-user matrix](#end-user-outcomes-target-experience)** when book-level WIP is in scope.

### Mapping to a future machine pipeline (outline)

| Human step | Machine direction (later)                                                                                                                                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2          | Config: **source resource set** (repos, catalog query, or project manifest).                                                                                                                                                                    |
| 3          | **Target resolution:** **`catalogSearch`** by `lang` + org + **`catalogGetMetadata`** scan, or repo list + fetch manifest; match **`dublin_core.source`** to source **`identifier`+`language`**; helps heuristic + scripture **`source`** rule. |
| 4          | Branch on **candidate found** → diff job vs **missing** → greenfield issue.                                                                                                                                                                     |
| 5          | Optional symmetric catalog diff for **orphan** detection.                                                                                                                                                                                       |
| 6–7        | RC / ingredients adapter for **book** **B** (manifest `projects`, per-file inventory).                                                                                                                                                          |
| 8          | `rc://` resolution, alignment checks.                                                                                                                                                                                                           |
| 9          | Policy: version / checking thresholds.                                                                                                                                                                                                          |
| _(extra)_  | **Release vs WIP:** fetch manifest + ingredients at **latest tag** and at **default branch**; diff per **book** for scripture + help files.                                                                                                     |
| _(extra)_  | **Book × help matrix** for reporting (book × resource × state).                                                                                                                                                                                 |

## Planned API (developer-facing)

**Primary surface:** a **TypeScript / JavaScript library** (`@biblia-studio/door43`, `@biblia-studio/translation`) imported into **apps, scripts, or the browser** so work can run **on the user’s machine** (client-side `fetch` to Door43). Signatures and types live in the packages and in [Translation helps domain API](./18-translation-helps-domain-api.md). A **REST or RPC server** is optional later and would wrap the same functions—not replace them as the contract.

**Goal:** Give **developers** building **translation helps production** and **project management** tools that **stable, documented surface** so **end-user outcomes** ([above](#end-user-outcomes-target-experience)) are achievable:

1. **Resolve requirements** — For **book** **B** (then passage / verse **S**), list **which resources** (scripture + interlinked helps) **should** exist; rules from upstream and org policy, not ad hoc per app.
2. **Resolve availability** — For **target** **L**, **B**, and resource type: what exists under **release snapshot** (catalog / tag) and optionally under **default branch** (WIP).
3. **Resolve gaps (released)** — Compare **source** **A** to **target** **B** at **released** refs: **missing**, **stale**, or incomplete **books** and **help packs** for **B**.
4. **Resolve WIP progress** — For repos where **book** work is on **default branch** but **not** in latest **release** tag: **done vs remaining** for scripture + helps **ingredients** per **B** (policy-defined “translated enough”).
5. **Stay adapter-friendly** — **Door43** catalog, **Git** (tag vs branch), local clone — **adapters** behind one port ([hexagonal apps](./05-hexagonal-apps.md)).

**Consumers:** internal `apps/*`, partner tools, CI checks (“helps pack complete for Obadiah in `es`”), not necessarily end-user translators as the first client.

**Non-goals (initially):** authoring UX, TM alignment, or replacing DCS; the API **orchestrates and reports** using existing repos and metadata.

## Relationship to packages (today)

| Package / area                                      | Role                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`@biblia-studio/study`](./02-package-map.md)       | Composes scripture + helps for study UX; may **consume** coverage summaries for display — does not own the **cross-language gap engine** by default.                                                                                                                                                   |
| [`@biblia-studio/translation`](./02-package-map.md) | **GL→GL:** `compareGlToGlTcReadyTranslationHelps` (catalog symmetric diff); **`findTargetCatalogEntriesClaimingSource`** (metadata **`source`**). **Planned:** **book × help** gap matrix, **release tag vs default branch** WIP progress ([end-user outcomes](#end-user-outcomes-target-experience)). |
| [`@biblia-studio/formats`](./02-package-map.md)     | Parsing and RC-related structures needed to **interpret** help files and references.                                                                                                                                                                                                                   |
| [`@biblia-studio/door43`](./02-package-map.md)      | Listing and fetching content from DCS for **availability** checks.                                                                                                                                                                                                                                     |
| **`apps/*` (future)**                               | HTTP or serverless **route handlers** that expose the **developer API**; thin: validate input, call `translation` (or a promoted package), return DTOs.                                                                                                                                                |

**Architecture:** No RC or interlink rules inside React route components; **ports** in the app, **adapters** for DCS/Git/files.

## Upstream pointers (authoritative detail)

- **[uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab)** — APIs, repo layout, resource types, migrations.
- **[docs.page — uW-Tools-Collab](https://docs.page/unfoldingWord/uW-Tools-Collab)** — browsable.
- **[Door43 Gitea API (Swagger)](https://git.door43.org/api/swagger)** — discovery and read paths for published helps.
- **Resource Container** — manifests, ingredients, linking conventions; **collab** remains source of truth.

## Open decisions (milestone issues)

Track in **GitHub issues** with acceptance criteria.

1. **API transport** — HTTP OpenAPI vs tRPC vs package-only exports for v1.
2. **Baseline language** — Always optional EN vs org-configured catalog baseline.
3. **Scope normalization** — Canonical internal form for book/passage/verse (e.g. USFM refs, aligned perf).
4. **“Expected set” rules** — Which catalog or manifest declares required help **subjects** per book; handling **optional** helps.
5. **Offline / local Git** — Same API with a “workspace” adapter vs DCS-only v1.
6. **Stale detection** — Revision / commit parity vs baseline, or presence-only v1.
7. **Catalog query defaults** — Prefer **`topic=tc-ready` without `subject`** for broad inventory; optional subject allowlist for helps-only views; **scripture identifier equivalence** (`ult`↔`glt`, etc.) for automated pairing.
8. **Authoritative source set** — Where the “pick source resources” list lives (org policy file, project DB, catalog export, issue checklist) vs implied “full catalog.”
9. **WIP vs released** — What “already translated” means on **default branch** (empty file, row count vs source, checker pass); which **tag** is the **release** baseline for comparison.

## Related internal docs

- [Ecosystem references](./01-ecosystem-references.md) — Door43, FIA, link-not-dup policy.
- [Package map](./02-package-map.md) — where code should live as the API firms up.
- [Milestones & scope](./13-milestones-and-scope.md) — milestone per slice; **Alignment** and drift.
- [Bible editor product vision](./15-bible-editor-product-vision.md) — scripture editor context; distinct from **helps production** API.

---

**Maintenance:** When upstream changes linking or catalog types, update **links** and glossary rows; put **stable TypeScript contracts** in package READMEs or an ADR when the API shape is **hard to change**.
