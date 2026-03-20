# Instructions for AI coding agents

Humans supervise and review all changes. Optimize for **small, reviewable diffs**, **traceable decisions**, and **safe handling of scripture-related and Door43-adjacent systems**.

## Read first

1. **[`README.md`](./README.md)** — scope and commands  
2. **[`docs/00-overview.md`](./docs/00-overview.md)** — principles  
3. **[`docs/02-package-map.md`](./docs/02-package-map.md)** — where code belongs  
4. **[`docs/04-ui-philosophy.md`](./docs/04-ui-philosophy.md)** — UI layers  
5. **[`docs/05-hexagonal-apps.md`](./docs/05-hexagonal-apps.md)** — apps: ports & adapters  
6. **[`docs/06-ai-and-human-workflow.md`](./docs/06-ai-and-human-workflow.md)** — review gates, security, dependencies  

For Door43 / unfoldingWord **formats and APIs**, link to upstream; do not copy large spec text — see [`docs/01-ecosystem-references.md`](./docs/01-ecosystem-references.md).

## Hard rules

- **Scope** — Change only what the task requires. No drive-by refactors or unrelated formatting.  
- **Architecture** — `@biblia-studio/*` = shared domain and infrastructure building blocks. `apps/*` = composition, **hexagonal** wiring, UI. Do not put Door43 fetch logic or USFM parsing inside React leaves; use ports/adapters and packages.  
- **UI** — Prefer lifeless → skinless/headless → boneless per [`docs/04-ui-philosophy.md`](./docs/04-ui-philosophy.md).  
- **Secrets** — Never commit tokens, passwords, or private keys. Use env vars documented in README or package README; use placeholders in examples.  
- **Upstream truth** — Specs for RC/USFM/Door43 live in [uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab) and linked docs; cite them when behavior is spec-driven.  
- **Dependencies** — New runtime dependencies need a one-line justification in the PR/summary (security, size, maintenance). Prefer stdlib / existing stack unless clearly insufficient.  
- **Tests** — Add or update tests when behavior is non-trivial or regression-prone; run the narrowest relevant check before finishing (`bun run check-types`, `bun run lint`, targeted test if present).  

## Before you finish a task

```sh
bun run lint
bun run check-types
```

If you touched production build paths:

```sh
bun run build
```

Report what you ran and any failures or skips.

## When to stop and leave notes for humans

- Ambiguous product or security tradeoff  
- New third-party service or OAuth scope  
- Breaking API or data migration  
- Copying or mirroring large upstream documentation (link + short summary instead)  

State open questions explicitly at the end of your summary so reviewers can decide quickly.
