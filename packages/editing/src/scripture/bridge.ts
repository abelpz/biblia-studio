import type {
  UsfmChapter,
  UsfmDocument,
  UsfmParagraph,
  UsfmVerse,
} from "@biblia-studio/formats";
import { Fragment, type Node as PMNode } from "prosemirror-model";
import { scriptureSchema } from "./schema.js";

function verseFragment(text: string): Fragment {
  if (text.length === 0) {
    return Fragment.empty;
  }
  return Fragment.from(scriptureSchema.text(text));
}

/**
 * Build a ProseMirror `doc` from a formats {@link UsfmDocument}.
 */
export function usfmDocumentToPmDoc(usfm: UsfmDocument): PMNode {
  const chapterNodes = usfm.chapters.map((ch) => chapterToPm(ch));
  return scriptureSchema.nodes.doc.create(
    {
      bookId: usfm.bookId ?? null,
      encoding: usfm.encoding ?? null,
    },
    chapterNodes.length > 0 ? Fragment.fromArray(chapterNodes) : Fragment.empty,
  );
}

function chapterToPm(ch: UsfmChapter): PMNode {
  const paras = ch.paragraphs.map((p) => paragraphToPm(p));
  return scriptureSchema.nodes.chapter.create(
    { number: ch.number },
    paras.length > 0 ? Fragment.fromArray(paras) : Fragment.empty,
  );
}

function paragraphToPm(p: UsfmParagraph): PMNode {
  const verses = p.verses.map((v) => verseToPm(v));
  return scriptureSchema.nodes.usfm_paragraph.create(
    {},
    verses.length > 0 ? Fragment.fromArray(verses) : Fragment.empty,
  );
}

function verseToPm(v: UsfmVerse): PMNode {
  return scriptureSchema.nodes.verse.create(
    { number: v.number },
    verseFragment(v.text),
  );
}

/**
 * Convert a ProseMirror `doc` (must use {@link scriptureSchema}) back to {@link UsfmDocument}.
 */
export function pmDocToUsfmDocument(node: PMNode): UsfmDocument {
  if (node.type !== scriptureSchema.nodes.doc) {
    throw new Error(`Expected scripture doc node, got "${node.type.name}"`);
  }
  const bookId = (node.attrs.bookId as string | null | undefined) ?? undefined;
  const encoding =
    (node.attrs.encoding as string | null | undefined) ?? undefined;
  const chapters: UsfmChapter[] = [];
  node.forEach((ch) => {
    if (ch.type !== scriptureSchema.nodes.chapter) {
      throw new Error(`Expected chapter node, got "${ch.type.name}"`);
    }
    const chapterNum = ch.attrs.number as number;
    const paragraphs: UsfmParagraph[] = [];
    ch.forEach((para) => {
      if (para.type !== scriptureSchema.nodes.usfm_paragraph) {
        throw new Error(
          `Expected usfm_paragraph node, got "${para.type.name}"`,
        );
      }
      const verses: UsfmVerse[] = [];
      para.forEach((v) => {
        if (v.type !== scriptureSchema.nodes.verse) {
          throw new Error(`Expected verse node, got "${v.type.name}"`);
        }
        verses.push({
          number: v.attrs.number as number,
          text: v.textContent,
        });
      });
      paragraphs.push({ verses });
    });
    chapters.push({ number: chapterNum, paragraphs });
  });
  return {
    bookId: bookId || undefined,
    encoding: encoding || undefined,
    chapters,
  };
}
