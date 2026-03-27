import { describe, expect, it } from "vitest";

import { findTargetCatalogEntriesClaimingSource } from "./translation-helps-source-first.js";

function okJson(data: unknown): Response {
  return {
    ok: true,

    status: 200,

    statusText: "OK",

    json: async () => data,
  } as Response;
}

describe("findTargetCatalogEntriesClaimingSource", () => {
  it("returns target rows whose metadata source matches language+identifier", async () => {
    const fetchMock: typeof fetch = async (input) => {
      const url = typeof input === "string" ? input : (input as Request).url;

      if (url.includes("/api/v1/catalog/search")) {
        return okJson({
          ok: true,

          data: [
            {
              owner: "es-419_gl",

              name: "es-419_tn",

              abbreviation: "tn",

              subject: "TSV Translation Notes",

              title: "ES TN",

              branch_or_tag_name: "v7",

              zipball_url: "",
            },

            {
              owner: "es-419_gl",

              name: "es-419_twlm",

              abbreviation: "twl",

              subject: "TSV Translation Words Links",

              title: "Links",

              branch_or_tag_name: "v1",

              zipball_url: "",
            },
          ],
        });
      }

      if (url.endsWith("/api/v1/catalog/metadata/es-419_gl/es-419_tn/v7")) {
        return okJson({
          dublin_core: {
            identifier: "tn",

            subject: "TSV Translation Notes",

            version: "7",

            source: [{ identifier: "tn", language: "en", version: "64" }],
          },

          projects: [],
        });
      }

      if (url.endsWith("/api/v1/catalog/metadata/es-419_gl/es-419_twlm/v1")) {
        return okJson({
          dublin_core: {
            identifier: "twl",

            subject: "TSV Translation Words Links",

            version: "1",

            source: [{ identifier: "twl", language: "fr", version: "1" }],
          },

          projects: [],
        });
      }

      return okJson({});
    };

    const hits = await findTargetCatalogEntriesClaimingSource({
      targetLanguage: "es-419",

      sourceLanguage: "en",

      sourceIdentifier: "tn",

      fetch: fetchMock,

      concurrency: 2,
    });

    expect(hits).toHaveLength(1);

    expect(hits[0].summary.identifier).toBe("tn");

    expect(hits[0].matchedSources).toEqual([
      { identifier: "tn", language: "en", version: "64" },
    ]);
  });

  it("filters by sourceVersion when provided", async () => {
    const fetchMock: typeof fetch = async (input) => {
      const url = typeof input === "string" ? input : (input as Request).url;

      if (url.includes("/catalog/search")) {
        return okJson({
          ok: true,

          data: [
            {
              owner: "o",

              name: "r1",

              abbreviation: "tn",

              subject: "TSV Translation Notes",

              title: "A",

              branch_or_tag_name: "t",

              zipball_url: "",
            },
          ],
        });
      }

      return okJson({
        dublin_core: {
          identifier: "tn",

          subject: "TSV Translation Notes",

          version: "1",

          source: [{ identifier: "tn", language: "en", version: "64" }],
        },

        projects: [],
      });
    };

    const noHit = await findTargetCatalogEntriesClaimingSource({
      targetLanguage: "x",

      sourceLanguage: "en",

      sourceIdentifier: "tn",

      sourceVersion: "99",

      fetch: fetchMock,
    });

    expect(noHit).toHaveLength(0);

    const hit = await findTargetCatalogEntriesClaimingSource({
      targetLanguage: "x",

      sourceLanguage: "en",

      sourceIdentifier: "tn",

      sourceVersion: "64",

      fetch: fetchMock,
    });

    expect(hit).toHaveLength(1);
  });
});
