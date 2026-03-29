import { beforeEach, describe, expect, it, vi } from "vitest";
import { compareTcReadySourceResourcesToTarget } from "./translation-helps-source-set-to-target.js";

vi.mock("@biblia-studio/door43", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@biblia-studio/door43")>();
  return { ...mod, listTcReadyTranslationHelpsResources: vi.fn() };
});

import { listTcReadyTranslationHelpsResources } from "@biblia-studio/door43";

const tnEn = {
  identifier: "tn",
  subject: "Notes",
  title: "EN TN",
  version: "v1",
  description: undefined,
  bundleUrl: undefined,
  catalogOwner: "uw",
  catalogRepo: "en_tn",
  catalogRef: "v1",
};

const tnEs = {
  identifier: "tn",
  subject: "Notes",
  title: "ES TN",
  version: "v1",
  description: undefined,
  bundleUrl: undefined,
  catalogOwner: "uw",
  catalogRepo: "es_tn",
  catalogRef: "v1",
};

function okJson(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => data,
  } as Response;
}

/** Metadata confirming upstream `en` + `tn` for repo `es_tn`. */
function fetchMetadataClaimsEnTn(): typeof fetch {
  return async (input) => {
    const url = typeof input === "string" ? input : (input as Request).url;
    if (!url.includes("/catalog/metadata/")) {
      throw new Error(`unexpected fetch: ${url}`);
    }
    return okJson({
      dublin_core: {
        identifier: "tn",
        subject: "Notes",
        version: "v1",
        source: [{ identifier: "tn", language: "en", version: "v1" }],
      },
      projects: [],
    });
  };
}

describe("compareTcReadySourceResourcesToTarget", () => {
  const listFn = listTcReadyTranslationHelpsResources as unknown as {
    mockReset: () => void;
    mockResolvedValueOnce: (v: unknown) => void;
    mockResolvedValue: (v: unknown) => void;
    mock: { calls: unknown[][] };
  };

  beforeEach(() => {
    listFn.mockReset();
  });

  it("matches only listed sources against target catalog", async () => {
    listFn.mockResolvedValueOnce([tnEs]);

    const fullMissing = {
      identifier: "tq",
      subject: "Questions",
      title: "EN TQ",
      version: "v1",
      description: undefined,
      bundleUrl: undefined,
    };

    const result = await compareTcReadySourceResourcesToTarget({
      sourceResources: [tnEn, fullMissing],
      targetLanguage: "es",
      sourceLanguage: "en",
      includeTargetExtras: true,
      fetch: fetchMetadataClaimsEnTn(),
    });

    expect(listFn.mock.calls.length).toBe(1);
    expect(result.matched).toHaveLength(1);
    expect(result.matched[0]?.key.identifier).toBe("tn");
    expect(result.missingInTarget).toHaveLength(1);
    expect(result.missingInTarget[0]?.key.identifier).toBe("tq");
    expect(result.onlyInTarget).toHaveLength(0);
  });

  it("resolves key-only sources with sourceLanguage fetch", async () => {
    listFn.mockResolvedValueOnce([tnEn]).mockResolvedValueOnce([tnEs]);

    const result = await compareTcReadySourceResourcesToTarget({
      sourceResources: [{ subject: "Notes", identifier: "tn" }],
      targetLanguage: "es",
      sourceLanguage: "en",
      fetch: fetchMetadataClaimsEnTn(),
    });

    expect(result.matched).toHaveLength(1);
    expect(result.matched[0]?.source.title).toBe("EN TN");
  });

  it("does not match target with coords when sourceLanguage omitted (cannot verify metadata)", async () => {
    listFn.mockResolvedValueOnce([tnEs]);

    const result = await compareTcReadySourceResourcesToTarget({
      sourceResources: [{ subject: "Notes", identifier: "tn" }],
      targetLanguage: "es",
    });

    expect(listTcReadyTranslationHelpsResources).toHaveBeenCalledTimes(1);
    expect(result.matched).toHaveLength(0);
    expect(result.missingInTarget).toHaveLength(1);
    expect(result.missingInTarget[0]?.source.title).toBe("");
  });

  it("onlyInTarget when includeTargetExtras and target has extra keys", async () => {
    const extraEs = {
      identifier: "tw",
      subject: "Words",
      title: "ES TW",
      version: "v1",
      description: undefined,
      bundleUrl: undefined,
    };
    listFn.mockResolvedValueOnce([tnEs, extraEs]);

    const result = await compareTcReadySourceResourcesToTarget({
      sourceResources: [tnEn],
      targetLanguage: "es",
      includeTargetExtras: true,
      fetch: fetchMetadataClaimsEnTn(),
    });

    expect(result.onlyInTarget).toHaveLength(1);
    expect(result.onlyInTarget[0]?.key.identifier).toBe("tw");
  });
});
