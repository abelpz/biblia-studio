import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTranslationHelpsAdapter } from "./translation-helps.adapter";

vi.mock("@biblia-studio/door43", () => ({
  listTcReadyTranslationHelpsResources: vi.fn(),
}));

vi.mock("@biblia-studio/translation", () => ({
  compareGlToGlTcReadyTranslationHelps: vi.fn(),
  findTargetCatalogEntriesClaimingSource: vi.fn(),
}));

import { listTcReadyTranslationHelpsResources } from "@biblia-studio/door43";
import {
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
        bundleUrl: undefined,
        catalogOwner: "o",
        catalogRepo: "r",
        catalogRef: "v1",
      },
    ]);
    const adapter = createTranslationHelpsAdapter();
    const rows = await adapter.listTcReadyCatalog({ language: "en" });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      identifier: "tn",
      catalogRepo: "r",
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
            version: "1",
            description: undefined,
            bundleUrl: undefined,
          },
          target: {
            identifier: "tn",
            subject: "S",
            title: "ES",
            version: "1",
            description: undefined,
            bundleUrl: undefined,
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
          bundleUrl: undefined,
          catalogOwner: "u",
          catalogRepo: "es_tn",
          catalogRef: "main",
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
});
