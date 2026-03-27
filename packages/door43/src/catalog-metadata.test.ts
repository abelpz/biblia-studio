import { describe, expect, it } from "vitest";

import {
  buildCatalogMetadataUrl,
  fetchDoor43CatalogMetadata,
  parseCatalogMetadata,
} from "./catalog-metadata.js";

function okJson(data: unknown): Response {
  return {
    ok: true,

    status: 200,

    statusText: "OK",

    json: async () => data,
  } as Response;
}

describe("Door43 catalog metadata", () => {
  it("buildCatalogMetadataUrl encodes path segments", () => {
    expect(
      buildCatalogMetadataUrl({
        owner: "unfoldingWord",

        repo: "es-419_tn",

        ref: "v1",
      }),
    ).toBe(
      "https://git.door43.org/api/v1/catalog/metadata/unfoldingWord/es-419_tn/v1",
    );
  });

  it("parseCatalogMetadata maps dublin_core.source and projects", () => {
    const parsed = parseCatalogMetadata({
      dublin_core: {
        identifier: "tn",

        subject: "TSV Translation Notes",

        version: "42",

        type: "text/tsv",

        source: [
          { identifier: "tn", language: "en", version: "64" },

          { identifier: "uhb", language: "hbo", version: "2.1.17" },
        ],

        relation: ["https://example/rc"],
      },

      projects: [
        { identifier: "tit", path: "./tit.tsv", title: "Titus", sort: 56 },
      ],
    });

    expect(parsed.dublin_core.identifier).toBe("tn");

    expect(parsed.dublin_core.source).toHaveLength(2);

    expect(parsed.dublin_core.source[0]).toEqual({
      identifier: "tn",

      language: "en",

      version: "64",
    });

    expect(parsed.dublin_core.relation).toEqual(["https://example/rc"]);

    expect(parsed.projects[0]).toMatchObject({
      identifier: "tit",

      path: "./tit.tsv",

      title: "Titus",

      sort: 56,
    });
  });

  it("parseCatalogMetadata tolerates missing source and projects", () => {
    const parsed = parseCatalogMetadata({
      dublin_core: {
        identifier: "x",

        subject: "S",

        version: "1",
      },
    });

    expect(parsed.dublin_core.source).toEqual([]);

    expect(parsed.dublin_core.relation).toEqual([]);

    expect(parsed.projects).toEqual([]);
  });

  it("parseCatalogMetadata throws on invalid payload", () => {
    expect(() => parseCatalogMetadata(null)).toThrow("not an object");

    expect(() => parseCatalogMetadata({})).toThrow("missing dublin_core");
  });

  it("fetchDoor43CatalogMetadata GETs default API base and parses JSON", async () => {
    const payload = {
      dublin_core: {
        identifier: "tn",

        subject: "TSV Translation Notes",

        version: "1",

        source: [],
      },

      projects: [],
    };

    const fetchMock: typeof fetch = async (input) => {
      const url = typeof input === "string" ? input : (input as Request).url;

      expect(url).toBe(
        "https://git.door43.org/api/v1/catalog/metadata/org/repo/v9",
      );

      return okJson(payload);
    };

    const result = await fetchDoor43CatalogMetadata({
      owner: "org",

      repo: "repo",

      ref: "v9",

      fetch: fetchMock,
    });

    expect(result.dublin_core.identifier).toBe("tn");
  });

  it("fetchDoor43CatalogMetadata throws on HTTP error", async () => {
    const fetchMock: typeof fetch = async () =>
      ({ ok: false, status: 404, statusText: "Nope" }) as Response;

    await expect(
      fetchDoor43CatalogMetadata({
        owner: "a",

        repo: "b",

        ref: "c",

        fetch: fetchMock,
      }),
    ).rejects.toThrow("Door43 catalog metadata 404");
  });
});
