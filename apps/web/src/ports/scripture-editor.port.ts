import type { UsfmDocument } from "@biblia-studio/formats";

/** Driven port: parse/serialize USFM for the scripture editor (hexagonal boundary). */
export type ScriptureEditorPort = {
  parseUsfm(usfm: string): UsfmDocument;
  serializeUsfm(doc: UsfmDocument): string;
};
