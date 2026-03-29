# Translation Helps — domain API (TypeScript library)

**Audience:** humans and agents implementing or extending Translation Helps discovery. This document is the **contract reference** for `@biblia-studio/door43`, `@biblia-studio/translation`, and the **`TranslationHelpsPort`** in `apps/web`—not a substitute for upstream Door43 [swagger.v1.json](https://git.door43.org/swagger.v1.json).

**Browse in the web app:** when you run `apps/web` from this monorepo, open **`/docs/translation-helps-api`** (e.g. `http://localhost:3000/docs/translation-helps-api`) — it renders **this** markdown file from disk at build/request time. Deployments that omit the repo `docs/` tree may show a fallback; the file in version control stays the **source of truth**.

## Library API, not an HTTP server API

The **primary developer surface** is a **TypeScript / JavaScript library**: install or link **`@biblia-studio/door43`** and **`@biblia-studio/translation`**, `import` the functions, and run them wherever **`fetch`** is available. That includes **the browser on the user’s device**, so catalog search, metadata fetches, and GL→GL-style comparisons can run **client-side** without Biblia Studio exposing a REST or RPC server.

- **Source of truth for behavior** — the function signatures and types in those packages (and summarized below).
- **`TranslationHelpsPort`** in `apps/web` — a **hexagonal seam** for the Next.js app (DTO shaping + testability), **not** a public HTTP contract.
- **Server-side or HTTP later** — optional. A future route or microservice could **wrap** the same library (e.g. to proxy Door43, add auth, or rate-limit); it would not redefine the core API.

**Workflow:** Align with [New initiative workflow](./11-new-project-workflow.md) (sketch → probe → name seams → promote → record), [Hexagonal apps](./05-hexagonal-apps.md) (ports in apps, logic in packages), and product intent in [Translation helps & resources](./17-translation-helps-and-resources.md). After shipping behavior, update this page and [`02-package-map.md`](./02-package-map.md) so signatures stay true.

---

## 1. Why this API shape exists

| Layer                                 | Role                                                                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **`@biblia-studio/door43`**           | **`fetch`** to Door43: catalog **search**, catalog **metadata**, repo search. **No** GL pairing rules.                                        |
| **`@biblia-studio/translation`**      | **Orchestration**: combine catalog rows and metadata into **comparisons** (GL→GL, source-first, book matrix). Safe to run in browser or Node. |
| **`apps/web` `TranslationHelpsPort`** | **Application port** for the web app: DTOs the UI needs; adapter calls `door43` + `translation`.                                              |

**Matched source/target pairs** require **`dublin_core.source`** to list the upstream **`language` + `identifier`**. When an entry includes **`owner`** or **`organization`**, it must match the **source** row’s catalog **`owner`** (see **`door43MetadataClaimsUpstreamSource`**, **`normalizeDoor43CatalogOrg`** in **`@biblia-studio/door43`**). GL→GL uses same-key rows as **candidates**, then verifies metadata (including org pins in lineage). Catalog rows **without** `owner` / `name` / ref cannot be verified and still pair on **exact key** only. **Source-first** uses **`findTargetCatalogEntriesClaimingSource`** / optional **`sourceCatalogOwner`**. **Book lists** use **`projects[].identifier`**.

---

## 2. Explicit source resource set → target language (**shipped**)

**Problem solved:** `compareGlToGlTcReadyTranslationHelps` loads **all** tc-ready rows for a source language. **`compareTcReadySourceResourcesToTarget`** takes a **caller-chosen** list of sources (full catalog rows or **`subject` + `identifier`** keys) and one **`targetLanguage`**, then returns the same **matched / missingInTarget / onlyInTarget** shape as full GL→GL (`GlToGlTcReadyTranslationHelpsComparison`).

**Semantics:**

- **Catalog key:** `subject` + `identifier` picks the **target** row; duplicate keys in the target catalog still **overwrite** in the internal map (last row wins).
- **Metadata:** if the **target** has **`catalogOwner` / `catalogRepo` / `catalogRef`**, a **`catalog/metadata`** fetch must confirm **`dublin_core.source`** lists **`sourceLanguage`** + that **`identifier`**; otherwise the row is **missingInTarget**. Set **`sourceLanguage`** whenever targets have coords (key-only sources use it for the source catalog fetch too).
- **onlyInTarget:** populated only when **`includeTargetExtras`** is true.
- **Key-only sources:** if **`sourceLanguage`** is set, one source-language catalog fetch fills titles/coords when possible; otherwise a **stub** summary (empty title/version) is used — and targets **with coords** will not verify without **`sourceLanguage`**.

**Port:** `TranslationHelpsPort.compareTcReadySourceResourcesToTarget` → DTO `GlToGlCompareSummary`. **`TcReadySourceResourcePortInput`** = `Pick<TcReadyHelpCatalogRow,"subject"|"identifier">` | `TcReadyHelpCatalogRow`.

**Source:** `packages/translation/src/translation-helps-source-set-to-target.ts`.

**Not in scope:** verse-level parity, ingredient diffs, tag vs `master` (see [doc 17](./17-translation-helps-and-resources.md)).

---

## 3. `@biblia-studio/door43` — functions & types

### 3.1 Catalog search (`src/catalog.ts`)

```ts
export type Door43CatalogResourceSummary = {
  identifier: string;
  subject: string;
  title: string;
  version: string;
  description: string | undefined;
  bundleUrl: string | undefined;
  catalogOwner?: string;
  catalogRepo?: string;
  catalogRef?: string;
};

export type ListTcReadyHelpsOptions = {
  language: string;
  topic?: string;
  organization?: string;
  subjects?: readonly string[];
  limit?: number;
  fetch?: typeof fetch;
};

export const DEFAULT_TC_READY_HELP_SUBJECTS: readonly string[];

export function buildCatalogUrl(filters: {
  lang: string;
  topic: string;
  organization?: string;
  subject?: string;
  limit?: number;
}): string;

export function listTcReadyTranslationHelpsResources(
  options: ListTcReadyHelpsOptions,
): Promise<Door43CatalogResourceSummary[]>;
```

### 3.2 Catalog metadata (`src/catalog-metadata.ts`)

```ts
export type Door43CatalogMetadataSourceItem = {
  identifier: string;
  language: string;
  version: string;
  owner?: string;
  organization?: string;
};

export type Door43CatalogDublinCoreSummary = {
  identifier: string;
  subject: string;
  version: string;
  type: string | undefined;
  source: Door43CatalogMetadataSourceItem[];
  relation: string[];
};

export type Door43CatalogProjectRow = {
  identifier: string;
  path: string;
  title: string | undefined;
  sort: number | undefined;
};

export type Door43CatalogMetadataResponse = {
  dublin_core: Door43CatalogDublinCoreSummary;
  projects: Door43CatalogProjectRow[];
};

export type FetchDoor43CatalogMetadataOptions = {
  owner: string;
  repo: string;
  ref: string;
  host?: string;
  fetch?: typeof fetch;
};

export function buildCatalogMetadataUrl(options: {
  owner: string;
  repo: string;
  ref: string;
  host?: string;
}): string;

export function fetchDoor43CatalogMetadata(
  options: FetchDoor43CatalogMetadataOptions,
): Promise<Door43CatalogMetadataResponse>;

export function parseCatalogMetadata(
  body: unknown,
): Door43CatalogMetadataResponse;

export function normalizeDoor43CatalogOrg(name: string): string;

export function door43MetadataSourceOrgNormalized(
  item: Door43CatalogMetadataSourceItem,
): string | undefined;

export function door43MetadataSourceItemMatchesUpstream(
  item: Door43CatalogMetadataSourceItem,
  upstreamLanguage: string,
  upstreamIdentifier: string,
  upstreamCatalogOwner: string | undefined,
): boolean;

/** True if some `metadata.dublin_core.source` entry matches the upstream row (language, id, optional org pin). */
export function door43MetadataClaimsUpstreamSource(options: {
  upstreamLanguage: string;
  upstreamIdentifier: string;
  upstreamCatalogOwner?: string;
  metadata: Door43CatalogMetadataResponse;
}): boolean;
```

### 3.3 Repo search (`src/repos-search.ts`) — ancillary

```ts
export type Door43RepoSummary = {
  fullName: string;
  name: string;
  htmlUrl: string;
};

export const DOOR43_REPO_SEARCH_DEFAULT_QUERY: "unfoldingWord";

export function searchDoor43Repos(options?: {
  host?: string;
  query?: string;
  limit?: number;
}): Promise<Door43RepoSummary[]>;
```

---

## 4. `@biblia-studio/translation` — functions & types

### 4.1 GL→GL tc-loaded compare (`src/translation-helps-gl-to-gl.ts`) — **shipped**

**Pairing:** candidates share **`subject` + `identifier`** (then lineage). Each **target** with metadata coords must pass **`door43MetadataClaimsUpstreamSource`** (including **`upstreamCatalogOwner`** when manifests pin org). **`lineageMetadataConcurrency`** caps concurrent **`catalog/metadata`** requests (default 8).

```ts
export type TranslationHelpsResourceKey = {
  subject: string;
  identifier: string;
};

export type MatchedTranslationHelpsResource = {
  key: TranslationHelpsResourceKey;
  source: Door43CatalogResourceSummary;
  target: Door43CatalogResourceSummary;
};

export type MissingTranslationHelpsInTarget = {
  key: TranslationHelpsResourceKey;
  source: Door43CatalogResourceSummary;
};

export type TranslationHelpsOnlyInTarget = {
  key: TranslationHelpsResourceKey;
  target: Door43CatalogResourceSummary;
};

export type GlToGlTcReadyTranslationHelpsComparison = {
  sourceLanguage: string;
  targetLanguage: string;
  matched: MatchedTranslationHelpsResource[];
  missingInTarget: MissingTranslationHelpsInTarget[];
  onlyInTarget: TranslationHelpsOnlyInTarget[];
};

export type CompareGlToGlTcReadyHelpsOptions = {
  sourceLanguage: string;
  targetLanguage: string;
  organization?: string;
  topic?: string;
  subjects?: readonly string[];
  limit?: number;
  fetch?: typeof fetch;
  /** Max concurrent target-metadata fetches for lineage pairing; default 8 */
  lineageMetadataConcurrency?: number;
};

export async function compareGlToGlTcReadyTranslationHelps(
  options: CompareGlToGlTcReadyHelpsOptions,
): Promise<GlToGlTcReadyTranslationHelpsComparison>;
```

### 4.2 Book matrix from matched pairs (`src/translation-helps-book-matrix-gl.ts`) — **shipped**

```ts
export type CompareGlToGlTcReadyBookProjectsOptions =
  CompareGlToGlTcReadyHelpsOptions & {
    matchedMetadataLimit?: number;
    concurrency?: number;
  };

export type MatchedTcReadyBookProjectCoverage = {
  key: TranslationHelpsResourceKey;
  sourceTitle: string;
  targetTitle: string;
  bookIdsInBoth: string[];
  bookIdsOnlyInSource: string[];
  bookIdsOnlyInTarget: string[];
};

export type SkippedTcReadyBookProjectRow = {
  key: TranslationHelpsResourceKey;
  reason: "no_catalog_coords" | "metadata_fetch_failed";
};

export type GlToGlTcReadyBookProjectsResult = {
  sourceLanguage: string;
  targetLanguage: string;
  matched: MatchedTcReadyBookProjectCoverage[];
  skipped: SkippedTcReadyBookProjectRow[];
};

export function compareGlToGlTcReadyBookProjects(
  options: CompareGlToGlTcReadyBookProjectsOptions,
): Promise<GlToGlTcReadyBookProjectsResult>;
```

### 4.3 Source-first metadata scan (`src/translation-helps-source-first.ts`) — **shipped**

```ts
export type FindTargetCatalogEntriesClaimingSourceOptions = {
  targetLanguage: string;
  sourceLanguage: string;
  sourceIdentifier: string;
  sourceCatalogOwner?: string;
  sourceVersion?: string;
  organization?: string;
  topic?: string;
  subjects?: readonly string[];
  limit?: number;
  fetch?: typeof fetch;
  concurrency?: number;
};

export type TargetCatalogEntryClaimingSource = {
  summary: Door43CatalogResourceSummary;
  metadata: Door43CatalogMetadataResponse;
  matchedSources: Door43CatalogMetadataSourceItem[];
};

export function findTargetCatalogEntriesClaimingSource(
  options: FindTargetCatalogEntriesClaimingSourceOptions,
): Promise<TargetCatalogEntryClaimingSource[]>;
```

### 4.4 Explicit source set → target (`src/translation-helps-source-set-to-target.ts`) — **shipped**

```ts
export type TcReadySourceResourceInput =
  | Door43CatalogResourceSummary
  | TranslationHelpsResourceKey;

export type CompareTcReadySourceResourcesToTargetOptions = Pick<
  CompareGlToGlTcReadyHelpsOptions,
  "organization" | "topic" | "subjects" | "limit" | "fetch"
> & {
  sourceResources: readonly TcReadySourceResourceInput[];
  targetLanguage: string;
  sourceLanguage?: string;
  includeTargetExtras?: boolean;
};

export function compareTcReadySourceResourcesToTarget(
  options: CompareTcReadySourceResourcesToTargetOptions,
): Promise<GlToGlTcReadyTranslationHelpsComparison>;
```

See [section 2](#2-explicit-source-resource-set--target-language-shipped).

---

## 5. `apps/web` — `TranslationHelpsPort` — **shipped**

**File:** `apps/web/src/ports/translation-helps.port.ts`

DTOs (abbreviated names; see source for full field comments):

- `TcReadyHelpCatalogRow`
- `GlToGlMatchedRow`, `GlToGlMissingRow`, `GlToGlOnlyTargetRow`, `GlToGlCompareSummary`
- `GlToGlBookMatrixRow`, `GlToGlBookMatrixSkipped`, `GlToGlBookMatrixSummary`
- `SourceFirstClaimRow`
- `TcReadySourceResourcePortInput`

**Interface:**

```ts
export interface TranslationHelpsPort {
  listTcReadyCatalog(args: {
    language: string;
    organization?: string;
    limit?: number;
  }): Promise<TcReadyHelpCatalogRow[]>;

  compareTcReadyGlToGl(args: {
    sourceLanguage: string;
    targetLanguage: string;
    organization?: string;
    limit?: number;
  }): Promise<GlToGlCompareSummary>;

  compareTcReadySourceResourcesToTarget(args: {
    sourceResources: readonly TcReadySourceResourcePortInput[];
    targetLanguage: string;
    sourceLanguage?: string;
    organization?: string;
    limit?: number;
    includeTargetExtras?: boolean;
  }): Promise<GlToGlCompareSummary>;

  compareTcReadyGlToGlBookMatrix(args: {
    sourceLanguage: string;
    targetLanguage: string;
    organization?: string;
    limit?: number;
    matrixMatchedLimit?: number;
  }): Promise<GlToGlBookMatrixSummary>;

  findTargetsClaimingSource(args: {
    targetLanguage: string;
    sourceLanguage: string;
    sourceIdentifier: string;
    sourceVersion?: string;
    organization?: string;
    limit?: number;
  }): Promise<SourceFirstClaimRow[]>;
}
```

**Adapter:** `apps/web/src/adapters/driven/translation-helps.adapter.ts` maps port calls to `@biblia-studio/translation` + `door43`.

---

## 6. Traceability

| Capability                                     | Package / port                                        | Status                                       |
| ---------------------------------------------- | ----------------------------------------------------- | -------------------------------------------- |
| tc-ready listing                               | `listTcReadyTranslationHelpsResources`                | Shipped                                      |
| GL × GL full catalogs                          | `compareGlToGlTcReadyTranslationHelps`                | Shipped                                      |
| Book IDs in matched pairs                      | `compareGlToGlTcReadyBookProjects`                    | Shipped                                      |
| Target rows claiming `dublin_core.source`      | `findTargetCatalogEntriesClaimingSource`              | Shipped                                      |
| **Explicit source list × target lang**         | `compareTcReadySourceResourcesToTarget` + port method | Shipped                                      |
| Optional HTTP / server facade over the library | Not shipped                                           | Future: thin wrapper, same TS API underneath |

---

## 7. Agent checklist (when this API changes)

1. Update **this doc** — signatures in §3–§5 must match `door43` / `translation` / port sources.
2. Update **tests** in `packages/translation` and `apps/web` adapter mocks.
3. Update [`packages/translation/README.md`](../packages/translation/README.md) and [`17-translation-helps-and-resources.md`](./17-translation-helps-and-resources.md) if behavior is user-visible.
4. Add an ADR if duplicate-target or key-only enrichment policy changes materially ([ADR guide](./adr/README.md)).
