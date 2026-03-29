/**
 * Driven port: Translation Helps discovery via Door43 catalog (`tc-ready`), and optional GL→GL comparison.
 * Implemented by adapters calling `@biblia-studio/door43` and `@biblia-studio/translation`.
 */
export type TcReadyHelpCatalogRow = {
  identifier: string;
  subject: string;
  title: string;
  version: string;
  catalogOwner?: string;
  catalogRepo?: string;
  /** Catalog ref for metadata (often same as `version`). */
  catalogRef?: string;
  /** Door43 Gitea repo when **`catalogOwner` + `catalogRepo`** are known. */
  door43RepoUrl?: string;
  /** `GET /api/v1/catalog/metadata/{owner}/{repo}/{ref}` when coords + ref exist. */
  door43MetadataUrl?: string;
  /** Catalog zip/tarball URL when the search row includes **`zipball_url`** / **`tarball_url`**. */
  door43BundleUrl?: string;
};

export type GlToGlMatchedRow = {
  subject: string;
  identifier: string;
  sourceTitle: string;
  targetTitle: string;
  sourceDoor43RepoUrl?: string;
  sourceDoor43MetadataUrl?: string;
  sourceDoor43BundleUrl?: string;
  targetDoor43RepoUrl?: string;
  targetDoor43MetadataUrl?: string;
  targetDoor43BundleUrl?: string;
};

export type GlToGlMissingRow = {
  subject: string;
  identifier: string;
  sourceTitle: string;
  sourceDoor43RepoUrl?: string;
  sourceDoor43MetadataUrl?: string;
};

export type GlToGlOnlyTargetRow = {
  subject: string;
  identifier: string;
  targetTitle: string;
  targetDoor43RepoUrl?: string;
  targetDoor43MetadataUrl?: string;
  targetDoor43BundleUrl?: string;
};

export type GlToGlCompareSummary = {
  sourceLanguage: string;
  targetLanguage: string;
  matched: GlToGlMatchedRow[];
  missingInTarget: GlToGlMissingRow[];
  onlyInTarget: GlToGlOnlyTargetRow[];
};

/**
 * For each matched resource, repo **blob** paths under catalog **`projects[].path`** roots
 * (recursive), compared between source and target — not only top-level project identifiers.
 */
export type GlToGlBookMatrixRow = {
  subject: string;
  identifier: string;
  sourceTitle: string;
  targetTitle: string;
  pathsInBoth: string[];
  pathsOnlyInSource: string[];
  pathsOnlyInTarget: string[];
};

export type GlToGlBookMatrixSkipped = {
  subject: string;
  identifier: string;
  reason: "no_catalog_coords" | "metadata_fetch_failed";
};

export type GlToGlBookMatrixSummary = {
  sourceLanguage: string;
  targetLanguage: string;
  rows: GlToGlBookMatrixRow[];
  skipped: GlToGlBookMatrixSkipped[];
};

/**
 * Explicit source set for **`TranslationHelpsPort.compareTcReadySourceResourcesToTarget`**:
 * either **`subject` + `identifier`** or a full row from **`listTcReadyCatalog`**.
 */
export type TcReadySourceResourcePortInput =
  | Pick<TcReadyHelpCatalogRow, "subject" | "identifier">
  | TcReadyHelpCatalogRow;

/** Target catalog row whose metadata **`dublin_core.source`** claims the requested lineage. */
export type SourceFirstClaimRow = {
  identifier: string;
  subject: string;
  title: string;
  version: string;
  catalogOwner?: string;
  catalogRepo?: string;
  catalogRef?: string;
  door43RepoUrl?: string;
  door43MetadataUrl?: string;
  door43BundleUrl?: string;
  matchedSources: Array<{
    identifier: string;
    language: string;
    version: string;
  }>;
};

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

  /**
   * Compare a **caller-chosen** list of source resources to the full tc-ready catalog for **`targetLanguage`**.
   * Candidate rows must share **`subject` + `identifier`**. When the **target** row has catalog **metadata** coords,
   * **`sourceLanguage`** is **required** so **`dublin_core.source`** on the target can confirm the upstream
   * **`language` + `identifier`**. Targets **without** coords still match on catalog key only.
   */
  compareTcReadySourceResourcesToTarget(args: {
    sourceResources: readonly TcReadySourceResourcePortInput[];
    targetLanguage: string;
    sourceLanguage?: string;
    organization?: string;
    limit?: number;
    includeTargetExtras?: boolean;
  }): Promise<GlToGlCompareSummary>;

  /**
   * For **matched** GL→GL tc-ready rows, fetch catalog metadata and diff **`projects`** book identifiers
   * (see **`compareGlToGlTcReadyBookProjects`** in `@biblia-studio/translation`).
   */
  compareTcReadyGlToGlBookMatrix(args: {
    sourceLanguage: string;
    targetLanguage: string;
    organization?: string;
    limit?: number;
    /** Cap on matched pairs to scan (each uses two metadata requests). */
    matrixMatchedLimit?: number;
  }): Promise<GlToGlBookMatrixSummary>;

  /**
   * Scan tc-ready rows for **`targetLanguage`** and keep those whose metadata **`source`** matches
   * **`sourceLanguage` + `sourceIdentifier`** (optional version; **`sourceCatalogOwner`** when the manifest pins org).
   */
  findTargetsClaimingSource(args: {
    targetLanguage: string;
    sourceLanguage: string;
    sourceIdentifier: string;
    /** Catalog **`owner`** for the upstream resource; required when a matching `source` entry has `owner` / `organization`. */
    sourceCatalogOwner?: string;
    sourceVersion?: string;
    organization?: string;
    limit?: number;
  }): Promise<SourceFirstClaimRow[]>;
}
