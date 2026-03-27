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
};

export type GlToGlMatchedRow = {
  subject: string;
  identifier: string;
  sourceTitle: string;
  targetTitle: string;
};

export type GlToGlMissingRow = {
  subject: string;
  identifier: string;
  sourceTitle: string;
};

export type GlToGlOnlyTargetRow = {
  subject: string;
  identifier: string;
  targetTitle: string;
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
