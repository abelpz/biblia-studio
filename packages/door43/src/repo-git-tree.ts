import { DOOR43_API_V1_BASE_URL } from "./constants.js";

export type Door43GitTreeEntry = {
  path: string;
  type: "blob" | "tree" | "commit";
  sha: string;
};

export type Door43RepoGitTreePage = {
  tree: Door43GitTreeEntry[];
  truncated: boolean;
  /** When the server paginates, total blob+tree entries across all pages. */
  totalCount: number;
};

export type FetchDoor43RepoGitTreeOptions = {
  owner: string;
  repo: string;
  ref: string;
  /**
   * Door43 host (no scheme). Default `git.door43.org`.
   */
  host?: string;
  fetch?: typeof fetch;
};

function buildTreesApiUrl(
  owner: string,
  repo: string,
  ref: string,
  page: number,
  host: string,
): string {
  const base = `https://${host}/api/v1`;
  const enc = encodeURIComponent;
  return `${base}/repos/${enc(owner)}/${enc(repo)}/git/trees/${enc(ref)}?recursive=true&page=${page}`;
}

function parseTreesJson(body: unknown): {
  tree: Door43GitTreeEntry[];
  truncated: boolean;
  totalCount: number;
} {
  if (typeof body !== "object" || body === null) {
    throw new Error("Invalid Door43 git trees response: not an object");
  }
  const o = body as Record<string, unknown>;
  const rawTree = o.tree;
  if (!Array.isArray(rawTree)) {
    throw new Error("Invalid Door43 git trees response: missing tree array");
  }
  const out: Door43GitTreeEntry[] = [];
  for (const item of rawTree) {
    if (typeof item !== "object" || item === null) continue;
    const e = item as Record<string, unknown>;
    const path = typeof e.path === "string" ? e.path : "";
    const type = e.type;
    const sha = typeof e.sha === "string" ? e.sha : "";
    if (!path || !sha) continue;
    if (type !== "blob" && type !== "tree" && type !== "commit") continue;
    out.push({ path, type, sha });
  }
  const truncated = o.truncated === true;
  const totalCount =
    typeof o.total_count === "number" && o.total_count >= 0
      ? o.total_count
      : out.length;
  return { tree: out, truncated, totalCount };
}

/**
 * **`GET /api/v1/repos/{owner}/{repo}/gitea/api/v1`** — recursive git tree for a tag/branch/sha.
 * Follows pagination until {@link Door43RepoGitTreePage.totalCount} entries are collected.
 */
export async function fetchDoor43RepoGitTree(
  options: FetchDoor43RepoGitTreeOptions,
): Promise<Door43RepoGitTreePage> {
  const fetchFn = options.fetch ?? globalThis.fetch;
  const tree: Door43GitTreeEntry[] = [];
  let page = 1;
  let totalCount = 0;
  let truncated = false;

  for (;;) {
    const url =
      options.host !== undefined
        ? buildTreesApiUrl(
            options.owner,
            options.repo,
            options.ref,
            page,
            options.host,
          )
        : `${DOOR43_API_V1_BASE_URL}/repos/${encodeURIComponent(options.owner)}/${encodeURIComponent(options.repo)}/git/trees/${encodeURIComponent(options.ref)}?recursive=true&page=${page}`;
    const res = await fetchFn(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Door43 git trees ${res.status}: ${res.statusText}`);
    }
    const body: unknown = await res.json();
    const parsed = parseTreesJson(body);
    truncated = truncated || parsed.truncated;
    totalCount = parsed.totalCount;
    tree.push(...parsed.tree);
    if (tree.length >= totalCount || parsed.tree.length === 0) {
      return {
        tree,
        truncated,
        totalCount,
      };
    }
    page += 1;
  }
}
