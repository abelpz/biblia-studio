import { DOOR43_REPO_SEARCH_DEFAULT_QUERY } from "@biblia-studio/door43";
import Link from "next/link";
import { createDoor43ReposAdapter } from "../../src/adapters/driven/door43-repos.adapter";

export const dynamic = "force-dynamic";

export default async function Door43Page() {
  const port = createDoor43ReposAdapter();
  const repos = await port.searchPublicRepos({
    query: DOOR43_REPO_SEARCH_DEFAULT_QUERY,
    limit: 15,
  });

  return (
    <main style={{ padding: "1.5rem", maxWidth: "40rem" }}>
      <h1 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
        Door43 — public repo search
      </h1>
      <p style={{ marginBottom: "1rem", color: "#444" }}>
        Read-only list from <code>GET /api/v1/repos/search</code> (no
        authentication).
      </p>
      <ul style={{ listStyle: "disc", paddingLeft: "1.25rem" }}>
        {repos.map((r) => (
          <li key={r.fullName} style={{ marginBottom: "0.35rem" }}>
            <a
              href={r.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit" }}
            >
              {r.fullName}
            </a>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/">← Home</Link>
      </p>
    </main>
  );
}
