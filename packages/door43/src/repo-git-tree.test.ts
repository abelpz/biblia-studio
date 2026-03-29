import { describe, expect, it, vi } from "vitest";

import { fetchDoor43RepoGitTree } from "./repo-git-tree.js";

function jsonResponse(data: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? "OK" : "Error",
    json: async () => data,
  } as Response;
}

describe("fetchDoor43RepoGitTree", () => {
  it("merges paginated tree pages until total_count is reached", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          tree: [
            { path: "a.md", type: "blob", sha: "1" },
            { path: "b.md", type: "blob", sha: "2" },
          ],
          total_count: 3,
          truncated: false,
          page: 1,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          tree: [{ path: "c.md", type: "blob", sha: "3" }],
          total_count: 3,
          truncated: false,
          page: 2,
        }),
      );

    const page = await fetchDoor43RepoGitTree({
      owner: "o",
      repo: "r",
      ref: "v1",
      fetch,
    });

    expect(page.tree.map((e) => e.path)).toEqual(["a.md", "b.md", "c.md"]);
    expect(page.totalCount).toBe(3);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0]![0]).toContain("/git/trees/");
    expect(fetch.mock.calls[0]![0]).toContain("page=1");
    expect(fetch.mock.calls[1]![0]).toContain("page=2");
  });

  it("throws on HTTP error", async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse({}, false));
    await expect(
      fetchDoor43RepoGitTree({ owner: "o", repo: "r", ref: "v1", fetch }),
    ).rejects.toThrow("Door43 git trees");
  });
});
