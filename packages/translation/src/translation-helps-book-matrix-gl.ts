import {
  fetchDoor43CatalogMetadata,
  type Door43CatalogResourceSummary,
} from "@biblia-studio/door43";
import {
  compareGlToGlTcReadyTranslationHelps,
  type CompareGlToGlTcReadyHelpsOptions,
  type GlToGlTcReadyTranslationHelpsComparison,
  type MatchedTranslationHelpsResource,
  type TranslationHelpsResourceKey,
} from "./translation-helps-gl-to-gl.js";

export type CompareGlToGlTcReadyBookProjectsOptions =
  CompareGlToGlTcReadyHelpsOptions & {
    /**
     * Max **matched** catalog pairs to load metadata for (each pair = two metadata calls).
     * @default 15
     */
    matchedMetadataLimit?: number;
    /** Max concurrent metadata requests (default 6). */
    concurrency?: number;
  };

export type MatchedTcReadyBookProjectCoverage = {
  key: TranslationHelpsResourceKey;
  sourceTitle: string;
  targetTitle: string;
  /** Book ids present in **both** manifests (`projects[].identifier`), sorted. */
  bookIdsInBoth: string[];
  /** Book ids only on **source** metadata. */
  bookIdsOnlyInSource: string[];
  /** Book ids only on **target** metadata. */
  bookIdsOnlyInTarget: string[];
};

export type SkippedTcReadyBookProjectRow = {
  key: TranslationHelpsResourceKey;
  reason: "no_catalog_coords" | "metadata_fetch_failed";
};

/**
 * For each **matched** tc-ready row (same `subject` + `identifier` in both GLs), fetch Door43 catalog
 * **metadata** for **source** and **target** and diff **`projects`** book identifiers — a minimal **book × resource**
 * slice (one row per matched *resource*, book lists show scripture/book coverage declared in the RC manifest).
 */
export type GlToGlTcReadyBookProjectsResult = {
  sourceLanguage: string;
  targetLanguage: string;
  matched: MatchedTcReadyBookProjectCoverage[];
  skipped: SkippedTcReadyBookProjectRow[];
};

function hasCatalogCoords(row: Door43CatalogResourceSummary): boolean {
  return (
    typeof row.catalogOwner === "string" &&
    row.catalogOwner.length > 0 &&
    typeof row.catalogRepo === "string" &&
    row.catalogRepo.length > 0 &&
    typeof row.catalogRef === "string" &&
    row.catalogRef.length > 0
  );
}

function refForMetadata(row: Door43CatalogResourceSummary): string | undefined {
  if (row.catalogRef && row.catalogRef.length > 0) {
    return row.catalogRef;
  }
  return row.version.length > 0 ? row.version : undefined;
}

function bookIdsFromProjects(metadata: {
  projects: { identifier: string }[];
}): string[] {
  const ids = metadata.projects
    .map((p) => p.identifier)
    .filter((id) => id.length > 0);
  return [...new Set(ids)].sort((a, b) => a.localeCompare(b));
}

function diffBookSets(sourceIds: string[], targetIds: string[]) {
  const s = new Set(sourceIds);
  const t = new Set(targetIds);
  const inBoth: string[] = [];
  const onlyInSource: string[] = [];
  const onlyInTarget: string[] = [];
  for (const id of sourceIds) {
    if (t.has(id)) inBoth.push(id);
    else onlyInSource.push(id);
  }
  for (const id of targetIds) {
    if (!s.has(id)) onlyInTarget.push(id);
  }
  return {
    bookIdsInBoth: inBoth.sort((a, b) => a.localeCompare(b)),
    bookIdsOnlyInSource: onlyInSource.sort((a, b) => a.localeCompare(b)),
    bookIdsOnlyInTarget: onlyInTarget.sort((a, b) => a.localeCompare(b)),
  };
}

async function coverageForPair(
  m: MatchedTranslationHelpsResource,
  fetchFn: typeof fetch,
): Promise<
  | { ok: true; value: MatchedTcReadyBookProjectCoverage }
  | { ok: false; reason: SkippedTcReadyBookProjectRow["reason"] }
> {
  if (!hasCatalogCoords(m.source) || !hasCatalogCoords(m.target)) {
    return { ok: false, reason: "no_catalog_coords" };
  }
  const sRef = refForMetadata(m.source)!;
  const tRef = refForMetadata(m.target)!;
  try {
    const [metaS, metaT] = await Promise.all([
      fetchDoor43CatalogMetadata({
        owner: m.source.catalogOwner!,
        repo: m.source.catalogRepo!,
        ref: sRef,
        fetch: fetchFn,
      }),
      fetchDoor43CatalogMetadata({
        owner: m.target.catalogOwner!,
        repo: m.target.catalogRepo!,
        ref: tRef,
        fetch: fetchFn,
      }),
    ]);
    const sb = bookIdsFromProjects(metaS);
    const tb = bookIdsFromProjects(metaT);
    const d = diffBookSets(sb, tb);
    return {
      ok: true,
      value: {
        key: m.key,
        sourceTitle: m.source.title,
        targetTitle: m.target.title,
        ...d,
      },
    };
  } catch {
    return { ok: false, reason: "metadata_fetch_failed" };
  }
}

export async function compareGlToGlTcReadyBookProjects(
  options: CompareGlToGlTcReadyBookProjectsOptions,
): Promise<GlToGlTcReadyBookProjectsResult> {
  const fetchFn = options.fetch ?? globalThis.fetch;
  const limit = Math.min(40, Math.max(1, options.matchedMetadataLimit ?? 15));
  const concurrency = Math.max(1, options.concurrency ?? 6);

  const {
    sourceLanguage,
    targetLanguage,
    matched: allMatched,
  }: GlToGlTcReadyTranslationHelpsComparison = await compareGlToGlTcReadyTranslationHelps(
    options,
  );

  const matchedSlice = allMatched.slice(0, limit);
  const matched: MatchedTcReadyBookProjectCoverage[] = [];
  const skipped: SkippedTcReadyBookProjectRow[] = [];

  for (let i = 0; i < matchedSlice.length; i += concurrency) {
    const chunk = matchedSlice.slice(i, i + concurrency);
    const results = await Promise.all(
      chunk.map((m) => coverageForPair(m, fetchFn)),
    );
    for (let j = 0; j < results.length; j++) {
      const r = results[j]!;
      const pair = chunk[j]!;
      if (r.ok) {
        matched.push(r.value);
      } else {
        skipped.push({ key: pair.key, reason: r.reason });
      }
    }
  }

  return { sourceLanguage, targetLanguage, matched, skipped };
}
