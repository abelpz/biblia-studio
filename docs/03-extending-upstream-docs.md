# Extending upstream documentation

The [uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab) repository is the **canonical** developer handbook for Door43 / unfoldingWord resources, APIs, and formats (see [Ecosystem references](./01-ecosystem-references.md)).

Biblia Studio maintains **additional** documentation in this repo for:

1. **Monorepo architecture** — How `@biblia-studio/*` packages split responsibilities ([Package map](./02-package-map.md)).
2. **Implementation contracts** — TypeScript public APIs, error models, and versioning notes that belong next to code, not in the upstream collab repo.
3. **Product decisions** — What we prioritize in apps, UX constraints, and integration choices that are specific to Biblia Studio.

## Rules of thumb

| Situation                                                | Where to document                                                                                         |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| “How does Resource Container X work?”                    | Link to uW-Tools-Collab / docs.page; add a short summary only if needed for navigation.                   |
| “How does `@biblia-studio/formats` parse or validate X?” | Package `README.md` + optional `docs/` deep dive.                                                         |
| “How do we authenticate to Door43 in this monorepo?”     | `@biblia-studio/door43` README + env var table.                                                           |
| “What is Biblia Studio for?”                             | [Overview](./00-overview.md) and root `README.md`.                                                        |
| “How does FIA relate to our packages?”                   | [Ecosystem references](./01-ecosystem-references.md) (FIA section); `@biblia-studio/study` / apps for UX. |

## Contributing docs

- Prefer **relative links** to `docs/*.md` inside this repo.
- Prefer **stable upstream links** (repo paths or docs.page) for external guides.
- When upstream changes break our assumptions, add a dated note under `docs/changelog/` (create the folder when the first entry is needed).
