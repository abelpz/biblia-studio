import {
  door43MetadataClaimsUpstreamSource,
  fetchDoor43CatalogMetadata,
  listTcReadyTranslationHelpsResources,
  type Door43CatalogResourceSummary,
} from "@biblia-studio/door43";
import {
  type CompareGlToGlTcReadyHelpsOptions,
  type GlToGlTcReadyTranslationHelpsComparison,
  type MatchedTranslationHelpsResource,
  type MissingTranslationHelpsInTarget,
  type TranslationHelpsOnlyInTarget,
  type TranslationHelpsResourceKey,
  type TcReadyCatalogRowWithMetadataCoords,
  catalogKey as catalogKeyFromRow,
  catalogRowHasMetadataCoords,
  toPairKey,
} from "./translation-helps-gl-to-gl.js";

const KEY_SEP = "\x1e";

function catalogKeyLocal(key: TranslationHelpsResourceKey): string {
  return `${key.subject}${KEY_SEP}${key.identifier}`;
}

export type TcReadySourceResourceInput =
  | Door43CatalogResourceSummary
  | TranslationHelpsResourceKey;

export type CompareTcReadySourceResourcesToTargetOptions = Pick<
  CompareGlToGlTcReadyHelpsOptions,
  | "organization"
  | "topic"
  | "subjects"
  | "limit"
  | "fetch"
  | "lineageMetadataConcurrency"
> & {
  /** Explicit source set (order preserved for matched / missing lists). */
  sourceResources: readonly TcReadySourceResourceInput[];
  targetLanguage: string;
  /**
   * Required to verify **`dublin_core.source`** on **target** rows that have catalog metadata coords.
   * If omitted, those targets cannot be verified and are treated as **missing in target** (exact key hits only
   * count for targets **without** owner/repo/ref on the search row).
   */
  sourceLanguage?: string;
  /**
   * If true, include target tc-ready rows whose keys are not in `sourceResources`.
   * @default false
   */
  includeTargetExtras?: boolean;
};

function isFullSummary(
  input: TcReadySourceResourceInput,
): input is Door43CatalogResourceSummary {
  return "title" in input && "version" in input;
}

function stubSummary(
  key: TranslationHelpsResourceKey,
): Door43CatalogResourceSummary {
  return {
    ...key,
    title: "",
    version: "",
    description: undefined,
    bundleUrl: undefined,
  };
}

/**
 * Resolve each `sourceResources` entry to a full catalog row, preserving order.
 * Key-only entries use `sourceLanguage` catalog fetch when set, else a stub.
 */
async function resolveSourcesInOrder(
  inputs: readonly TcReadySourceResourceInput[],
  sourceLanguage: string | undefined,
  listOpts: {
    organization?: string;
    topic?: string;
    subjects?: readonly string[];
    limit?: number;
    fetch?: typeof fetch;
  },
): Promise<Door43CatalogResourceSummary[]> {
  type KeyOnlySlot = { index: number; key: TranslationHelpsResourceKey };
  const keyOnlySlots: KeyOnlySlot[] = [];
  const out: Door43CatalogResourceSummary[] = new Array(inputs.length);

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]!;
    if (isFullSummary(input)) {
      out[i] = input;
    } else {
      keyOnlySlots.push({ index: i, key: input });
    }
  }

  let sourceMap = new Map<string, Door43CatalogResourceSummary>();
  if (
    keyOnlySlots.length > 0 &&
    sourceLanguage !== undefined &&
    sourceLanguage.length > 0
  ) {
    const rows = await listTcReadyTranslationHelpsResources({
      ...listOpts,
      language: sourceLanguage,
    });
    sourceMap = new Map(rows.map((r) => [catalogKeyFromRow(r), r]));
  }

  for (const { index, key } of keyOnlySlots) {
    const k = catalogKeyLocal(key);
    out[index] = sourceMap.get(k) ?? stubSummary(key);
  }

  return out;
}

/**
 * Compare an **explicit** list of source tc-ready resources to the **full** tc-ready listing for
 * **`targetLanguage`**. When the target row has **`catalogOwner` / `catalogRepo` / `catalogRef`**, a
 * **`catalog/metadata`** fetch must confirm **`dublin_core.source`** lists **`sourceLanguage`** +
 * the source resource **`identifier`**; otherwise the row is **not** matched.
 */
export async function compareTcReadySourceResourcesToTarget(
  options: CompareTcReadySourceResourcesToTargetOptions,
): Promise<GlToGlTcReadyTranslationHelpsComparison> {
  const {
    sourceResources,
    targetLanguage,
    sourceLanguage,
    organization,
    topic,
    subjects,
    limit,
    fetch: fetchFn = globalThis.fetch,
    includeTargetExtras = false,
    lineageMetadataConcurrency,
  } = options;

  const listOpts = {
    organization,
    topic,
    subjects,
    limit,
    fetch: fetchFn,
  };

  const normalizedSources = await resolveSourcesInOrder(
    sourceResources,
    sourceLanguage,
    listOpts,
  );

  const sourceKeysInOrder: TranslationHelpsResourceKey[] = sourceResources.map(
    (input) => (isFullSummary(input) ? toPairKey(input) : input),
  );

  const targetRows = await listTcReadyTranslationHelpsResources({
    ...listOpts,
    language: targetLanguage,
  });

  const targetMap = new Map<string, Door43CatalogResourceSummary>();
  for (const r of targetRows) {
    targetMap.set(catalogKeyFromRow(r), r);
  }

  const sourceKeySet = new Set(
    sourceKeysInOrder.map((k) => catalogKeyLocal(k)),
  );

  const matched: MatchedTranslationHelpsResource[] = [];
  const missingInTarget: MissingTranslationHelpsInTarget[] = [];

  type Pending = {
    key: TranslationHelpsResourceKey;
    source: Door43CatalogResourceSummary;
    target: TcReadyCatalogRowWithMetadataCoords;
  };
  const needMetadata: Pending[] = [];

  for (let i = 0; i < sourceKeysInOrder.length; i++) {
    const key = sourceKeysInOrder[i]!;
    const source = normalizedSources[i]!;
    const k = catalogKeyLocal(key);
    const target = targetMap.get(k);

    if (!target) {
      missingInTarget.push({ key, source });
      continue;
    }

    if (!catalogRowHasMetadataCoords(target)) {
      matched.push({ key, source, target });
      continue;
    }

    if (!sourceLanguage || sourceLanguage.length === 0) {
      missingInTarget.push({ key, source });
      continue;
    }

    needMetadata.push({ key, source, target });
  }

  const concurrency = Math.max(1, lineageMetadataConcurrency ?? 8);

  for (let i = 0; i < needMetadata.length; i += concurrency) {
    const chunk = needMetadata.slice(i, i + concurrency);
    const results = await Promise.all(
      chunk.map(async (p) => {
        try {
          const metadata = await fetchDoor43CatalogMetadata({
            owner: p.target.catalogOwner,
            repo: p.target.catalogRepo,
            ref: p.target.catalogRef,
            fetch: fetchFn,
          });
          const ok = door43MetadataClaimsUpstreamSource({
            upstreamLanguage: sourceLanguage!,
            upstreamIdentifier: p.key.identifier,
            upstreamCatalogOwner: p.source.catalogOwner,
            metadata,
          });
          return { p, ok };
        } catch {
          return { p, ok: false };
        }
      }),
    );

    for (const { p, ok } of results) {
      if (ok) {
        matched.push({ key: p.key, source: p.source, target: p.target });
      } else {
        missingInTarget.push({ key: p.key, source: p.source });
      }
    }
  }

  const sortLabel = (key: TranslationHelpsResourceKey) =>
    `${key.subject}${KEY_SEP}${key.identifier}`;
  matched.sort((a, b) => sortLabel(a.key).localeCompare(sortLabel(b.key)));
  missingInTarget.sort((a, b) =>
    sortLabel(a.key).localeCompare(sortLabel(b.key)),
  );

  const onlyInTarget: TranslationHelpsOnlyInTarget[] = [];
  if (includeTargetExtras) {
    for (const [k, target] of targetMap) {
      if (!sourceKeySet.has(k)) {
        onlyInTarget.push({ key: toPairKey(target), target });
      }
    }
    onlyInTarget.sort((a, b) =>
      sortLabel(a.key).localeCompare(sortLabel(b.key)),
    );
  }

  return {
    sourceLanguage: sourceLanguage ?? "",
    targetLanguage,
    matched,
    missingInTarget,
    onlyInTarget,
  };
}
