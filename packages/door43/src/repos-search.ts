import { DOOR43_HOST_DEFAULT } from "./constants.js";

export type Door43RepoSummary = {
  fullName: string;
  name: string;
  htmlUrl: string;
};

/** Default query returns stable public results on git.door43.org search. */
export const DOOR43_REPO_SEARCH_DEFAULT_QUERY = "unfoldingWord" as const;

/**
 * Public Gitea search: `GET /api/v1/repos/search` (no auth).
 * @see https://git.door43.org/api/swagger
 */
export async function searchDoor43Repos(options?: {
  host?: string;
  query?: string;
  limit?: number;
}): Promise<Door43RepoSummary[]> {
  const host = options?.host ?? DOOR43_HOST_DEFAULT;
  const query = options?.query ?? DOOR43_REPO_SEARCH_DEFAULT_QUERY;
  const limit = Math.min(Math.max(options?.limit ?? 20, 1), 100);
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const url = `https://${host}/api/v1/repos/search?${params}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Door43 API ${res.status}: ${res.statusText}`);
  }
  const body = (await res.json()) as { ok?: unknown; data?: unknown };
  if (body.ok !== true || !Array.isArray(body.data)) {
    throw new Error("Invalid Door43 repo search response");
  }
  return body.data.map(parseRepo);
}

function parseRepo(raw: unknown): Door43RepoSummary {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Invalid repo entry in search response");
  }
  const o = raw as Record<string, unknown>;
  const fullName = o.full_name;
  const name = o.name;
  const htmlUrl = o.html_url;
  if (
    typeof fullName !== "string" ||
    typeof name !== "string" ||
    typeof htmlUrl !== "string"
  ) {
    throw new Error("Invalid Door43 repo fields in search response");
  }
  return { fullName, name, htmlUrl };
}
