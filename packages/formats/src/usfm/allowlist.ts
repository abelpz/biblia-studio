/**
 * v1 USFM marker allowlist — expand only with fixtures + round-trip tests.
 * @see docs/15-bible-editor-product-vision.md
 */

/** Lowercase marker names (without leading `\\` or trailing `*`). */
export const USFM_V1_MARKERS = ["id", "ide", "c", "p", "v"] as const;

export type UsfmV1Marker = (typeof USFM_V1_MARKERS)[number];

export const USFM_V1_MARKER_SET: ReadonlySet<string> = new Set(USFM_V1_MARKERS);

/**
 * **Strict parse (default):** any marker not in {@link USFM_V1_MARKERS} causes
 * {@link UsfmParseError}. We do not silently drop or rewrite unknown USFM.
 *
 * Future options (not implemented): lenient mode with explicit lossy rules.
 */
export const UNKNOWN_MARKER_POLICY =
  "strict: unsupported markers fail parse; extend USFM_V1_MARKERS + tests to add markers." as const;
