import { describe, expect, it } from "vitest";
import { parseUsfm, serializeUsfm } from "@biblia-studio/formats";
import { pmDocToUsfmDocument, usfmDocumentToPmDoc } from "./bridge.js";

describe("scripture bridge", () => {
  it("round-trips UsfmDocument → PM doc → UsfmDocument (fixtures)", () => {
    const raw = `\\id MRK
\\c 1
\\p
\\v 1 Hello
\\v 2 World`;
    const doc = parseUsfm(raw);
    const pm = usfmDocumentToPmDoc(doc);
    const back = pmDocToUsfmDocument(pm);
    expect(back).toEqual(doc);
  });

  it("matches formats serialize after PM round-trip", () => {
    const raw = `\\id MRK
\\ide UTF-8
\\c 1
\\p
\\v 1 Alpha`;
    const doc = parseUsfm(raw);
    const pm = usfmDocumentToPmDoc(doc);
    const back = pmDocToUsfmDocument(pm);
    expect(serializeUsfm(back)).toBe(serializeUsfm(doc));
  });
});
