import {
  fetchDoor43CatalogMetadata,
  listTcReadyTranslationHelpsResources,
  type Door43CatalogMetadataResponse,
  type Door43CatalogMetadataSourceItem,
  type Door43CatalogResourceSummary,
} from "@biblia-studio/door43";

export type FindTargetCatalogEntriesClaimingSourceOptions = {
  targetLanguage: string;
  /** Source lineage: catalog `language` + resource `identifier` (e.g. `en` + `tn`). */
  sourceLanguage: string;
  sourceIdentifier: string;
  /** If set, a `dublin_core.source` item must match this `version` string. */
  sourceVersion?: string;
  organization?: string;
  topic?: string;
  subjects?: readonly string[];
  limit?: number;
  fetch?: typeof fetch;
  /** Max concurrent metadata requests (default 8). */
  concurrency?: number;
};

export type TargetCatalogEntryClaimingSource = {
  summary: Door43CatalogResourceSummary;
  metadata: Door43CatalogMetadataResponse;
  matchedSources: Door43CatalogMetadataSourceItem[];
};

type CatalogCoords = Door43CatalogResourceSummary & {
  catalogOwner: string;
  catalogRepo: string;
  catalogRef: string;
};

function hasCatalogCoords(
  row: Door43CatalogResourceSummary,
): row is CatalogCoords {
  return (
    typeof row.catalogOwner === "string" &&
    row.catalogOwner.length > 0 &&
    typeof row.catalogRepo === "string" &&
    row.catalogRepo.length > 0 &&
    typeof row.catalogRef === "string" &&
    row.catalogRef.length > 0
  );
}

function sourceItemMatches(
  item: Door43CatalogMetadataSourceItem,
  sourceLanguage: string,
  sourceIdentifier: string,
  sourceVersion: string | undefined,
): boolean {
  if (
    item.language !== sourceLanguage ||
    item.identifier !== sourceIdentifier
  ) {
    return false;
  }
  if (sourceVersion === undefined || sourceVersion.length === 0) {
    return true;
  }
  return item.version === sourceVersion;
}

/**
 * **Source-first:** list **target** tc-ready catalog rows, fetch **`GET /api/v1/catalog/metadata/...`** for each row
 * that includes **`owner` + `name` + ref**, and return rows whose **`dublin_core.source`** claims the given
 * **`sourceLanguage` + `sourceIdentifier`** (optional **`sourceVersion`**).
 *
 * Rows without catalog coordinates are skipped (cannot call metadata). Metadata fetch failures for a row are skipped
 * (no entry in the result).
 */
export async function findTargetCatalogEntriesClaimingSource(
  options: FindTargetCatalogEntriesClaimingSourceOptions,
): Promise<TargetCatalogEntryClaimingSource[]> {
  const fetchFn = options.fetch ?? globalThis.fetch;
  const rows = await listTcReadyTranslationHelpsResources({
    language: options.targetLanguage,
    organization: options.organization,
    topic: options.topic,
    subjects: options.subjects,
    limit: options.limit,
    fetch: fetchFn,
  });

  const withCoords = rows.filter(hasCatalogCoords);
  const concurrency = Math.max(1, options.concurrency ?? 8);
  const out: TargetCatalogEntryClaimingSource[] = [];

  for (let i = 0; i < withCoords.length; i += concurrency) {
    const chunk = withCoords.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      chunk.map((row) =>
        fetchDoor43CatalogMetadata({
          owner: row.catalogOwner,
          repo: row.catalogRepo,
          ref: row.catalogRef,
          fetch: fetchFn,
        }).then((metadata) => ({ row, metadata })),
      ),
    );
    for (const s of settled) {
      if (s.status !== "fulfilled") continue;
      const { row, metadata } = s.value;
      const matched = metadata.dublin_core.source.filter((item) =>
        sourceItemMatches(
          item,
          options.sourceLanguage,
          options.sourceIdentifier,
          options.sourceVersion,
        ),
      );
      if (matched.length > 0) {
        out.push({ summary: row, metadata, matchedSources: matched });
      }
    }
  }

  out.sort((a, b) => {
    const ka = `${a.summary.subject}\x1e${a.summary.identifier}`;
    const kb = `${b.summary.subject}\x1e${b.summary.identifier}`;
    return ka.localeCompare(kb);
  });

  return out;
}
