/**
 * Translation workflows — checks, progress, roles, handoffs (logic layer, not full UI).
 */
export * as door43 from "@biblia-studio/door43";
export * as formats from "@biblia-studio/formats";

export const TRANSLATION_SCOPE = "@biblia-studio/translation" as const;

export {
  catalogRowHasMetadataCoords,
  compareGlToGlTcReadyTranslationHelps,
  type CompareGlToGlTcReadyHelpsOptions,
  type GlToGlTcReadyTranslationHelpsComparison,
  type MatchedTranslationHelpsResource,
  type MissingTranslationHelpsInTarget,
  type TcReadyCatalogRowWithMetadataCoords,
  type TranslationHelpsOnlyInTarget,
  type TranslationHelpsResourceKey,
} from "./translation-helps-gl-to-gl.js";
export {
  findTargetCatalogEntriesClaimingSource,
  type FindTargetCatalogEntriesClaimingSourceOptions,
  type TargetCatalogEntryClaimingSource,
} from "./translation-helps-source-first.js";
export {
  compareGlToGlTcReadyBookProjects,
  type CompareGlToGlTcReadyBookProjectsOptions,
  type GlToGlTcReadyBookProjectsResult,
  type MatchedTcReadyBookProjectCoverage,
  type SkippedTcReadyBookProjectRow,
} from "./translation-helps-book-matrix-gl.js";
export {
  compareTcReadySourceResourcesToTarget,
  type CompareTcReadySourceResourcesToTargetOptions,
  type TcReadySourceResourceInput,
} from "./translation-helps-source-set-to-target.js";
