import { USFM_V1_MARKER_SET } from "./allowlist.js";
import { UsfmParseError } from "./errors.js";
import type {
  UsfmChapter,
  UsfmDocument,
  UsfmParagraph,
  UsfmVerse,
} from "./types.js";
import { tokenizeUsfm, type UsfmToken } from "./tokenize.js";

function trimVerseText(s: string): string {
  return s.replace(/^[ \t\n]+/, "").replace(/[ \t\n]+$/, "");
}

function trimHeaderValue(s: string): string {
  const t = s.replace(/^[ \t\n]+/, "").replace(/[ \t\n]+$/, "");
  const line = t.split("\n")[0]?.trim() ?? "";
  return line;
}

function ensureAllowed(t: UsfmToken): void {
  const base = t.marker.endsWith("*") ? t.marker.slice(0, -1) : t.marker;
  if (!USFM_V1_MARKER_SET.has(base)) {
    throw new UsfmParseError(
      `Unsupported USFM marker "\\${t.marker}" in v1 (not in allowlist)`,
      t.offset,
    );
  }
}

/**
 * Parse USFM text into a {@link UsfmDocument}. Fails on unknown markers (strict v1).
 */
export function parseUsfm(input: string): UsfmDocument {
  const tokens = tokenizeUsfm(input);
  const doc: UsfmDocument = { chapters: [] };
  let chapter: UsfmChapter | null = null;
  let paragraph: UsfmParagraph | null = null;
  /** Text after `\\p` before the first `\\v` in that paragraph (optional intro). */
  let pendingParaIntro = "";

  for (const t of tokens) {
    ensureAllowed(t);

    switch (t.marker) {
      case "id": {
        if (doc.bookId !== undefined) {
          throw new UsfmParseError('Duplicate "\\id" marker', t.offset);
        }
        doc.bookId = trimHeaderValue(t.body);
        break;
      }
      case "ide": {
        if (doc.encoding !== undefined) {
          throw new UsfmParseError('Duplicate "\\ide" marker', t.offset);
        }
        doc.encoding = trimHeaderValue(t.body);
        break;
      }
      case "c": {
        if (t.number === undefined) {
          throw new UsfmParseError(
            'Chapter marker "\\c" requires a number',
            t.offset,
          );
        }
        chapter = { number: t.number, paragraphs: [] };
        doc.chapters.push(chapter);
        paragraph = null;
        pendingParaIntro = "";
        break;
      }
      case "p": {
        if (!chapter) {
          throw new UsfmParseError(
            'Paragraph "\\p" must follow a chapter "\\c"',
            t.offset,
          );
        }
        paragraph = { verses: [] };
        chapter.paragraphs.push(paragraph);
        pendingParaIntro = trimVerseText(t.body);
        break;
      }
      case "v": {
        if (!chapter) {
          throw new UsfmParseError(
            'Verse "\\v" must follow a chapter "\\c"',
            t.offset,
          );
        }
        if (t.number === undefined) {
          throw new UsfmParseError(
            'Verse marker "\\v" requires a number',
            t.offset,
          );
        }
        if (!paragraph) {
          paragraph = { verses: [] };
          chapter.paragraphs.push(paragraph);
          pendingParaIntro = "";
        }
        let verseText = t.body;
        if (paragraph.verses.length === 0 && pendingParaIntro.length > 0) {
          verseText =
            pendingParaIntro + (verseText.length > 0 ? " " + verseText : "");
          pendingParaIntro = "";
        }
        const verse: UsfmVerse = {
          number: t.number,
          text: trimVerseText(verseText),
        };
        paragraph.verses.push(verse);
        break;
      }
      default: {
        throw new UsfmParseError(
          `Internal: unhandled marker "\\${t.marker}"`,
          t.offset,
        );
      }
    }
  }

  return doc;
}
