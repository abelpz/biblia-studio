import { DOOR43_API_V1_BASE_URL } from "./constants.js";

export type Door43CatalogResourceSummary = {
  identifier: string;
  subject: string;
  title: string;
  version: string;
  description: string | undefined;
  /** Zip/tarball URL for the catalog entry when present. */
  bundleUrl: string | undefined;
  /** DCS org from catalog search (`owner`), when present on the raw row. */
  catalogOwner?: string;
  /** Repo name from catalog search (`name`), e.g. `en_ult`. */
  catalogRepo?: string;
  /** Catalog ref (e.g. release tag `v88`); same as `version` when from search. */
  catalogRef?: string;
};

export type ListTcReadyHelpsOptions = {
  /** ISO 639-3 (or site catalog id), e.g. `en`, `es`, `ru`. */
  language: string;
  /**
   * Catalog topic filter. Default `tc-ready` lists resources marked for translationCore / production workflows.
   * @see https://git.door43.org/swagger.v1.json — `/catalog/search` `topic` parameter
   */
  topic?: string;
  /**
   * Optional owner/org filter (e.g. `unfoldingWord`) passed as catalog `owner`.
   */
  organization?: string;
  /**
   * If provided, only resources whose `subject` is in this list are returned (after fetch).
   * Omit to return every tc-ready resource for the language.
   */
  subjects?: readonly string[];
  /**
   * Maximum rows to request from `/catalog/search` (default 2000). Door43 may paginate; raise if needed.
   */
  limit?: number;
  fetch?: typeof fetch;
};

/**
 * Default `subject` values commonly used for Translation Helps–style resources in tc-ready.
 * Callers may pass a subset or their own list; upstream catalog is authoritative for what exists.
 */
export const DEFAULT_TC_READY_HELP_SUBJECTS = [
  "TSV Translation Notes",
  "TSV Translation Questions",
  "TSV Translation Words Links",
  "Translation Academy",
  "Translation Words",
  "Translation Questions",
  "Open Bible Stories",
  "OBS Translation Notes",
  "OBS Translation Questions",
  "OBS Study Notes",
  "OBS Study Questions",
] as const;

const CATALOG_SEARCH_PATH = "/catalog/search";
const DEFAULT_SEARCH_LIMIT = 2000;

/**
 * Query Door43 **`GET /api/v1/catalog/search`** with `topic=tc-ready` (default), `lang`, optional `owner`,
 * then return slim resource rows, optionally filtered by **`subjects`** (exact `subject` strings).
 * Used by `@biblia-studio/translation` for **catalog-level** GL→GL comparison; content/interlink parity is a separate phase.
 *
 * @see https://git.door43.org/swagger.v1.json — `catalogSearch`, `CatalogEntry`, `CatalogSearchResults`
 */
export async function listTcReadyTranslationHelpsResources(
  options: ListTcReadyHelpsOptions,
): Promise<Door43CatalogResourceSummary[]> {
  const topic = options.topic ?? "tc-ready";
  const fetchFn = options.fetch ?? globalThis.fetch;
  const url = buildCatalogUrl({
    lang: options.language,
    topic,
    organization: options.organization,
    limit: options.limit,
  });
  const res = await fetchFn(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Door43 catalog search ${res.status}: ${res.statusText}`);
  }
  const body: unknown = await res.json();
  const rows = extractSearchData(body);
  const mapped = rows.map(toSummary);
  if (!options.subjects?.length) {
    return mapped;
  }
  const allow = new Set(options.subjects);
  return mapped.filter((r) => allow.has(r.subject));
}

export function buildCatalogUrl(filters: {
  lang: string;
  topic: string;
  organization?: string;
  /** Optional single `subject` query value (for debugging). */
  subject?: string;
  limit?: number;
}): string {
  const params = new URLSearchParams();
  params.set("lang", filters.lang);
  params.set("topic", filters.topic);
  params.set("showIngredients", "false");
  if (filters.organization) {
    params.set("owner", filters.organization);
  }
  if (filters.subject) {
    params.set("subject", filters.subject);
  }
  params.set("limit", String(filters.limit ?? DEFAULT_SEARCH_LIMIT));
  return `${DOOR43_API_V1_BASE_URL}${CATALOG_SEARCH_PATH}?${params}`;
}

function extractSearchData(body: unknown): unknown[] {
  if (typeof body !== "object" || body === null) {
    throw new Error("Invalid Door43 catalog search response");
  }
  const rec = body as { ok?: unknown; data?: unknown };
  if (rec.ok === false) {
    throw new Error("Door43 catalog search returned ok: false");
  }
  if (!Array.isArray(rec.data)) {
    throw new Error("Invalid Door43 catalog search: missing data array");
  }
  return rec.data;
}

function toSummary(raw: unknown): Door43CatalogResourceSummary {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Invalid catalog entry");
  }
  const r = raw as Record<string, unknown>;
  const identifier = pickIdentifier(r);
  const subject = r.subject;
  const title = r.title;
  if (typeof subject !== "string" || typeof title !== "string") {
    throw new Error("Invalid catalog entry fields");
  }
  if (!identifier) {
    throw new Error("Invalid catalog entry: missing abbreviation/name");
  }
  const version = pickVersion(r);
  const catalogOwner = r.owner;
  const catalogRepo = r.name;
  const base = {
    identifier,
    subject,
    title,
    version,
    description: extractReleaseBody(r.release),
    bundleUrl: pickBundleUrl(r),
  };
  if (
    typeof catalogOwner === "string" &&
    catalogOwner &&
    typeof catalogRepo === "string" &&
    catalogRepo
  ) {
    return {
      ...base,
      catalogOwner,
      catalogRepo,
      catalogRef: version.length > 0 ? version : undefined,
    };
  }
  return base;
}

function pickIdentifier(r: Record<string, unknown>): string {
  const abbreviation = r.abbreviation;
  if (typeof abbreviation === "string" && abbreviation.length > 0) {
    return abbreviation;
  }
  const name = r.name;
  if (typeof name === "string" && name.length > 0) {
    return name;
  }
  return "";
}

function pickVersion(r: Record<string, unknown>): string {
  const ref = r.branch_or_tag_name;
  if (typeof ref === "string" && ref.length > 0) {
    return ref;
  }
  return extractReleaseTag(r.release);
}

function extractReleaseTag(release: unknown): string {
  if (typeof release !== "object" || release === null) {
    return "";
  }
  const tag = (release as { tag_name?: unknown }).tag_name;
  return typeof tag === "string" ? tag : "";
}

function extractReleaseBody(release: unknown): string | undefined {
  if (typeof release !== "object" || release === null) {
    return undefined;
  }
  const body = (release as { body?: unknown }).body;
  return typeof body === "string" && body.length > 0 ? body : undefined;
}

function pickBundleUrl(r: Record<string, unknown>): string | undefined {
  const zip = r.zipball_url;
  if (typeof zip === "string" && zip.length > 0) {
    return zip;
  }
  const tar = r.tarball_url ?? r.tarbar_url;
  if (typeof tar === "string" && tar.length > 0) {
    return tar;
  }
  return undefined;
}
