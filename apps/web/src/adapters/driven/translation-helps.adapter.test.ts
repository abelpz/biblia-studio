import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTranslationHelpsAdapter } from "./translation-helps.adapter";

vi.mock("@biblia-studio/door43", async (importOriginal) => {
  const door43 = await importOriginal<typeof import("@biblia-studio/door43")>();
  return {
    ...door43,
    listTcReadyTranslationHelpsResources: vi.fn(),
  };
});

vi.mock("@biblia-studio/translation", () => ({
  compareGlToGlTcReadyTranslationHelps: vi.fn(),
  compareGlToGlTcReadyBookProjects: vi.fn(),
  findTargetCatalogEntriesClaimingSource: vi.fn(),
}));

import { listTcReadyTranslationHelpsResources } from "@biblia-studio/door43";
import {
  compareGlToGlTcReadyBookProjects,
  compareGlToGlTcReadyTranslationHelps,
  findTargetCatalogEntriesClaimingSource,
} from "@biblia-studio/translation";

describe("createTranslationHelpsAdapter", () => {
  beforeEach(() => {
    vi.mocked(listTcReadyTranslationHelpsResources).mockReset();
    vi.mocked(compareGlToGlTcReadyTranslationHelps).mockReset();
    vi.mocked(findTargetCatalogEntriesClaimingSource).mockReset();
  });

  it("listTcReadyCatalog forwards language and default limit, maps rows", async () => {
    vi.mocked(listTcReadyTranslationHelpsResources).mockResolvedValue([
      {
        identifier: "tn",
        subject: "TSV Translation Notes",
        title: "Notes",
        version: "v1",
        description: undefined,
        catalogOwner: "o",
        catalogRepo: "r",
        catalogRef: "v1",
        bundleUrl: "https://git.door43.org/o/r/archive/v1.zip",
      },
    ]);
    const adapter = createTranslationHelpsAdapter();
    const rows = await adapter.listTcReadyCatalog({ language: "en" });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      identifier: "tn",
      catalogRepo: "r",
      door43RepoUrl: "https://git.door43.org/o/r",
      door43MetadataUrl:
        "https://git.door43.org/api/v1/catalog/metadata/o/r/v1",
      door43BundleUrl: "https://git.door43.org/o/r/archive/v1.zip",
    });
    expect(listTcReadyTranslationHelpsResources).toHaveBeenCalledWith(
      expect.objectContaining({ language: "en", limit: 500 }),
    );
  });

  it("compareTcReadyGlToGl maps matched vs source/target titles", async () => {
    vi.mocked(compareGlToGlTcReadyTranslationHelps).mockResolvedValue({
      sourceLanguage: "en",
      targetLanguage: "es",
      matched: [
        {
          key: { subject: "S", identifier: "tn" },
          source: {
            identifier: "tn",
            subject: "S",
            title: "EN",
            version: "v1",
            description: undefined,
            catalogOwner: "uw",
            catalogRepo: "en_tn",
            catalogRef: "v1",
            bundleUrl: "https://ex/en.zip",
          },
          target: {
            identifier: "tn",
            subject: "S",
            title: "ES",
            version: "v2",
            description: undefined,
            bundleUrl: "https://ex/es.zip",
            catalogOwner: "uw",
            catalogRepo: "es_tn",
            catalogRef: "v2",
          },
        },
      ],
      missingInTarget: [],
      onlyInTarget: [],
    });
    const adapter = createTranslationHelpsAdapter();
    const out = await adapter.compareTcReadyGlToGl({
      sourceLanguage: "en",
      targetLanguage: "es",
    });
    expect(out.matched).toHaveLength(1);
    expect(out.matched[0]?.sourceTitle).toBe("EN");
    expect(out.matched[0]?.targetTitle).toBe("ES");
    expect(out.matched[0]?.sourceDoor43RepoUrl).toBe(
      "https://git.door43.org/uw/en_tn",
    );
    expect(out.matched[0]?.sourceDoor43MetadataUrl).toBe(
      "https://git.door43.org/api/v1/catalog/metadata/uw/en_tn/v1",
    );
    expect(out.matched[0]?.targetDoor43RepoUrl).toBe(
      "https://git.door43.org/uw/es_tn",
    );
    expect(out.matched[0]?.targetDoor43MetadataUrl).toBe(
      "https://git.door43.org/api/v1/catalog/metadata/uw/es_tn/v2",
    );
    expect(out.matched[0]?.sourceDoor43BundleUrl).toBe("https://ex/en.zip");
    expect(out.matched[0]?.targetDoor43BundleUrl).toBe("https://ex/es.zip");
  });

  it("findTargetsClaimingSource forwards args and maps slim rows", async () => {
    vi.mocked(findTargetCatalogEntriesClaimingSource).mockResolvedValue([
      {
        summary: {
          identifier: "tn",
          subject: "S",
          title: "ES notes",
          version: "2",
          description: undefined,
          catalogOwner: "u",
          catalogRepo: "es_tn",
          catalogRef: "main",
          bundleUrl: "https://ex/target.zip",
        },
        metadata: {} as never,
        matchedSources: [{ identifier: "tn", language: "en", version: "1" }],
      },
    ]);
    const adapter = createTranslationHelpsAdapter();
    const out = await adapter.findTargetsClaimingSource({
      targetLanguage: "es",
      sourceLanguage: "en",
      sourceIdentifier: "tn",
      sourceVersion: "1",
      organization: "uw",
      limit: 100,
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      identifier: "tn",
      title: "ES notes",
      door43RepoUrl: "https://git.door43.org/u/es_tn",
      door43MetadataUrl:
        "https://git.door43.org/api/v1/catalog/metadata/u/es_tn/main",
      door43BundleUrl: "https://ex/target.zip",
      matchedSources: [{ language: "en", identifier: "tn", version: "1" }],
    });
    expect(findTargetCatalogEntriesClaimingSource).toHaveBeenCalledWith(
      expect.objectContaining({
        targetLanguage: "es",
        sourceLanguage: "en",
        sourceIdentifier: "tn",
        sourceVersion: "1",
        organization: "uw",
        limit: 100,
      }),
    );
  });

  it("compareTcReadyGlToGlBookMatrix maps rows and skipped", async () => {
    vi.mocked(compareGlToGlTcReadyBookProjects).mockResolvedValue({
      sourceLanguage: "en",
      targetLanguage: "es",
      matched: [
        {
          key: { subject: "S", identifier: "tn" },
          sourceTitle: "A",
          targetTitle: "B",
          bookIdsInBoth: ["mat"],
          bookIdsOnlyInSource: ["mrk"],
          bookIdsOnlyInTarget: ["luk"],
        },
      ],
      skipped: [
        {
          key: { subject: "S", identifier: "tq" },
          reason: "no_catalog_coords",
        },
      ],
    });
    const adapter = createTranslationHelpsAdapter();
    const out = await adapter.compareTcReadyGlToGlBookMatrix({
      sourceLanguage: "en",
      targetLanguage: "es",
      matrixMatchedLimit: 12,
    });
    expect(out.rows).toHaveLength(1);
    expect(out.rows[0]?.bookIdsInBoth).toEqual(["mat"]);
    expect(out.skipped[0]?.reason).toBe("no_catalog_coords");
    expect(compareGlToGlTcReadyBookProjects).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceLanguage: "en",
        targetLanguage: "es",
        matchedMetadataLimit: 12,
      }),
    );
  });
});
