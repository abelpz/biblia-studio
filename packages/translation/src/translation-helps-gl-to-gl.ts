import {
  listTcReadyTranslationHelpsResources,
  type Door43CatalogResourceSummary,
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
 * Matching uses **`subject` + `identifier`** (resource abbreviation). Book- or verse-level parity is a later phase (RC / content).
 */
export type GlToGlTcReadyTranslationHelpsComparison = {
  sourceLanguage: string;
  targetLanguage: string;
  matched: MatchedTranslationHelpsResource[];
  /** Present for source GL, no catalog row with the same subject+identifier in target GL. */
  missingInTarget: MissingTranslationHelpsInTarget[];
  /** Catalog rows in target GL with no matching source GL row (extra or different org setup). */
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
};

const KEY_SEP = "\x1e";

function catalogKey(r: Door43CatalogResourceSummary): string {
  return `${r.subject}${KEY_SEP}${r.identifier}`;
}

function toPairKey(
  r: Door43CatalogResourceSummary,
): TranslationHelpsResourceKey {
  return { subject: r.subject, identifier: r.identifier };
}

/**
 * **Prototype:** load tc-ready Translation Helps catalog entries for a **source GL** and a **target GL**, then
 * compare by **`subject` + `identifier`**. Use this for “which help *resources* exist in both gateways vs missing in target.”
 *
 * Upstream interlinking (`relation`, `rc://`, alignments) defines how content inside those resources connects; this step is
 * catalog-level only — see [uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab).
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
    fetch: fetchFn,
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
  const missingInTarget: MissingTranslationHelpsInTarget[] = [];
  for (const [k, source] of sourceMap) {
    const target = targetMap.get(k);
    if (target) {
      matched.push({ key: toPairKey(source), source, target });
    } else {
      missingInTarget.push({ key: toPairKey(source), source });
    }
  }
  const onlyInTarget: TranslationHelpsOnlyInTarget[] = [];
  for (const [k, target] of targetMap) {
    if (!sourceMap.has(k)) {
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
