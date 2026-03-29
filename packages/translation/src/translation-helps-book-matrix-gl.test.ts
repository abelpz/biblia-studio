import { beforeEach, describe, expect, it, vi } from "vitest";
import { compareGlToGlTcReadyBookProjects } from "./translation-helps-book-matrix-gl.js";
import * as glToGl from "./translation-helps-gl-to-gl.js";
import * as door43 from "@biblia-studio/door43";

vi.mock("./translation-helps-gl-to-gl.js", async (importOriginal) => {
  const mod =
    await importOriginal<typeof import("./translation-helps-gl-to-gl.js")>();
  return { ...mod, compareGlToGlTcReadyTranslationHelps: vi.fn() };
});

vi.mock("@biblia-studio/door43", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@biblia-studio/door43")>();
  return {
    ...mod,
    fetchDoor43CatalogMetadata: vi.fn(),
    fetchDoor43RepoGitTree: vi.fn(),
  };
});

const summary = (
  id: string,
  owner: string,
  repo: string,
  ref: string,
): import("@biblia-studio/door43").Door43CatalogResourceSummary => ({
  identifier: id,
  subject: "S",
  title: `${id}-title`,
  version: ref,
  description: undefined,
  bundleUrl: undefined,
  catalogOwner: owner,
  catalogRepo: repo,
  catalogRef: ref,
});

describe("compareGlToGlTcReadyBookProjects", () => {
  beforeEach(() => {
    vi.mocked(glToGl.compareGlToGlTcReadyTranslationHelps).mockReset();
    vi.mocked(door43.fetchDoor43CatalogMetadata).mockReset();
    vi.mocked(door43.fetchDoor43RepoGitTree).mockReset();
  });

  it("diffs manifest project file paths (git blobs) for each matched pair with catalog coords", async () => {
    vi.mocked(glToGl.compareGlToGlTcReadyTranslationHelps).mockResolvedValue({
      sourceLanguage: "en",
      targetLanguage: "es",
      matched: [
        {
          key: { subject: "S", identifier: "tn" },
          source: summary("tn", "u", "en_tn", "v1"),
          target: summary("tn", "u", "es_tn", "v1"),
        },
      ],
      missingInTarget: [],
      onlyInTarget: [],
    });
    vi.mocked(door43.fetchDoor43CatalogMetadata).mockImplementation(
      async (opts) => {
        if (opts.repo === "en_tn") {
          return {
            dublin_core: {
              identifier: "tn",
              subject: "S",
              version: "v1",
              type: undefined,
              source: [],
              relation: [],
            },
            projects: [
              {
                identifier: "mat",
                path: "./mat.usfm",
                title: undefined,
                sort: 40,
              },
              {
                identifier: "mrk",
                path: "./mrk.usfm",
                title: undefined,
                sort: 41,
              },
            ],
          };
        }
        return {
          dublin_core: {
            identifier: "tn",
            subject: "S",
            version: "v1",
            type: undefined,
            source: [],
            relation: [],
          },
          projects: [
            {
              identifier: "mat",
              path: "./mat.usfm",
              title: undefined,
              sort: 40,
            },
            {
              identifier: "luk",
              path: "./luk.usfm",
              title: undefined,
              sort: 42,
            },
          ],
        };
      },
    );
    vi.mocked(door43.fetchDoor43RepoGitTree).mockImplementation(
      async (opts) => {
        if (opts.repo === "en_tn") {
          return {
            tree: [
              { path: "mat.usfm", type: "blob", sha: "a" },
              { path: "mrk.usfm", type: "blob", sha: "b" },
            ],
            truncated: false,
            totalCount: 2,
          };
        }
        return {
          tree: [
            { path: "mat.usfm", type: "blob", sha: "a" },
            { path: "luk.usfm", type: "blob", sha: "c" },
          ],
          truncated: false,
          totalCount: 2,
        };
      },
    );

    const out = await compareGlToGlTcReadyBookProjects({
      sourceLanguage: "en",
      targetLanguage: "es",
    });

    expect(out.matched).toHaveLength(1);
    expect(out.matched[0]).toMatchObject({
      key: { subject: "S", identifier: "tn" },
      pathsInBoth: ["mat.usfm"],
      pathsOnlyInSource: ["mrk.usfm"],
      pathsOnlyInTarget: ["luk.usfm"],
    });
    expect(out.skipped).toHaveLength(0);
    expect(door43.fetchDoor43CatalogMetadata).toHaveBeenCalledTimes(2);
    expect(door43.fetchDoor43RepoGitTree).toHaveBeenCalledTimes(2);
  });

  it("skips pairs without catalog coords", async () => {
    vi.mocked(glToGl.compareGlToGlTcReadyTranslationHelps).mockResolvedValue({
      sourceLanguage: "en",
      targetLanguage: "es",
      matched: [
        {
          key: { subject: "S", identifier: "x" },
          source: {
            identifier: "x",
            subject: "S",
            title: "orphan",
            version: "v1",
            description: undefined,
            bundleUrl: undefined,
          },
          target: summary("x", "u", "es_x", "v1"),
        },
      ],
      missingInTarget: [],
      onlyInTarget: [],
    });

    const out = await compareGlToGlTcReadyBookProjects({
      sourceLanguage: "en",
      targetLanguage: "es",
    });

    expect(out.matched).toHaveLength(0);
    expect(out.skipped).toEqual([
      { key: { subject: "S", identifier: "x" }, reason: "no_catalog_coords" },
    ]);
    expect(door43.fetchDoor43CatalogMetadata).not.toHaveBeenCalled();
    expect(door43.fetchDoor43RepoGitTree).not.toHaveBeenCalled();
  });
});
