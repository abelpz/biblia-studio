import {
  fetchDoor43CatalogMetadata,
  fetchDoor43RepoGitTree,
  type Door43CatalogMetadataResponse,
  type Door43CatalogResourceSummary,
  type Door43RepoGitTreePage,
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
     * Max **matched** catalog pairs to load metadata for (each pair = two metadata calls + two git tree calls).
     * @default 15
     */
    matchedMetadataLimit?: number;
    /** Max concurrent pair batches (default 6). */
    concurrency?: number;
  };

export type MatchedTcReadyBookProjectCoverage = {
  key: TranslationHelpsResourceKey;
  sourceTitle: string;
  targetTitle: string;
  /**
   * Repo **blob** paths under each manifest **`projects[].path`** root, present in **both** repos
   * (Translation Academy / Words: every markdown file; scripture helps: e.g. `mat.usfm`).
   */
  pathsInBoth: string[];
  pathsOnlyInSource: string[];
  pathsOnlyInTarget: string[];
};

export type SkippedTcReadyBookProjectRow = {
  key: TranslationHelpsResourceKey;
  reason: "no_catalog_coords" | "metadata_fetch_failed";
};

/**
 * For each **matched** tc-ready row from {@link compareGlToGlTcReadyTranslationHelps} (exact key and/or
 * target-metadata lineage), fetch Door43 catalog **metadata** plus **recursive git trees** for source and target,
 * then diff **blob paths** that fall under manifest **`projects[].path`** roots (not only top-level project ids).
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

function normalizedManifestPath(path: string): string {
  return path.trim().replace(/^\.\//, "").replace(/\\/g, "/");
}

function blobBelongsToManifestRoots(
  blobPath: string,
  roots: string[],
): boolean {
  const p = blobPath.replace(/\\/g, "/");
  for (const root of roots) {
    if (!root) continue;
    if (p === root || p.startsWith(`${root}/`)) return true;
  }
  return false;
}

function manifestProjectRoots(
  metadata: Door43CatalogMetadataResponse,
): string[] {
  const roots: string[] = [];
  for (const proj of metadata.projects) {
    const r = normalizedManifestPath(proj.path);
    if (r) roots.push(r);
  }
  return [...new Set(roots)];
}

function sortedBlobPathsUnderRoots(
  tree: Door43RepoGitTreePage,
  roots: string[],
): string[] {
  if (roots.length === 0) return [];
  const out: string[] = [];
  for (const e of tree.tree) {
    if (e.type !== "blob") continue;
    if (!blobBelongsToManifestRoots(e.path, roots)) continue;
    out.push(e.path.replace(/\\/g, "/"));
  }
  return [...new Set(out)].sort((a, b) => a.localeCompare(b));
}

function diffPathSets(sourcePaths: string[], targetPaths: string[]) {
  const s = new Set(sourcePaths);
  const t = new Set(targetPaths);
  const inBoth: string[] = [];
  const onlyInSource: string[] = [];
  const onlyInTarget: string[] = [];
  for (const id of sourcePaths) {
    if (t.has(id)) inBoth.push(id);
    else onlyInSource.push(id);
  }
  for (const id of targetPaths) {
    if (!s.has(id)) onlyInTarget.push(id);
  }
  return {
    pathsInBoth: inBoth.sort((a, b) => a.localeCompare(b)),
    pathsOnlyInSource: onlyInSource.sort((a, b) => a.localeCompare(b)),
    pathsOnlyInTarget: onlyInTarget.sort((a, b) => a.localeCompare(b)),
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
    const [metaS, metaT, treeS, treeT] = await Promise.all([
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
      fetchDoor43RepoGitTree({
        owner: m.source.catalogOwner!,
        repo: m.source.catalogRepo!,
        ref: sRef,
        fetch: fetchFn,
      }),
      fetchDoor43RepoGitTree({
        owner: m.target.catalogOwner!,
        repo: m.target.catalogRepo!,
        ref: tRef,
        fetch: fetchFn,
      }),
    ]);
    const rootsS = manifestProjectRoots(metaS);
    const rootsT = manifestProjectRoots(metaT);
    const pathsS = sortedBlobPathsUnderRoots(treeS, rootsS);
    const pathsT = sortedBlobPathsUnderRoots(treeT, rootsT);
    const d = diffPathSets(pathsS, pathsT);
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
