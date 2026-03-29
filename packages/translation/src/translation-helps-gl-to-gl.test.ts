import { describe, expect, it } from "vitest";
import { compareGlToGlTcReadyTranslationHelps } from "./translation-helps-gl-to-gl.js";

function catalogEntry(partial: {
  abbreviation: string;
  subject: string;
  title: string;
  branch_or_tag_name?: string;
  owner?: string;
  name?: string;
}): Record<string, string | undefined> {
  return {
    abbreviation: partial.abbreviation,
    subject: partial.subject,
    title: partial.title,
    branch_or_tag_name: partial.branch_or_tag_name ?? "v1",
    owner: partial.owner,
    name: partial.name,
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
  it("matches when target metadata claims source; lists missing and only-in-target", async () => {
    const fetchMock: typeof fetch = async (input) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      if (url.includes("/catalog/metadata/")) {
        const m = url.match(/\/catalog\/metadata\/([^/]+)\/([^/]+)\/([^/?]+)/);
        expect(m).toBeTruthy();
        const [, , repo] = m!;
        if (repo === "es_tn") {
          return okJson({
            dublin_core: {
              identifier: "tn",
              subject: "TSV Translation Notes",
              version: "v1",
              source: [{ identifier: "tn", language: "en", version: "v1" }],
            },
            projects: [],
          });
        }
        if (repo === "es_tq") {
          return okJson({
            dublin_core: {
              identifier: "tq",
              subject: "TSV Translation Questions",
              version: "v1",
              source: [{ identifier: "tq", language: "en", version: "v1" }],
            },
            projects: [],
          });
        }
        return okJson({
          dublin_core: {
            identifier: "x",
            subject: "x",
            version: "v1",
            source: [],
          },
          projects: [],
        });
      }
      const lang = new URL(url).searchParams.get("lang");
      if (lang === "en") {
        return okJson({
          ok: true,
          data: [
            catalogEntry({
              abbreviation: "tn",
              subject: "TSV Translation Notes",
              title: "EN TN",
              owner: "uw",
              name: "en_tn",
            }),
            catalogEntry({
              abbreviation: "tw",
              subject: "Translation Words",
              title: "EN TW",
              owner: "uw",
              name: "en_tw",
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
              owner: "uw",
              name: "es_tn",
            }),
            catalogEntry({
              abbreviation: "tq",
              subject: "TSV Translation Questions",
              title: "ES TQ",
              owner: "uw",
              name: "es_tq",
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

  it("does not match exact catalog key when target metadata does not claim that source", async () => {
    const fetchMock: typeof fetch = async (input) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      if (url.includes("/catalog/metadata/")) {
        return okJson({
          dublin_core: {
            identifier: "tn",
            subject: "TSV Translation Notes",
            version: "v1",
            source: [{ identifier: "wrong", language: "en", version: "v1" }],
          },
          projects: [],
        });
      }
      const lang = new URL(url).searchParams.get("lang");
      if (lang === "en") {
        return okJson({
          ok: true,
          data: [
            catalogEntry({
              abbreviation: "tn",
              subject: "TSV Translation Notes",
              title: "EN TN",
              owner: "uw",
              name: "en_tn",
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
              owner: "uw",
              name: "es_tn",
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

    expect(result.matched).toHaveLength(0);
    expect(result.missingInTarget).toHaveLength(1);
    expect(result.onlyInTarget).toHaveLength(1);
  });

  it("pairs target to source when dublin_core.source matches source GL (glt ↔ ult)", async () => {
    const fetchMock: typeof fetch = async (input) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      if (url.includes("/catalog/metadata/")) {
        const m = url.match(/\/catalog\/metadata\/([^/]+)\/([^/]+)\/([^/?]+)/);
        expect(m).toBeTruthy();
        const [, owner, repo] = m!;
        if (owner === "esOrg" && repo === "es-419_glt") {
          return okJson({
            dublin_core: {
              identifier: "glt",
              subject: "Aligned Bible",
              version: "v1",
              source: [{ identifier: "ult", language: "en", version: "v1" }],
            },
            projects: [],
          });
        }
        if (repo === "en_ult") {
          return okJson({
            dublin_core: {
              identifier: "ult",
              subject: "Aligned Bible",
              version: "v1",
              source: [],
            },
            projects: [],
          });
        }
        return okJson({
          dublin_core: {
            identifier: "x",
            subject: "Aligned Bible",
            version: "v1",
            source: [],
          },
          projects: [],
        });
      }
      const lang = new URL(url).searchParams.get("lang");
      if (lang === "en") {
        return okJson({
          ok: true,
          data: [
            catalogEntry({
              abbreviation: "ult",
              subject: "Aligned Bible",
              title: "EN ULT",
              owner: "unfoldingWord",
              name: "en_ult",
            }),
          ],
        });
      }
      if (lang === "es-419") {
        return okJson({
          ok: true,
          data: [
            catalogEntry({
              abbreviation: "glt",
              subject: "Aligned Bible",
              title: "ES GLT",
              owner: "esOrg",
              name: "es-419_glt",
            }),
          ],
        });
      }
      return okJson({ ok: true, data: [] });
    };

    const result = await compareGlToGlTcReadyTranslationHelps({
      sourceLanguage: "en",
      targetLanguage: "es-419",
      fetch: fetchMock,
    });

    expect(result.matched).toHaveLength(1);
    expect(result.matched[0].source.identifier).toBe("ult");
    expect(result.matched[0].target.identifier).toBe("glt");
    expect(result.missingInTarget).toHaveLength(0);
    expect(result.onlyInTarget).toHaveLength(0);
  });

  it("lineage picks source row by metadata owner when identifier is shared", async () => {
    const fetchMock: typeof fetch = async (input) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      if (url.includes("/catalog/metadata/")) {
        const m = url.match(/\/catalog\/metadata\/([^/]+)\/([^/]+)\/([^/?]+)/);
        expect(m).toBeTruthy();
        const [, , repo] = m!;
        if (repo === "es_glt") {
          return okJson({
            dublin_core: {
              identifier: "glt",
              subject: "Aligned Bible",
              version: "v1",
              source: [
                {
                  identifier: "ult",
                  language: "en",
                  version: "v1",
                  organization: "unfoldingWord",
                },
              ],
            },
            projects: [],
          });
        }
        return okJson({
          dublin_core: {
            identifier: "x",
            subject: "S",
            version: "v1",
            source: [],
          },
          projects: [],
        });
      }
      const lang = new URL(url).searchParams.get("lang");
      if (lang === "en") {
        return okJson({
          ok: true,
          data: [
            catalogEntry({
              abbreviation: "ult",
              subject: "Aligned Bible",
              title: "EN ULT uw",
              owner: "unfoldingWord",
              name: "en_ult",
            }),
            catalogEntry({
              abbreviation: "ult",
              subject: "Other Subject",
              title: "EN ULT other",
              owner: "otherOrg",
              name: "en_ult_other",
            }),
          ],
        });
      }
      if (lang === "es") {
        return okJson({
          ok: true,
          data: [
            catalogEntry({
              abbreviation: "glt",
              subject: "Aligned Bible",
              title: "ES GLT",
              owner: "esOrg",
              name: "es_glt",
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

    expect(result.matched).toHaveLength(1);
    expect(result.matched[0].source.catalogOwner).toBe("unfoldingWord");
    expect(result.matched[0].target.identifier).toBe("glt");
  });
});
