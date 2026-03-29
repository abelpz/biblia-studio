# `@biblia-studio/translation`

**Translation** pipeline concepts: quality checks, progress tracking, and collaboration metadata. Composes `formats` and `door43`.

This package is a **TypeScript library**, not an HTTP API: consumers **`import`** functions and run them in **Node, Deno, Workers, or the browser** (anywhere **`fetch`** reaches Door43). That supports **client-side** catalog/compare flows from the user’s device. A server-only REST layer could wrap these calls later; it is not required to use the library.

Full **signatures and types**: [Translation helps domain API](../../docs/18-translation-helps-domain-api.md).

## Translation Helps — GL→GL prototype (catalog)

For **source GL vs target GL**, compare **tc-ready** catalog rows. Every **accepted** pair is checked against the **target** repo’s **`GET .../catalog/metadata/...`** **`dublin_core.source`**: some entry must list the **source** GL **`language` + resource `identifier`**. Same **`subject` + `identifier`** on both sides only **selects** which target row to inspect; it is not enough if metadata disagrees. A second phase still pairs targets whose abbreviation differs (e.g. **`glt`** ↔ **`ult`**) using the same rule. Rows **without** catalog `owner`/`name`/ref fall back to **exact key** only (no metadata URL). **Resource-level** parity only.

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

### Explicit source list × target language

When you already know which **source** resources to check, use **`compareTcReadySourceResourcesToTarget`**: same catalog key as GL→GL, and when the **target** row has metadata coords you must pass **`sourceLanguage`** so **`dublin_core.source`** can confirm the upstream. **`includeTargetExtras`** fills **`onlyInTarget`** like full GL→GL.

```ts
import { compareTcReadySourceResourcesToTarget } from "@biblia-studio/translation";

const subset = await compareTcReadySourceResourcesToTarget({
  sourceResources: [
    { subject: "TSV Translation Notes", identifier: "tn" },
    /* or full summaries from listTcReadyTranslationHelpsResources */
  ],
  sourceLanguage: "en",
  targetLanguage: "es",
});
```

## Book matrix (`projects[].path` file inventory)

For each **matched** GL→GL tc-ready resource, fetch **catalog metadata** and **recursive `git/trees`** for **source** and **target** (`@biblia-studio/door43` **`fetchDoor43RepoGitTree`**). Collect **blob** paths under each **`manifest.projects[].path`** root, then diff **in both / source-only / target-only** (`pathsInBoth`, etc.). Scripture helps often show as single-book USFM paths; Translation Words / Academy show many paths under folder roots.

```ts
import { compareGlToGlTcReadyBookProjects } from "@biblia-studio/translation";

const matrix = await compareGlToGlTcReadyBookProjects({
  sourceLanguage: "en",
  targetLanguage: "es",
  matchedMetadataLimit: 15,
});
```

This is **repo file paths** at the catalog ref, not verse-level or per-TSV-row checks. See [Translation Helps & resources](../../docs/17-translation-helps-and-resources.md) and [domain API](../../docs/18-translation-helps-domain-api.md).

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
