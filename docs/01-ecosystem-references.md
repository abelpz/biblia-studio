# Ecosystem references

Use these as the **source of truth** for formats, APIs, and platform behavior. Biblia Studio documentation in `docs/` adds **our** layering on top; when in doubt, prefer upstream specs.

## Primary collab repository

- **[unfoldingWord / uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab)** — Team-level developer documentation for Door43 / unfoldingWord tools: getting started, API patterns, repository formats, migrations, and automation (including MCP-oriented material).

## Rendered documentation

- **[docs.page — uW-Tools-Collab](https://docs.page/unfoldingWord/uW-Tools-Collab)** — Browsable site for the same content (search, navigation, cross-links).

## API reference

- **[Door43 / Gitea API (Swagger)](https://git.door43.org/api/swagger)** — Live API reference for `git.door43.org` (discover repos, content, auth patterns as documented upstream).

## AI and automation

- **[AI_DEVELOPER_GUIDE.md](https://github.com/unfoldingWord/uW-Tools-Collab/blob/main/AI_DEVELOPER_GUIDE.md)** (in uW-Tools-Collab) — Roadmap for AI systems, MCP-style workflows, and batch operations against repositories.

## Related specifications (often linked from collab docs)

- **Resource Container** — packaging for Bible texts, notes, words, questions, academy, Open Bible Stories, etc.
- **Scripture Burrito** — alternative scripture/resource packaging; migration topics appear in collab docs.
- **USFM / USX** — scripture markup; implementation details belong in `@biblia-studio/formats` over time.

## How Biblia Studio uses this

1. **Link, don’t duplicate** — Long-form spec prose stays upstream; we summarize and point here.
2. **Implement against specs** — Package READMEs and `docs/02-package-map.md` name which upstream guides each package implements.
3. **Track drift** — When Door43 or RC behavior changes, update our package contracts and add a short note in [Extending upstream docs](./03-extending-upstream-docs.md).
