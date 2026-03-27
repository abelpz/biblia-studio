import { describe, expect, it } from "vitest";
import {
  DEFAULT_TC_READY_HELP_SUBJECTS,
  buildCatalogUrl,
  listTcReadyTranslationHelpsResources,
} from "./catalog.js";

function okJson(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => data,
  } as Response;
}

describe("Door43 catalog search (tc-ready)", () => {
  it("buildCatalogUrl hits /api/v1/catalog/search with lang, topic, showIngredients, optional owner, subject, limit", () => {
    expect(buildCatalogUrl({ lang: "en", topic: "tc-ready" })).toBe(
      "https://git.door43.org/api/v1/catalog/search?lang=en&topic=tc-ready&showIngredients=false&limit=2000",
    );
    expect(
      buildCatalogUrl({
        lang: "es",
        topic: "tc-ready",
        organization: "unfoldingWord",
        limit: 100,
      }),
    ).toBe(
      "https://git.door43.org/api/v1/catalog/search?lang=es&topic=tc-ready&showIngredients=false&owner=unfoldingWord&limit=100",
    );
    expect(
      buildCatalogUrl({
        lang: "en",
        topic: "tc-ready",
        subject: "Translation Words",
        limit: 50,
      }),
    ).toBe(
      "https://git.door43.org/api/v1/catalog/search?lang=en&topic=tc-ready&showIngredients=false&subject=Translation+Words&limit=50",
    );
  });

  it("listTcReadyTranslationHelpsResources maps CatalogEntry rows and filters by subjects", async () => {
    const fetchMock: typeof fetch = async () =>
      okJson({
        ok: true,
        data: [
          {
            owner: "unfoldingWord",
            name: "en_tn",
            abbreviation: "tn",
            subject: "TSV Translation Notes",
            title: "Notes",
            branch_or_tag_name: "v42",
            zipball_url: "https://git.door43.org/…/archive/v42.zip",
            release: { body: "d", tag_name: "v42" },
          },
          {
            abbreviation: "ult",
            subject: "Aligned Bible",
            title: "ULT",
            branch_or_tag_name: "v1",
            zipball_url: "",
          },
        ],
      });

    const rows = await listTcReadyTranslationHelpsResources({
      language: "en",
      subjects: ["TSV Translation Notes"],
      limit: 500,
      fetch: fetchMock,
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      identifier: "tn",
      subject: "TSV Translation Notes",
      title: "Notes",
      version: "v42",
      description: "d",
      bundleUrl: "https://git.door43.org/…/archive/v42.zip",
      catalogOwner: "unfoldingWord",
      catalogRepo: "en_tn",
      catalogRef: "v42",
    });
  });

  it("returns empty array when search data is empty", async () => {
    const fetchMock: typeof fetch = async () =>
      okJson({
        ok: true,
        data: [],
      });

    const rows = await listTcReadyTranslationHelpsResources({
      language: "missing",
      fetch: fetchMock,
    });
    expect(rows).toEqual([]);
  });

  it("throws on failed HTTP", async () => {
    const fetchMock: typeof fetch = async () =>
      ({ ok: false, status: 500, statusText: "Err" }) as Response;
    await expect(
      listTcReadyTranslationHelpsResources({
        language: "en",
        fetch: fetchMock,
      }),
    ).rejects.toThrow("Door43 catalog search 500");
  });

  it("throws when ok is false", async () => {
    const fetchMock: typeof fetch = async () => okJson({ ok: false, data: [] });
    await expect(
      listTcReadyTranslationHelpsResources({
        language: "en",
        fetch: fetchMock,
      }),
    ).rejects.toThrow("ok: false");
  });

  it("DEFAULT_TC_READY_HELP_SUBJECTS lists common help subjects", () => {
    expect(DEFAULT_TC_READY_HELP_SUBJECTS).toContain("TSV Translation Notes");
    expect(DEFAULT_TC_READY_HELP_SUBJECTS).toContain("Translation Words");
  });
});
