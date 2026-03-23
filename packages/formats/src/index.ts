/**
 * Scripture and unfoldingWord resource formats (USFM/USX, Resource Container, etc.).
 * Canonical guides: https://github.com/unfoldingWord/uW-Tools-Collab
 */
export { BIBLIA_STUDIO } from "@biblia-studio/core";
export {
  UNKNOWN_MARKER_POLICY,
  parseUsfm,
  serializeUsfm,
  tokenizeUsfm,
  USFM_V1_MARKERS,
  USFM_V1_MARKER_SET,
  UsfmParseError,
} from "./usfm/index.js";
export type {
  UsfmChapter,
  UsfmDocument,
  UsfmParagraph,
  UsfmToken,
  UsfmVerse,
  UsfmV1Marker,
} from "./usfm/index.js";
