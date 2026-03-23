/**
 * Minimal USFM document model (v1) — structural nodes only.
 * @see README.md — marker allowlist and unsupported-marker policy.
 */

export type UsfmVerse = {
  number: number;
  /** Verse text; leading/trailing whitespace normalized on parse. */
  text: string;
};

export type UsfmParagraph = {
  verses: UsfmVerse[];
};

export type UsfmChapter = {
  number: number;
  paragraphs: UsfmParagraph[];
};

export type UsfmDocument = {
  /** Book code from `\\id` (e.g. `MRK`). */
  bookId?: string;
  /** Encoding line from `\\ide` (e.g. `UTF-8`). */
  encoding?: string;
  chapters: UsfmChapter[];
};
