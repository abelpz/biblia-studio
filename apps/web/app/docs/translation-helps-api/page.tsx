import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./page.module.css";

export const metadata = {
  title: "Translation helps library API",
  description:
    "TypeScript/JavaScript API for @biblia-studio/door43 and @biblia-studio/translation — catalog search, GL→GL comparison, source-first.",
};

/** Monorepo `docs/18-translation-helps-domain-api.md` (cwd is `apps/web` when built). */
function docPath(): string {
  return path.join(
    process.cwd(),
    "..",
    "..",
    "docs",
    "18-translation-helps-domain-api.md",
  );
}

export default async function TranslationHelpsApiDocsPage() {
  let markdown: string;
  try {
    const raw = await readFile(docPath(), "utf8");
    markdown = raw.replace(/^#\s[^\n]*\n+/, "");
  } catch {
    markdown = [
      "## Document not found",
      "",
      "This page reads `docs/18-translation-helps-domain-api.md` from the monorepo root. It is unavailable in this deployment layout.",
      "",
      "Clone the Biblia Studio monorepo and open `docs/18-translation-helps-domain-api.md`, or run the dev server from the repository root.",
    ].join("\n");
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <p className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span aria-hidden="true"> / </span>
          <span>Docs</span>
        </p>
        <h1 className={styles.title}>Translation helps — library API</h1>
        <p className={styles.lead}>
          TypeScript/JavaScript surface: import{" "}
          <code>@biblia-studio/door43</code> and{" "}
          <code>@biblia-studio/translation</code>. Same markdown as in the repo
          under <code>docs/18-translation-helps-domain-api.md</code>
          (source of truth).
        </p>
      </header>
      <article className={styles.prose}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </article>
      <p style={{ marginTop: "2rem", fontSize: "0.9rem", opacity: 0.85 }}>
        <Link href="/">← Home</Link>
        {" · "}
        <Link href="/translation-helps">Translation helps (demo)</Link>
      </p>
    </div>
  );
}
