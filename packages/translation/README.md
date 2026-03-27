# `@biblia-studio/translation`

**Translation** pipeline concepts: quality checks, progress tracking, and collaboration metadata. Composes `formats` and `door43`.

## Translation Helps — GL→GL prototype (catalog)

For **source GL vs target GL**, compare which **tc-ready** Translation Helps resources appear in the Door43 catalog for each language. Rows are matched by **`subject` + `identifier`** (resource abbreviation). This is **resource-level** parity only; verse/book coverage inside those repos is not analyzed here.

```ts
import { compareGlToGlTcReadyTranslationHelps } from "@biblia-studio/translation";

const result = await compareGlToGlTcReadyTranslationHelps({
  sourceLanguage: "en",
  targetLanguage: "es",
  organization: "unfoldingWord",
});

for (const m of result.missingInTarget) {
  console.log("Missing in target:", m.key.subject, m.key.identifier);
}
```

## Book matrix (metadata `projects`, v0)

For each **matched** GL→GL tc-ready resource, fetch **catalog metadata** for **source** and **target** and diff **`manifest.projects`** book identifiers (`projects[].identifier`):

```ts
import { compareGlToGlTcReadyBookProjects } from "@biblia-studio/translation";

const matrix = await compareGlToGlTcReadyBookProjects({
  sourceLanguage: "en",
  targetLanguage: "es",
  matchedMetadataLimit: 15,
});
```

This does **not** inspect ingredient files (TSV rows, etc.); it is **manifest book lists** only. See [Translation Helps & resources](../../docs/17-translation-helps-and-resources.md).

## Source-first pairing (metadata `source`)

After listing target **`tc-ready`** rows (with **`owner` / `name` / ref** on each entry), resolve which targets **claim** a given source resource via **`dublin_core.source`** (`identifier` + `language`, optional version):

```ts
import { findTargetCatalogEntriesClaimingSource } from "@biblia-studio/translation";

const claiming = await findTargetCatalogEntriesClaimingSource({
  targetLanguage: "es-419",
  sourceLanguage: "en",
  sourceIdentifier: "tn",
  organization: "es-419_gl",
});
```

Low-level catalog + metadata: `listTcReadyTranslationHelpsResources`, `fetchDoor43CatalogMetadata` from `@biblia-studio/door43` (or the `door43` namespace export from this package).

See [Translation Helps & resources](../../docs/17-translation-helps-and-resources.md) and [uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab) for upstream resource and interlink semantics.
