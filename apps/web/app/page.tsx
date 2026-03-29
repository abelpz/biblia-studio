import Link from "next/link";
import styles from "./page.module.css";

const TRANSLATION_HELPS = "/translation-helps?lang=en";
const TRANSLATION_HELPS_MATRIX =
  "/translation-helps?lang=en&compare=es&matrix=1&matrixMax=10";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.appTitle}>Biblia Studio</h1>
          <p className={styles.appLead}>
            Open a tool below. Same routes work from any browser tab (bookmark
            or share the URL).
          </p>
        </div>

        <nav className={styles.appNav} aria-label="App pages">
          <ul className={styles.appNavList}>
            <li className={styles.appNavItem}>
              <Link href="/door43" className={styles.appNavLink}>
                Door43
              </Link>
              <p className={styles.appNavDesc}>
                Search and open public scripture repositories (read-only).
              </p>
            </li>
            <li className={styles.appNavItem}>
              <Link href={TRANSLATION_HELPS} className={styles.appNavLink}>
                Translation helps
              </Link>
              <p className={styles.appNavDesc}>
                tc-ready catalog, optional GL→GL compare, source-first filters,
                repo and metadata links.
              </p>
              <p className={styles.appNavExamples}>
                <Link
                  href={TRANSLATION_HELPS_MATRIX}
                  className={styles.appNavSubLink}
                >
                  Try book matrix (English × Spanish sample)
                </Link>
              </p>
            </li>
            <li className={styles.appNavItem}>
              <Link href="/editor" className={styles.appNavLink}>
                Scripture editor
              </Link>
              <p className={styles.appNavDesc}>
                WYSIWYG USFM in the browser (ProseMirror).
              </p>
            </li>
            <li className={styles.appNavItem}>
              <Link
                href="/docs/translation-helps-api"
                className={styles.appNavLink}
              >
                Translation helps — library API
              </Link>
              <p className={styles.appNavDesc}>
                Docs for <code>@biblia-studio/door43</code> and{" "}
                <code>@biblia-studio/translation</code> (client-side TypeScript
                API).
              </p>
            </li>
          </ul>
        </nav>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://vercel.com/templates?search=turborepo&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Examples
        </a>
        <a
          href="https://turborepo.dev?utm_source=create-turbo"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to turborepo.dev →
        </a>
      </footer>
    </div>
  );
}
