import { describe, expect, it } from "vitest";
import { compareGlToGlTcReadyTranslationHelps } from "./translation-helps-gl-to-gl.js";

function catalogEntry(partial: {
  abbreviation: string;
  subject: string;
  title: string;
  branch_or_tag_name?: string;
}): Record<string, string | undefined> {
  return {
    abbreviation: partial.abbreviation,
    subject: partial.subject,
    title: partial.title,
    branch_or_tag_name: partial.branch_or_tag_name ?? "v1",
    zipball_url: undefined,
  };
}

function okJson(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => data,
  } as Response;
}

describe("compareGlToGlTcReadyTranslationHelps (prototype)", () => {
  it("matches on subject+identifier, lists missing and only-in-target", async () => {
    const fetchMock: typeof fetch = async (input) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      const lang = new URL(url).searchParams.get("lang");
      if (lang === "en") {
        return okJson({
          ok: true,
          data: [
            catalogEntry({
              abbreviation: "tn",
              subject: "TSV Translation Notes",
              title: "EN TN",
            }),
            catalogEntry({
              abbreviation: "tw",
              subject: "Translation Words",
              title: "EN TW",
            }),
          ],
        });
      }
      if (lang === "es") {
        return okJson({
          ok: true,
          data: [
            catalogEntry({
              abbreviation: "tn",
              subject: "TSV Translation Notes",
              title: "ES TN",
            }),
            catalogEntry({
              abbreviation: "tq",
              subject: "TSV Translation Questions",
              title: "ES TQ",
            }),
          ],
        });
      }
      return okJson({ ok: true, data: [] });
    };

    const result = await compareGlToGlTcReadyTranslationHelps({
      sourceLanguage: "en",
      targetLanguage: "es",
      fetch: fetchMock,
    });

    expect(result.sourceLanguage).toBe("en");
    expect(result.targetLanguage).toBe("es");
    expect(result.matched).toHaveLength(1);
    expect(result.matched[0].key).toEqual({
      identifier: "tn",
      subject: "TSV Translation Notes",
    });
    expect(result.matched[0].source.title).toBe("EN TN");
    expect(result.matched[0].target.title).toBe("ES TN");
    expect(result.missingInTarget).toHaveLength(1);
    expect(result.missingInTarget[0].key.identifier).toBe("tw");
    expect(result.onlyInTarget).toHaveLength(1);
    expect(result.onlyInTarget[0].key.identifier).toBe("tq");
  });
});
