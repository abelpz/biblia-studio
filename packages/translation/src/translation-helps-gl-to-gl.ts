import {
  door43MetadataClaimsUpstreamSource,
  door43MetadataSourceItemMatchesUpstream,
  door43MetadataSourceOrgNormalized,
  fetchDoor43CatalogMetadata,
  listTcReadyTranslationHelpsResources,
  type Door43CatalogMetadataSourceItem,
  type Door43CatalogResourceSummary,
  normalizeDoor43CatalogOrg,
} from "@biblia-studio/door43";

/** Stable join key for GL→GL help rows: same catalog `subject` + resource `identifier` (abbreviation). */
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

/**
 * Result of comparing **source GL** vs **target GL** tc-ready Translation Helps rows from the Door43 catalog.
 * A **matched** pair is accepted only when the **target** catalog **metadata** lists **`dublin_core.source`**
 * with **`language` + `identifier`** matching the **source** row; when a **`source`** entry includes
 * **`owner`** / **`organization`**, it must match the source row’s **`catalogOwner`**. Same rule for
 * same-abbreviation rows and lineage (e.g. **`glt`** → **`ult`**). Targets **without** owner/repo/ref fall back to **exact key**
 * only (metadata cannot be loaded).
 */
export type GlToGlTcReadyTranslationHelpsComparison = {
  sourceLanguage: string;
  targetLanguage: string;
  matched: MatchedTranslationHelpsResource[];
  /** Source row with no verified target pairing. */
  missingInTarget: MissingTranslationHelpsInTarget[];
  /** Target row with no verified source pairing. */
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
  /**
   * Max concurrent **`catalog/metadata`** requests (exact-key verification and lineage phase).
   * @default 8
   */
  lineageMetadataConcurrency?: number;
};

const KEY_SEP = "\x1e";

/** Stable string key for a catalog row (`subject` + `identifier`). */
export function catalogKey(r: Door43CatalogResourceSummary): string {
  return `${r.subject}${KEY_SEP}${r.identifier}`;
}

export function toPairKey(
  r: Door43CatalogResourceSummary,
): TranslationHelpsResourceKey {
  return { subject: r.subject, identifier: r.identifier };
}

export type TcReadyCatalogRowWithMetadataCoords =
  Door43CatalogResourceSummary & {
    catalogOwner: string;
    catalogRepo: string;
    catalogRef: string;
  };

/** True when `listTcReadyTranslationHelpsResources` row can drive **`GET .../catalog/metadata/...`**. */
export function catalogRowHasMetadataCoords(
  row: Door43CatalogResourceSummary,
): row is TcReadyCatalogRowWithMetadataCoords {
  return (
    typeof row.catalogOwner === "string" &&
    row.catalogOwner.length > 0 &&
    typeof row.catalogRepo === "string" &&
    row.catalogRepo.length > 0 &&
    typeof row.catalogRef === "string" &&
    row.catalogRef.length > 0
  );
}

/** Pick a source catalog row for this metadata `source` item (`identifier` + optional `owner`/`organization` pin). */
function findSourceForLineage(
  item: Door43CatalogMetadataSourceItem,
  targetSubject: string,
  sourceMap: Map<string, Door43CatalogResourceSummary>,
): Door43CatalogResourceSummary | undefined {
  const orgHint = door43MetadataSourceOrgNormalized(item);
  const candidates: Door43CatalogResourceSummary[] = [];
  for (const source of sourceMap.values()) {
    if (source.identifier !== item.identifier) continue;
    if (orgHint) {
      if (
        typeof source.catalogOwner !== "string" ||
        !source.catalogOwner.trim()
      ) {
        continue;
      }
      if (normalizeDoor43CatalogOrg(source.catalogOwner) !== orgHint) {
        continue;
      }
    }
    candidates.push(source);
  }
  if (candidates.length === 0) return undefined;
  if (candidates.length === 1) return candidates[0];
  const preferred = candidates.find((s) => s.subject === targetSubject);
  return preferred ?? candidates[0];
}

/**
 * Load tc-ready catalog entries for **source** and **target** GL, then pair resources when the **target** row’s
 * RC **`dublin_core.source`** names the **source GL** **`language` + `identifier`** (after fetching
 * **`/catalog/metadata/...`** when `owner` / `name` / ref exist on the target). **Exact catalog key**
 * (`subject` + `identifier`) is only a shortcut to *which* target to inspect first; it is **not** sufficient
 * without a confirming metadata **`source`** entry when coords exist. Targets **without** metadata coords still
 * use exact-key pairing only (cannot verify upstream).
 */
export async function compareGlToGlTcReadyTranslationHelps(
  options: CompareGlToGlTcReadyHelpsOptions,
): Promise<GlToGlTcReadyTranslationHelpsComparison> {
  const {
    sourceLanguage,
    targetLanguage,
    organization,
    topic,
    subjects,
    limit,
    fetch: fetchFn = globalThis.fetch,
    lineageMetadataConcurrency,
  } = options;

  const listOpts = {
    organization,
    topic,
    subjects,
    limit,
    fetch: fetchFn,
  };

  const [sourceRows, targetRows] = await Promise.all([
    listTcReadyTranslationHelpsResources({
      ...listOpts,
      language: sourceLanguage,
    }),
    listTcReadyTranslationHelpsResources({
      ...listOpts,
      language: targetLanguage,
    }),
  ]);

  const sourceMap = new Map<string, Door43CatalogResourceSummary>();
  for (const r of sourceRows) {
    sourceMap.set(catalogKey(r), r);
  }

  const targetMap = new Map<string, Door43CatalogResourceSummary>();
  for (const r of targetRows) {
    targetMap.set(catalogKey(r), r);
  }

  const matched: MatchedTranslationHelpsResource[] = [];
  const usedTargetKeys = new Set<string>();
  const sourcesPaired = new Set<string>();

  const exactNeedMetadata: {
    k: string;
    source: Door43CatalogResourceSummary;
    target: TcReadyCatalogRowWithMetadataCoords;
  }[] = [];

  for (const [k, source] of sourceMap) {
    const target = targetMap.get(k);
    if (!target) continue;
    if (catalogRowHasMetadataCoords(target)) {
      exactNeedMetadata.push({ k, source, target });
    } else {
      matched.push({ key: toPairKey(source), source, target });
      usedTargetKeys.add(k);
      sourcesPaired.add(k);
    }
  }

  exactNeedMetadata.sort((a, b) => a.k.localeCompare(b.k));

  const concurrency = Math.max(1, lineageMetadataConcurrency ?? 8);

  for (let i = 0; i < exactNeedMetadata.length; i += concurrency) {
    const chunk = exactNeedMetadata.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      chunk.map(({ k, source, target }) =>
        fetchDoor43CatalogMetadata({
          owner: target.catalogOwner,
          repo: target.catalogRepo,
          ref: target.catalogRef,
          fetch: fetchFn,
        }).then((metadata) => {
          const ok = door43MetadataClaimsUpstreamSource({
            upstreamLanguage: sourceLanguage,
            upstreamIdentifier: source.identifier,
            upstreamCatalogOwner: source.catalogOwner,
            metadata,
          });
          return { k, source, target, ok };
        }),
      ),
    );

    for (const s of settled) {
      if (s.status !== "fulfilled") continue;
      const { k, source, target, ok } = s.value;
      if (!ok || usedTargetKeys.has(k)) continue;
      matched.push({ key: toPairKey(source), source, target });
      usedTargetKeys.add(k);
      sourcesPaired.add(k);
    }
  }

  const unpairedTargets: [string, TcReadyCatalogRowWithMetadataCoords][] = [];
  for (const [k, t] of targetMap) {
    if (usedTargetKeys.has(k)) continue;
    if (catalogRowHasMetadataCoords(t)) unpairedTargets.push([k, t]);
  }
  unpairedTargets.sort(([ka], [kb]) => ka.localeCompare(kb));

  for (let i = 0; i < unpairedTargets.length; i += concurrency) {
    const chunk = unpairedTargets.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      chunk.map(([targetKey, target]) =>
        fetchDoor43CatalogMetadata({
          owner: target.catalogOwner,
          repo: target.catalogRepo,
          ref: target.catalogRef,
          fetch: fetchFn,
        }).then((metadata) => ({ targetKey, target, metadata })),
      ),
    );

    for (const s of settled) {
      if (s.status !== "fulfilled") continue;
      const { targetKey, target, metadata } = s.value;
      if (usedTargetKeys.has(targetKey)) continue;

      for (const item of metadata.dublin_core.source) {
        if (item.language !== sourceLanguage) continue;

        const source = findSourceForLineage(item, target.subject, sourceMap);
        if (!source) continue;

        if (
          !door43MetadataSourceItemMatchesUpstream(
            item,
            sourceLanguage,
            source.identifier,
            source.catalogOwner,
          )
        ) {
          continue;
        }

        const sk = catalogKey(source);
        if (sourcesPaired.has(sk)) continue;

        matched.push({
          key: toPairKey(source),
          source,
          target,
        });
        usedTargetKeys.add(targetKey);
        sourcesPaired.add(sk);
        break;
      }
    }
  }

  const missingInTarget: MissingTranslationHelpsInTarget[] = [];
  for (const [k, source] of sourceMap) {
    if (!sourcesPaired.has(k)) {
      missingInTarget.push({ key: toPairKey(source), source });
    }
  }

  const onlyInTarget: TranslationHelpsOnlyInTarget[] = [];
  for (const [k, target] of targetMap) {
    if (!usedTargetKeys.has(k)) {
      onlyInTarget.push({ key: toPairKey(target), target });
    }
  }

  const sortLabel = (key: TranslationHelpsResourceKey) =>
    `${key.subject}${KEY_SEP}${key.identifier}`;
  matched.sort((a, b) => sortLabel(a.key).localeCompare(sortLabel(b.key)));
  missingInTarget.sort((a, b) =>
    sortLabel(a.key).localeCompare(sortLabel(b.key)),
  );
  onlyInTarget.sort((a, b) => sortLabel(a.key).localeCompare(sortLabel(b.key)));

  return {
    sourceLanguage,
    targetLanguage,
    matched,
    missingInTarget,
    onlyInTarget,
  };
}
