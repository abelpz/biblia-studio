/**
 * Translation workflows — checks, progress, roles, handoffs (logic layer, not full UI).
 */
export * as door43 from "@biblia-studio/door43";
export * as formats from "@biblia-studio/formats";

export const TRANSLATION_SCOPE = "@biblia-studio/translation" as const;

export {
  compareGlToGlTcReadyTranslationHelps,
  type CompareGlToGlTcReadyHelpsOptions,
  type GlToGlTcReadyTranslationHelpsComparison,
  type MatchedTranslationHelpsResource,
  type MissingTranslationHelpsInTarget,
  type TranslationHelpsOnlyInTarget,
  type TranslationHelpsResourceKey,
} from "./translation-helps-gl-to-gl.js";
export {
  findTargetCatalogEntriesClaimingSource,
  type FindTargetCatalogEntriesClaimingSourceOptions,
  type TargetCatalogEntryClaimingSource,
} from "./translation-helps-source-first.js";
