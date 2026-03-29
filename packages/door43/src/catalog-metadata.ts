import { DOOR43_API_V1_BASE_URL, DOOR43_HOST_DEFAULT } from "./constants.js";

/** One `dublin_core.source` lineage entry (RC). */
export type Door43CatalogMetadataSourceItem = {
  identifier: string;
  language: string;
  version: string;
  /** When set, upstream is pinned to this publishing org (match catalog search `owner`). */
  owner?: string;
  /** Alternative to `owner` in some manifests — same matching rules. */
  organization?: string;
};

/** Subset of `dublin_core` returned by **`GET /api/v1/catalog/metadata/{owner}/{repo}/{ref}`**. */
export type Door43CatalogDublinCoreSummary = {
  identifier: string;
  subject: string;
  version: string;
  type: string | undefined;
  source: Door43CatalogMetadataSourceItem[];
  relation: string[];
};

/** Book (or story) row from manifest `projects` in metadata payload. */
export type Door43CatalogProjectRow = {
  identifier: string;
  path: string;
  title: string | undefined;
  sort: number | undefined;
};

export type Door43CatalogMetadataResponse = {
  dublin_core: Door43CatalogDublinCoreSummary;
  projects: Door43CatalogProjectRow[];
};

/** Normalize DCS org / manifest org strings for comparison (trim + lowercase). */
export function normalizeDoor43CatalogOrg(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * When a **`source`** item includes **`owner`** or **`organization`**, returns that normalized token;
 * otherwise `undefined` (lineage is identified by language + identifier only).
 */
export function door43MetadataSourceOrgNormalized(
  item: Door43CatalogMetadataSourceItem,
): string | undefined {
  const rawOwner = typeof item.owner === "string" ? item.owner.trim() : "";
  const rawOrg =
    typeof item.organization === "string" ? item.organization.trim() : "";
  const raw = rawOwner || rawOrg;
  return raw ? normalizeDoor43CatalogOrg(raw) : undefined;
}

/**
 * True when `item` names this upstream resource: **`language` + `identifier`**, and when the item
 * pins an org (`owner` / `organization`), **`upstreamCatalogOwner`** must match.
 */
export function door43MetadataSourceItemMatchesUpstream(
  item: Door43CatalogMetadataSourceItem,
  upstreamLanguage: string,
  upstreamIdentifier: string,
  upstreamCatalogOwner: string | undefined,
): boolean {
  if (
    item.language !== upstreamLanguage ||
    item.identifier !== upstreamIdentifier
  ) {
    return false;
  }
  const orgHint = door43MetadataSourceOrgNormalized(item);
  if (!orgHint) return true;
  if (!upstreamCatalogOwner?.trim()) return false;
  return normalizeDoor43CatalogOrg(upstreamCatalogOwner) === orgHint;
}

/**
 * True when the **target** manifest lists at least one **`dublin_core.source`** entry that
 * {@link door43MetadataSourceItemMatchesUpstream matches} the given upstream row.
 */
export function door43MetadataClaimsUpstreamSource(options: {
  upstreamLanguage: string;
  upstreamIdentifier: string;
  /** Catalog search `owner` for the upstream resource; required when a matching `source` entry specifies org. */
  upstreamCatalogOwner?: string;
  metadata: Door43CatalogMetadataResponse;
}): boolean {
  const {
    upstreamLanguage,
    upstreamIdentifier,
    upstreamCatalogOwner,
    metadata,
  } = options;
  if (!upstreamLanguage || !upstreamIdentifier) return false;
  return metadata.dublin_core.source.some((item) =>
    door43MetadataSourceItemMatchesUpstream(
      item,
      upstreamLanguage,
      upstreamIdentifier,
      upstreamCatalogOwner,
    ),
  );
}

export type FetchDoor43CatalogMetadataOptions = {
  owner: string;
  repo: string;
  ref: string;
  /**
   * Door43 host (no scheme). Default `git.door43.org`.
   * Base URL is always `https://{host}/api/v1`.
   */
  host?: string;
  fetch?: typeof fetch;
};

/**
 * **`GET /api/v1/catalog/metadata/{owner}/{repo}/{ref}`** — processed RC manifest fields for a catalog entry.
 * @see https://git.door43.org/swagger.v1.json — `catalogGetMetadata`
 */
export function buildCatalogMetadataUrl(options: {
  owner: string;
  repo: string;
  ref: string;
  host?: string;
}): string {
  const host = options.host ?? DOOR43_HOST_DEFAULT;
  const enc = encodeURIComponent;
  return `https://${host}/api/v1/catalog/metadata/${enc(options.owner)}/${enc(options.repo)}/${enc(options.ref)}`;
}

export async function fetchDoor43CatalogMetadata(
  options: FetchDoor43CatalogMetadataOptions,
): Promise<Door43CatalogMetadataResponse> {
  const fetchFn = options.fetch ?? globalThis.fetch;
  const url =
    options.host !== undefined
      ? buildCatalogMetadataUrl({
          owner: options.owner,
          repo: options.repo,
          ref: options.ref,
          host: options.host,
        })
      : `${DOOR43_API_V1_BASE_URL}/catalog/metadata/${encodeURIComponent(options.owner)}/${encodeURIComponent(options.repo)}/${encodeURIComponent(options.ref)}`;
  const res = await fetchFn(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Door43 catalog metadata ${res.status}: ${res.statusText}`);
  }
  const body: unknown = await res.json();
  return parseCatalogMetadata(body);
}

export function parseCatalogMetadata(
  body: unknown,
): Door43CatalogMetadataResponse {
  if (typeof body !== "object" || body === null) {
    throw new Error("Invalid Door43 catalog metadata: not an object");
  }
  const rec = body as { dublin_core?: unknown; projects?: unknown };
  const dublin_core = parseDublinCore(rec.dublin_core);
  const projects = parseProjects(rec.projects);
  return { dublin_core, projects };
}

function parseDublinCore(raw: unknown): Door43CatalogDublinCoreSummary {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Invalid Door43 catalog metadata: missing dublin_core");
  }
  const dc = raw as Record<string, unknown>;
  const identifier = stringField(dc, "identifier");
  const subject = stringField(dc, "subject");
  const version = stringField(dc, "version");
  if (!identifier || !subject || !version) {
    throw new Error(
      "Invalid Door43 catalog metadata: dublin_core identifier/subject/version",
    );
  }
  const type = typeof dc.type === "string" ? dc.type : undefined;
  return {
    identifier,
    subject,
    version,
    type,
    source: parseSourceArray(dc.source),
    relation: parseRelation(dc.relation),
  };
}

function stringField(o: Record<string, unknown>, key: string): string {
  const v = o[key];
  if (typeof v === "string" && v.length > 0) return v;
  if (typeof v === "number") return String(v);
  return "";
}

function parseSourceArray(raw: unknown): Door43CatalogMetadataSourceItem[] {
  if (!Array.isArray(raw)) return [];
  const out: Door43CatalogMetadataSourceItem[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const o = item as Record<string, unknown>;
    const identifier = stringField(o, "identifier");
    const language = stringField(o, "language");
    const version = stringField(o, "version");
    if (!identifier || !language) continue;
    const ownerRaw = stringField(o, "owner");
    const organizationRaw = stringField(o, "organization");
    const entry: Door43CatalogMetadataSourceItem = {
      identifier,
      language,
      version,
    };
    if (ownerRaw) entry.owner = ownerRaw;
    if (organizationRaw) entry.organization = organizationRaw;
    out.push(entry);
  }
  return out;
}

function parseRelation(raw: unknown): string[] {
  if (raw === undefined || raw === null) return [];
  if (Array.isArray(raw)) {
    return raw.filter(
      (x): x is string => typeof x === "string" && x.length > 0,
    );
  }
  if (typeof raw === "string" && raw.length > 0) return [raw];
  return [];
}

function parseProjects(raw: unknown): Door43CatalogProjectRow[] {
  if (!Array.isArray(raw)) return [];
  const out: Door43CatalogProjectRow[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const p = item as Record<string, unknown>;
    const identifier = stringField(p, "identifier");
    const path = stringField(p, "path");
    if (!identifier || !path) continue;
    const title = typeof p.title === "string" ? p.title : undefined;
    const sort = typeof p.sort === "number" ? p.sort : undefined;
    out.push({ identifier, path, title, sort });
  }
  return out;
}
