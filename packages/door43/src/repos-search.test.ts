import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DOOR43_REPO_SEARCH_DEFAULT_QUERY,
  searchDoor43Repos,
} from "./repos-search.js";

describe("searchDoor43Repos", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests /api/v1/repos/search with default query and maps repos", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: [
          {
            full_name: "org/a",
            name: "a",
            html_url: "https://git.door43.org/org/a",
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchDoor43Repos({ limit: 5 });

    expect(fetchMock).toHaveBeenCalledWith(
      `https://git.door43.org/api/v1/repos/search?q=${encodeURIComponent(DOOR43_REPO_SEARCH_DEFAULT_QUERY)}&limit=5`,
      { cache: "no-store" },
    );
    expect(result).toEqual([
      {
        fullName: "org/a",
        name: "a",
        htmlUrl: "https://git.door43.org/org/a",
      },
    ]);
  });

  it("uses custom host and query", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await searchDoor43Repos({
      host: "example.org",
      query: "test",
      limit: 10,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.org/api/v1/repos/search?q=test&limit=10",
      { cache: "no-store" },
    );
  });

  it("throws when response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        statusText: "Bad Gateway",
      }),
    );

    await expect(searchDoor43Repos()).rejects.toThrow(
      "Door43 API 502: Bad Gateway",
    );
  });

  it("throws when body is not a search payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: false }),
      }),
    );

    await expect(searchDoor43Repos()).rejects.toThrow(
      "Invalid Door43 repo search response",
    );
  });

  it("throws when a repo row is malformed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          data: [{ full_name: "x/y" }],
        }),
      }),
    );

    await expect(searchDoor43Repos()).rejects.toThrow(
      "Invalid Door43 repo fields",
    );
  });
});
