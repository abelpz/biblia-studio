import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseUsfm } from "./parse.js";
import { serializeUsfm } from "./serialize.js";
import { UsfmParseError } from "./errors.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function readFixture(name: string): string {
  return readFileSync(join(__dirname, "..", "..", "fixtures", name), "utf8");
}

describe("parseUsfm / serializeUsfm", () => {
  it("round-trips minimal fixture", () => {
    const raw = readFixture("minimal.usfm");
    const doc = parseUsfm(raw);
    const again = parseUsfm(serializeUsfm(doc));
    expect(again).toEqual(doc);
  });

  it("round-trips implicit-paragraph fixture (normalizes explicit \\p)", () => {
    const raw = readFixture("implicit-paragraph.usfm");
    const doc = parseUsfm(raw);
    const again = parseUsfm(serializeUsfm(doc));
    expect(again).toEqual(doc);
  });

  it("rejects unknown markers", () => {
    expect(() => parseUsfm("\\id MRK\n\\x note")).toThrow(UsfmParseError);
  });

  it("rejects duplicate \\id", () => {
    expect(() => parseUsfm("\\id MRK\n\\id MAT")).toThrow(UsfmParseError);
  });

  it("rejects \\c without number", () => {
    expect(() => parseUsfm("\\id MRK\n\\c")).toThrow(UsfmParseError);
  });

  it("rejects \\v before \\c", () => {
    expect(() => parseUsfm("\\id MRK\n\\v 1 oops")).toThrow(UsfmParseError);
  });
});
