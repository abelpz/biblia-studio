import Link from "next/link";
import { createTranslationHelpsAdapter } from "../../src/adapters/driven/translation-helps.adapter";
import type { TranslationHelpsPort } from "../../src/ports/translation-helps.port";

export const dynamic = "force-dynamic";

const DEFAULT_LANG = "en";

type Search = {
  lang?: string;
  org?: string;
  compare?: string;
  limit?: string;
  /** Target scan uses **`lang`**. When set with **`srcId`**, rows whose metadata **`dublin_core.source`** matches **`srcLang` + `srcId`** (optional **`srcVer`**) are listed. */
  srcLang?: string;
  srcId?: string;
  srcVer?: string;
};

function parseLimit(raw: string | undefined): number | undefined {
  if (raw === undefined || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0
    ? Math.min(Math.floor(n), 2000)
    : undefined;
}

const extLink = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

function Door43Links({
  repoUrl,
  metadataUrl,
  bundleUrl,
}: {
  repoUrl?: string;
  metadataUrl?: string;
  bundleUrl?: string;
}) {
  if (!repoUrl && !metadataUrl && !bundleUrl) {
    return <span style={{ color: "#888" }}>—</span>;
  }
  return (
    <span style={{ display: "inline-flex", gap: "0.45rem", flexWrap: "wrap" }}>
      {repoUrl ? (
        <a href={repoUrl} {...extLink} style={{ whiteSpace: "nowrap" }}>
          repo
        </a>
      ) : null}
      {metadataUrl ? (
        <a href={metadataUrl} {...extLink} style={{ whiteSpace: "nowrap" }}>
          metadata
        </a>
      ) : null}
      {bundleUrl ? (
        <a href={bundleUrl} {...extLink} style={{ whiteSpace: "nowrap" }}>
          bundle
        </a>
      ) : null}
    </span>
  );
}

export default async function TranslationHelpsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const lang = (sp.lang ?? DEFAULT_LANG).trim() || DEFAULT_LANG;
  const org = sp.org?.trim() || undefined;
  const compareLang = sp.compare?.trim() || undefined;
  const limit = parseLimit(sp.limit);
  const srcLang = sp.srcLang?.trim() || undefined;
  const srcId = sp.srcId?.trim() || undefined;
  const srcVer = sp.srcVer?.trim() || undefined;
  const sourceFirstMode = Boolean(
    srcLang && srcLang.length > 0 && srcId && srcId.length > 0,
  );

  const port = createTranslationHelpsAdapter();

  return (
    <main style={{ padding: "1.5rem", maxWidth: "52rem" }}>
      <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
        Translation Helps — tc-ready catalog
      </h1>
      <p style={{ marginBottom: "1rem", color: "#444", fontSize: "0.95rem" }}>
        Read-only data from Door43{" "}
        <code style={{ fontSize: "0.85em" }}>GET /api/v1/catalog/search</code> (
        <code>topic=tc-ready</code>). GL→GL comparison matches{" "}
        <code>subject</code> + <code>identifier</code> only.{" "}
        <strong>Source-first</strong> filters targets whose metadata claims a
        source lineage via <code>srcLang</code>, <code>srcId</code>, optional{" "}
        <code>srcVer</code> (see form below).
      </p>

      <form
        method="GET"
        action="/translation-helps"
        style={{
          marginBottom: "1.25rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "flex-end",
        }}
      >
        <label
          style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}
        >
          <span style={{ fontSize: "0.75rem", color: "#555" }}>Language</span>
          <input
            name="lang"
            defaultValue={lang}
            style={{ width: "6rem", padding: "0.35rem" }}
          />
        </label>
        <label
          style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}
        >
          <span style={{ fontSize: "0.75rem", color: "#555" }}>
            Org (optional)
          </span>
          <input
            name="org"
            defaultValue={org ?? ""}
            placeholder="unfoldingWord"
            style={{ width: "10rem", padding: "0.35rem" }}
          />
        </label>
        <label
          style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}
        >
          <span style={{ fontSize: "0.75rem", color: "#555" }}>
            Compare GL (optional)
          </span>
          <input
            name="compare"
            defaultValue={compareLang ?? ""}
            placeholder="es"
            style={{ width: "6rem", padding: "0.35rem" }}
          />
        </label>
        <label
          style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}
        >
          <span style={{ fontSize: "0.75rem", color: "#555" }}>
            Source lang (metadata)
          </span>
          <input
            name="srcLang"
            defaultValue={srcLang ?? ""}
            placeholder="en"
            style={{ width: "6rem", padding: "0.35rem" }}
          />
        </label>
        <label
          style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}
        >
          <span style={{ fontSize: "0.75rem", color: "#555" }}>
            Source ID (metadata)
          </span>
          <input
            name="srcId"
            defaultValue={srcId ?? ""}
            placeholder="tn"
            style={{ width: "6rem", padding: "0.35rem" }}
          />
        </label>
        <label
          style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}
        >
          <span style={{ fontSize: "0.75rem", color: "#555" }}>
            Source ver (opt.)
          </span>
          <input
            name="srcVer"
            defaultValue={srcVer ?? ""}
            placeholder="v1"
            style={{ width: "6rem", padding: "0.35rem" }}
          />
        </label>
        <label
          style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}
        >
          <span style={{ fontSize: "0.75rem", color: "#555" }}>Limit</span>
          <input
            name="limit"
            defaultValue={sp.limit ?? "500"}
            style={{ width: "5rem", padding: "0.35rem" }}
          />
        </label>
        <button type="submit" style={{ padding: "0.45rem 0.85rem" }}>
          Load
        </button>
      </form>

      {compareLang && compareLang !== lang ? (
        <CompareSection
          port={port}
          sourceLanguage={lang}
          targetLanguage={compareLang}
          organization={org}
          limit={limit}
        />
      ) : sourceFirstMode && srcLang && srcId ? (
        <SourceFirstSection
          port={port}
          targetLanguage={lang}
          sourceLanguage={srcLang}
          sourceIdentifier={srcId}
          sourceVersion={srcVer && srcVer.length > 0 ? srcVer : undefined}
          organization={org}
          limit={limit}
        />
      ) : (
        <CatalogSection
          port={port}
          language={lang}
          organization={org}
          limit={limit}
        />
      )}

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/">← Home</Link>
        {" · "}
        <Link href="/door43">Door43 repo search</Link>
      </p>
    </main>
  );
}

async function CatalogSection({
  port,
  language,
  organization,
  limit,
}: {
  port: TranslationHelpsPort;
  language: string;
  organization?: string;
  limit?: number;
}) {
  const rows = await port.listTcReadyCatalog({
    language,
    organization,
    limit,
  });

  return (
    <>
      <h2 style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}>
        Catalog — {language}
        {organization ? ` · ${organization}` : ""}
      </h2>
      <p style={{ marginBottom: "0.75rem", fontSize: "0.9rem", color: "#333" }}>
        {rows.length} row{rows.length === 1 ? "" : "s"}
      </p>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            fontSize: "0.88rem",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
              <th style={{ padding: "0.35rem 0.5rem" }}>ID</th>
              <th style={{ padding: "0.35rem 0.5rem" }}>Subject</th>
              <th style={{ padding: "0.35rem 0.5rem" }}>Title</th>
              <th style={{ padding: "0.35rem 0.5rem" }}>Version</th>
              <th style={{ padding: "0.35rem 0.5rem" }}>Door43</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={`${r.subject}-${r.identifier}-${r.version}`}
                style={{ borderBottom: "1px solid #eee" }}
              >
                <td
                  style={{ padding: "0.35rem 0.5rem", fontFamily: "monospace" }}
                >
                  {r.identifier}
                </td>
                <td style={{ padding: "0.35rem 0.5rem" }}>{r.subject}</td>
                <td style={{ padding: "0.35rem 0.5rem" }}>{r.title}</td>
                <td style={{ padding: "0.35rem 0.5rem" }}>{r.version}</td>
                <td style={{ padding: "0.35rem 0.5rem", fontSize: "0.82rem" }}>
                  {r.catalogOwner && r.catalogRepo ? (
                    <span
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.2rem",
                      }}
                    >
                      <span style={{ fontFamily: "monospace" }}>
                        {r.catalogOwner}/{r.catalogRepo}
                      </span>
                      <Door43Links
                        repoUrl={r.door43RepoUrl}
                        metadataUrl={r.door43MetadataUrl}
                        bundleUrl={r.door43BundleUrl}
                      />
                    </span>
                  ) : r.door43BundleUrl ? (
                    <Door43Links bundleUrl={r.door43BundleUrl} />
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

async function SourceFirstSection({
  port,
  targetLanguage,
  sourceLanguage,
  sourceIdentifier,
  sourceVersion,
  organization,
  limit,
}: {
  port: TranslationHelpsPort;
  targetLanguage: string;
  sourceLanguage: string;
  sourceIdentifier: string;
  sourceVersion?: string;
  organization?: string;
  limit?: number;
}) {
  const rows = await port.findTargetsClaimingSource({
    targetLanguage,
    sourceLanguage,
    sourceIdentifier,
    sourceVersion,
    organization,
    limit,
  });

  const claimSummary = `${sourceLanguage}/${sourceIdentifier}${
    sourceVersion ? `@${sourceVersion}` : ""
  }`;

  return (
    <>
      <h2 style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}>
        Source-first — targets in <strong>{targetLanguage}</strong> claiming{" "}
        <code style={{ fontSize: "0.95em" }}>{claimSummary}</code>
      </h2>
      <p style={{ marginBottom: "0.75rem", fontSize: "0.9rem", color: "#333" }}>
        {rows.length} match{rows.length === 1 ? "" : "es"} (metadata scan;
        capped by limit)
      </p>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            fontSize: "0.88rem",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
              <th style={{ padding: "0.35rem 0.5rem" }}>ID</th>
              <th style={{ padding: "0.35rem 0.5rem" }}>Subject</th>
              <th style={{ padding: "0.35rem 0.5rem" }}>Title</th>
              <th style={{ padding: "0.35rem 0.5rem" }}>Version</th>
              <th style={{ padding: "0.35rem 0.5rem" }}>Matched source</th>
              <th style={{ padding: "0.35rem 0.5rem" }}>Door43</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={`${r.subject}-${r.identifier}-${r.version}`}
                style={{ borderBottom: "1px solid #eee" }}
              >
                <td
                  style={{ padding: "0.35rem 0.5rem", fontFamily: "monospace" }}
                >
                  {r.identifier}
                </td>
                <td style={{ padding: "0.35rem 0.5rem" }}>{r.subject}</td>
                <td style={{ padding: "0.35rem 0.5rem" }}>{r.title}</td>
                <td style={{ padding: "0.35rem 0.5rem" }}>{r.version}</td>
                <td style={{ padding: "0.35rem 0.5rem", fontSize: "0.82rem" }}>
                  {r.matchedSources
                    .map((s) => `${s.language}/${s.identifier}@${s.version}`)
                    .join(", ")}
                </td>
                <td style={{ padding: "0.35rem 0.5rem", fontSize: "0.82rem" }}>
                  {r.catalogOwner && r.catalogRepo ? (
                    <span
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.2rem",
                      }}
                    >
                      <span style={{ fontFamily: "monospace" }}>
                        {r.catalogOwner}/{r.catalogRepo}
                      </span>
                      <Door43Links
                        repoUrl={r.door43RepoUrl}
                        metadataUrl={r.door43MetadataUrl}
                        bundleUrl={r.door43BundleUrl}
                      />
                    </span>
                  ) : r.door43BundleUrl ? (
                    <Door43Links bundleUrl={r.door43BundleUrl} />
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

async function CompareSection({
  port,
  sourceLanguage,
  targetLanguage,
  organization,
  limit,
}: {
  port: TranslationHelpsPort;
  sourceLanguage: string;
  targetLanguage: string;
  organization?: string;
  limit?: number;
}) {
  const summary = await port.compareTcReadyGlToGl({
    sourceLanguage,
    targetLanguage,
    organization,
    limit,
  });

  return (
    <>
      <h2 style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}>
        GL→GL — {summary.sourceLanguage} vs {summary.targetLanguage}
      </h2>
      <p style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#333" }}>
        Matched: {summary.matched.length} · Missing in target:{" "}
        {summary.missingInTarget.length} · Only in target:{" "}
        {summary.onlyInTarget.length}
      </p>

      {summary.matched.length > 0 ? (
        <>
          <h3 style={{ fontSize: "0.95rem", margin: "0.75rem 0 0.35rem" }}>
            Matched
          </h3>
          <ul style={{ paddingLeft: "1.25rem", marginBottom: "1rem" }}>
            {summary.matched.map((m) => (
              <li
                key={`m-${m.subject}-${m.identifier}`}
                style={{ marginBottom: "0.35rem" }}
              >
                <strong>{m.identifier}</strong> — {m.sourceTitle} /{" "}
                {m.targetTitle}
                <span style={{ color: "#666", fontSize: "0.85em" }}>
                  {" "}
                  · {m.subject}
                </span>
                <span
                  style={{
                    display: "block",
                    marginTop: "0.15rem",
                    fontSize: "0.82em",
                  }}
                >
                  <span style={{ color: "#555" }}>Source: </span>
                  <Door43Links
                    repoUrl={m.sourceDoor43RepoUrl}
                    metadataUrl={m.sourceDoor43MetadataUrl}
                    bundleUrl={m.sourceDoor43BundleUrl}
                  />
                  <span style={{ color: "#888", margin: "0 0.35rem" }}>·</span>
                  <span style={{ color: "#555" }}>Target: </span>
                  <Door43Links
                    repoUrl={m.targetDoor43RepoUrl}
                    metadataUrl={m.targetDoor43MetadataUrl}
                    bundleUrl={m.targetDoor43BundleUrl}
                  />
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {summary.missingInTarget.length > 0 ? (
        <>
          <h3 style={{ fontSize: "0.95rem", margin: "0.75rem 0 0.35rem" }}>
            Missing in target
          </h3>
          <ul style={{ paddingLeft: "1.25rem", marginBottom: "1rem" }}>
            {summary.missingInTarget.map((m) => (
              <li
                key={`miss-${m.subject}-${m.identifier}`}
                style={{ marginBottom: "0.35rem" }}
              >
                <strong>{m.identifier}</strong> — {m.sourceTitle}
                <span
                  style={{
                    display: "block",
                    marginTop: "0.15rem",
                    fontSize: "0.82em",
                  }}
                >
                  <Door43Links
                    repoUrl={m.sourceDoor43RepoUrl}
                    metadataUrl={m.sourceDoor43MetadataUrl}
                  />
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {summary.onlyInTarget.length > 0 ? (
        <>
          <h3 style={{ fontSize: "0.95rem", margin: "0.75rem 0 0.35rem" }}>
            Only in target
          </h3>
          <ul style={{ paddingLeft: "1.25rem", marginBottom: "1rem" }}>
            {summary.onlyInTarget.map((m) => (
              <li
                key={`only-${m.subject}-${m.identifier}`}
                style={{ marginBottom: "0.35rem" }}
              >
                <strong>{m.identifier}</strong> — {m.targetTitle}
                <span
                  style={{
                    display: "block",
                    marginTop: "0.15rem",
                    fontSize: "0.82em",
                  }}
                >
                  <Door43Links
                    repoUrl={m.targetDoor43RepoUrl}
                    metadataUrl={m.targetDoor43MetadataUrl}
                    bundleUrl={m.targetDoor43BundleUrl}
                  />
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}
