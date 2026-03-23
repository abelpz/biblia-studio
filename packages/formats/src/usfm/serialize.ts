import type { UsfmDocument } from "./types.js";

/**
 * Serialize a {@link UsfmDocument} to USFM. Normalizes newlines to `\n`.
 */
export function serializeUsfm(doc: UsfmDocument): string {
  const lines: string[] = [];
  if (doc.bookId !== undefined) {
    lines.push(`\\id ${doc.bookId}`);
  }
  if (doc.encoding !== undefined) {
    lines.push(`\\ide ${doc.encoding}`);
  }
  for (const ch of doc.chapters) {
    lines.push(`\\c ${ch.number}`);
    for (const para of ch.paragraphs) {
      lines.push(`\\p`);
      for (const v of para.verses) {
        const text = v.text.length > 0 ? ` ${v.text}` : "";
        lines.push(`\\v ${v.number}${text}`);
      }
    }
  }
  return lines.join("\n");
}
