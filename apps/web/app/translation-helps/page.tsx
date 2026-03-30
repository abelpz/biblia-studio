import Link from "next/link";
import { createTranslationHelpsAdapter } from "../../src/adapters/driven/translation-helps.adapter";
import type { TranslationHelpsPort } from "../../src/ports/translation-helps.port";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const DEFAULT_LANG = "en";

type Search = {
  lang?: string;
  org?: string;
  compare?: string;
  limit?: string;
  /** With GL→GL **compare**, set **`1`** to load metadata + git trees and diff manifest **file paths** per matched resource. */
  matrix?: string;
  /** Max matched pairs for the book matrix (each pair = 2 metadata + 2 git-tree requests; 1–40, default 15). */
  matrixMax?: string;
  /**
   * Target scan uses **`lang`**. When set with **`srcId`**, rows whose metadata **`dublin_core.source`** matches
   * **`srcLang` + `srcId`** (optional **`srcVer`**, **`srcOrg`** when the manifest pins upstream org).
   */
  srcLang?: string;
  srcId?: string;
  srcVer?: string;
  /** Upstream catalog **`owner`**; required for metadata **`source`** entries that include **`owner`** / **`organization`**. */
  srcOrg?: string;
};

function parseLimit(raw: string | undefined): number | undefined {
  if (raw === undefined || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0
    ? Math.min(Math.floor(n), 2000)
    : undefined;
}

function parseMatrixMatchedLimit(raw: string | undefined): number {
  if (raw === undefined || raw === "") return 15;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 15;
  return Math.min(40, Math.floor(n));
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
  const srcOrg = sp.srcOrg?.trim() || undefined;
  const sourceFirstMode = Boolean(
    srcLang && srcLang.length > 0 && srcId && srcId.length > 0,
  );
  const compareTarget =
    compareLang && compareLang.length > 0 && compareLang !== lang
      ? compareLang
      : undefined;
  const compareActive = compareTarget !== undefined;

  const port = createTranslationHelpsAdapter();

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Translation helps</h1>
      <p className={styles.subtitle}>
        Resources for Bible translation teams—notes, questions, word lists, and
        similar helps—from the public{" "}
        <a href="https://door43.org" {...extLink}>
          Door43
        </a>{" "}
        catalog. Nothing here is edited in Biblia Studio; this page only lists
        and compares what is already published.
      </p>

      <section className={styles.introBox} aria-labelledby="whats-on-page">
        <h2 id="whats-on-page" className={styles.introBoxTitle}>
          What you&apos;re seeing on this page
        </h2>
        {compareActive ? (
          <>
            <p>
              You asked for a <strong>side-by-side check</strong> between{" "}
              <strong>{lang}</strong> and <strong>{compareLang}</strong>. We
              find resources that look like the <em>same kind</em> of help in
              both languages (same catalog identifier and subject).{" "}
              <strong>Matched</strong> has both sides; the other sections list
              helps that only exist on one side.
            </p>
            {sp.matrix === "1" ? (
              <p>
                <strong>Book matrix</strong> is on: for each matched pair we
                load catalog metadata and recursive <strong>git trees</strong>,
                then diff <strong>file paths</strong> under each manifest&apos;s{" "}
                <code>projects</code> folders (so Translation Words / Academy
                compare real blobs, not only matching directory names). Extra
                network per pair.
              </p>
            ) : null}
          </>
        ) : sourceFirstMode && srcLang && srcId ? (
          <p>
            You&apos;re filtering <strong>{lang}</strong> resources that{" "}
            <strong>say in metadata</strong> they come from a specific source:{" "}
            <strong>
              {srcLang}/{srcId}
              {srcVer ? `@${srcVer}` : ""}
              {srcOrg ? ` · org ${srcOrg}` : ""}
            </strong>
            . That is useful when you want &ldquo;everything in this language
            that claims this upstream.&rdquo;
          </p>
        ) : (
          <>
            <p>
              You&apos;re browsing <strong>{lang}</strong> entries tagged{" "}
              <strong>translation-ready</strong> (&ldquo;tc-ready&rdquo;) so
              they show up in translation tools.{" "}
              <strong>Each row is one published resource</strong> (for example
              translation notes or questions).
            </p>
            <p>
              Use <strong>Language</strong> below to switch the list; add{" "}
              <strong>Compare GL</strong> with another language code to see
              matches and gaps between two languages.
            </p>
            <ul>
              <li>
                <strong>ID</strong> — short catalog name (e.g.{" "}
                <code style={{ fontSize: "0.9em" }}>tn</code> for translation
                notes)
              </li>
              <li>
                <strong>Subject</strong> — kind of content
              </li>
              <li>
                <strong>Title</strong> — readable name
              </li>
              <li>
                <strong>Version</strong> — published release
              </li>
              <li>
                <strong>Door43</strong> — open the Git repo, catalog metadata,
                or a bundle download when links exist
              </li>
            </ul>
          </>
        )}
      </section>

      <details className={styles.technical}>
        <summary>Technical details (API &amp; parameters)</summary>
        <div>
          <p>
            Read-only data from Door43{" "}
            <code style={{ fontSize: "0.85em" }}>
              GET /api/v1/catalog/search
            </code>{" "}
            with <code>topic=tc-ready</code>. GL→GL comparison matches{" "}
            <code>subject</code> and <code>identifier</code> only.{" "}
            <strong>Source-first</strong> uses rows whose metadata{" "}
            <code>dublin_core.source</code> matches <code>srcLang</code>,{" "}
            <code>srcId</code>, optional <code>srcVer</code>, and optional{" "}
            <code>srcOrg</code> when metadata pins <code>owner</code>/
            <code>organization</code>. <strong>Book matrix</strong> diffs repo{" "}
            <strong>blob paths</strong> under each side&apos;s{" "}
            <code>manifest.projects[].path</code> roots using metadata +{" "}
            <code>git/trees?recursive=true</code> (extra requests per pair).
          </p>
        </div>
      </details>

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
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
            maxWidth: "9rem",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "#555" }}>
            Book matrix
          </span>
          <span
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <input
              type="checkbox"
              name="matrix"
              value="1"
              defaultChecked={sp.matrix === "1"}
            />
            <span style={{ fontSize: "0.7rem", color: "#666" }}>
              metadata books
            </span>
          </span>
        </label>
        <label
          style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}
        >
          <span style={{ fontSize: "0.75rem", color: "#555" }}>Matrix max</span>
          <input
            name="matrixMax"
            defaultValue={sp.matrixMax ?? "15"}
            title="Max matched catalog pairs (1–40)"
            style={{ width: "4.5rem", padding: "0.35rem" }}
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
          <span style={{ fontSize: "0.75rem", color: "#555" }}>
            Source org (opt.)
          </span>
          <input
            name="srcOrg"
            defaultValue={srcOrg ?? ""}
            placeholder="unfoldingWord"
            title="Upstream catalog owner when metadata source lists owner/organization"
            style={{ width: "8rem", padding: "0.35rem" }}
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

      {compareActive ? (
        <>
          <CompareSection
            port={port}
            sourceLanguage={lang}
            targetLanguage={compareTarget}
            organization={org}
            limit={limit}
          />
          {sp.matrix === "1" ? (
            <BookMatrixSection
              port={port}
              sourceLanguage={lang}
              targetLanguage={compareTarget}
              organization={org}
              limit={limit}
              matrixMatchedLimit={parseMatrixMatchedLimit(sp.matrixMax)}
            />
          ) : null}
        </>
      ) : sourceFirstMode && srcLang && srcId ? (
        <SourceFirstSection
          port={port}
          targetLanguage={lang}
          sourceLanguage={srcLang}
          sourceIdentifier={srcId}
          sourceCatalogOwner={srcOrg && srcOrg.length > 0 ? srcOrg : undefined}
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
        Resources in this list — {language}
        {organization ? ` · org: ${organization}` : ""}
      </h2>
      <p className={styles.tableLead}>
        <strong>{rows.length}</strong> resource
        {rows.length === 1 ? "" : "s"} (capped by <strong>Limit</strong> in the
        form above). Scroll horizontally on small screens if the table is wide.
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
  sourceCatalogOwner,
  sourceVersion,
  organization,
  limit,
}: {
  port: TranslationHelpsPort;
  targetLanguage: string;
  sourceLanguage: string;
  sourceIdentifier: string;
  sourceCatalogOwner?: string;
  sourceVersion?: string;
  organization?: string;
  limit?: number;
}) {
  const rows = await port.findTargetsClaimingSource({
    targetLanguage,
    sourceLanguage,
    sourceIdentifier,
    sourceCatalogOwner,
    sourceVersion,
    organization,
    limit,
  });

  const claimSummary = `${sourceLanguage}/${sourceIdentifier}${
    sourceVersion ? `@${sourceVersion}` : ""
  }${sourceCatalogOwner ? ` · org:${sourceCatalogOwner}` : ""}`;

  return (
    <>
      <h2 style={{ fontSize: "1.05rem", marginBottom: "0.5rem" }}>
        Resources claiming this source — {targetLanguage}
      </h2>
      <p className={styles.tableLead}>
        Filter: metadata says source is{" "}
        <code style={{ fontSize: "0.95em" }}>{claimSummary}</code>.{" "}
        <strong>{rows.length}</strong> match{rows.length === 1 ? "" : "es"}{" "}
        (scan capped by your limit).
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

/** Above this count (or char budget), path lists use `<details>` instead of one long comma line. */
const MATRIX_PATH_INLINE_MAX = 6;
const MATRIX_PATH_INLINE_CHARS = 220;

function MatrixPathDiffCell({ paths }: { paths: string[] }) {
  if (paths.length === 0) {
    return "—";
  }
  const joined = paths.join(", ");
  if (
    paths.length <= MATRIX_PATH_INLINE_MAX &&
    joined.length <= MATRIX_PATH_INLINE_CHARS
  ) {
    return <span style={{ wordBreak: "break-word" }}>{joined}</span>;
  }
  return (
    <details className={styles.matrixPathDetails}>
      <summary className={styles.matrixPathSummary}>
        {paths.length} path{paths.length === 1 ? "" : "s"}
      </summary>
      <div className={styles.matrixPathScroll}>
        <ul className={styles.matrixPathUl}>
          {paths.map((p) => (
            <li key={p}>
              <code>{p}</code>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

async function BookMatrixSection({
  port,
  sourceLanguage,
  targetLanguage,
  organization,
  limit,
  matrixMatchedLimit,
}: {
  port: TranslationHelpsPort;
  sourceLanguage: string;
  targetLanguage: string;
  organization?: string;
  limit?: number;
  matrixMatchedLimit: number;
}) {
  const book = await port.compareTcReadyGlToGlBookMatrix({
    sourceLanguage,
    targetLanguage,
    organization,
    limit,
    matrixMatchedLimit,
  });

  return (
    <>
      <h2
        style={{
          fontSize: "1.05rem",
          marginTop: "1.75rem",
          marginBottom: "0.5rem",
        }}
      >
        Manifest files in each matched pair ({book.sourceLanguage} ↔{" "}
        {book.targetLanguage})
      </h2>
      <p
        style={{ marginBottom: "0.75rem", fontSize: "0.88rem", color: "#444" }}
      >
        For up to <strong>{matrixMatchedLimit}</strong> matched resources we
        loaded catalog metadata and <strong>recursive git trees</strong>, then
        compared which <strong>blob paths</strong> fall under each side&apos;s
        manifest <code>projects[].path</code> roots (so Translation Words /
        Academy entries compare actual files, not only shared folder names).{" "}
        <strong>{book.rows.length}</strong> pair
        {book.rows.length === 1 ? "" : "s"} loaded;{" "}
        <strong>{book.skipped.length}</strong> skipped (missing coords or fetch
        errors—see list below if any).
      </p>
      {book.skipped.length > 0 ? (
        <ul
          style={{
            fontSize: "0.82rem",
            color: "#555",
            marginBottom: "1rem",
            paddingLeft: "1.2rem",
          }}
        >
          {book.skipped.map((s) => (
            <li key={`skip-${s.subject}-${s.identifier}`}>
              <code>{s.identifier}</code> — {s.reason.replace(/_/g, " ")}
            </li>
          ))}
        </ul>
      ) : null}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            fontSize: "0.82rem",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
              <th style={{ padding: "0.35rem 0.45rem" }}>ID</th>
              <th style={{ padding: "0.35rem 0.45rem" }}>Both</th>
              <th style={{ padding: "0.35rem 0.45rem" }}>Source only</th>
              <th style={{ padding: "0.35rem 0.45rem" }}>Target only</th>
            </tr>
          </thead>
          <tbody>
            {book.rows.map((r) => (
              <tr
                key={`bm-${r.subject}-${r.identifier}`}
                style={{ borderBottom: "1px solid #eee" }}
              >
                <td
                  style={{
                    padding: "0.35rem 0.45rem",
                    fontFamily: "monospace",
                    verticalAlign: "top",
                  }}
                >
                  {r.identifier}
                  <span
                    style={{
                      display: "block",
                      color: "#666",
                      fontSize: "0.85em",
                      marginTop: "0.15rem",
                    }}
                  >
                    {r.sourceTitle} / {r.targetTitle}
                  </span>
                </td>
                <td
                  style={{ padding: "0.35rem 0.45rem", verticalAlign: "top" }}
                >
                  <MatrixPathDiffCell paths={r.pathsInBoth} />
                </td>
                <td
                  style={{ padding: "0.35rem 0.45rem", verticalAlign: "top" }}
                >
                  <MatrixPathDiffCell paths={r.pathsOnlyInSource} />
                </td>
                <td
                  style={{ padding: "0.35rem 0.45rem", verticalAlign: "top" }}
                >
                  <MatrixPathDiffCell paths={r.pathsOnlyInTarget} />
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
        Compare — {summary.sourceLanguage} and {summary.targetLanguage}
      </h2>
      <p style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#333" }}>
        <strong>{summary.matched.length}</strong> matched (same kind of help in
        both), <strong>{summary.missingInTarget.length}</strong> only in{" "}
        {summary.sourceLanguage}, <strong>{summary.onlyInTarget.length}</strong>{" "}
        only in {summary.targetLanguage}.
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
