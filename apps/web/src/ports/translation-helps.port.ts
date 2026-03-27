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

  /** Scan tc-ready rows for **`targetLanguage`** and keep those whose metadata **`source`** matches **`sourceLanguage` + `sourceIdentifier`**. */
  findTargetsClaimingSource(args: {
    targetLanguage: string;
    sourceLanguage: string;
    sourceIdentifier: string;
    sourceVersion?: string;
    organization?: string;
    limit?: number;
  }): Promise<SourceFirstClaimRow[]>;
}
