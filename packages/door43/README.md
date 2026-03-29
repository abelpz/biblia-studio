# `@biblia-studio/door43`

**TypeScript library** — thin **`fetch`** wrappers and types for **Door43** ([Gitea](https://git.door43.org/)). Intended for **browser or Node** so apps can call Door43 **from the user’s client** without a Biblia Studio HTTP API. Follow the [Door43 API developer guide](https://github.com/unfoldingWord/uW-Tools-Collab) and [`swagger.v1.json`](https://git.door43.org/swagger.v1.json) (browse: [`/api/swagger`](https://git.door43.org/api/swagger)).

## Public API (no auth)

The Gitea **`GET /api/v1/version`** endpoint is callable without authentication. Use `fetchDoor43Version()` to hit `https://<host>/api/v1/version` (default host: `git.door43.org`).

```ts
import { fetchDoor43Version } from "@biblia-studio/door43";

const { version } = await fetchDoor43Version();
```

**`GET /api/v1/repos/search`** — public repository search (no auth). Use `searchDoor43Repos({ query?, limit?, host? })`; the default query constant is `DOOR43_REPO_SEARCH_DEFAULT_QUERY`.

```ts
import { searchDoor43Repos } from "@biblia-studio/door43";

const repos = await searchDoor43Repos({ query: "unfoldingWord", limit: 10 });
```

Auth, tokens, and private resources are out of scope for these slices; see Swagger for endpoints that require login.

## Catalog search (tc-ready — translation helps discovery)

**Translation Helps discovery:** many helps use repo topic **`tc-ready`**. The Gitea catalog endpoint **`GET /api/v1/catalog/search`** accepts `lang`, `topic`, `owner`, `subject`, `limit`, etc. See [`swagger.v1.json`](https://git.door43.org/swagger.v1.json) (`catalogSearch`, `CatalogEntry`).

Use `listTcReadyTranslationHelpsResources()` to search with default `topic=tc-ready` for a language, then optionally restrict by **`subjects`** (exact `subject` strings). A convenience list is **`DEFAULT_TC_READY_HELP_SUBJECTS`**; you can pass your own array instead.

```ts
import {
  DEFAULT_TC_READY_HELP_SUBJECTS,
  DOOR43_API_V1_BASE_URL,
  listTcReadyTranslationHelpsResources,
} from "@biblia-studio/door43";

const helpsOnly = await listTcReadyTranslationHelpsResources({
  language: "en",
  organization: "unfoldingWord",
  subjects: DEFAULT_TC_READY_HELP_SUBJECTS,
});

const allTcReadyForLang = await listTcReadyTranslationHelpsResources({
  language: "es",
});
```

`buildCatalogUrl()` is exported if you need the raw URL (e.g. debugging). The API base is **`DOOR43_API_V1_BASE_URL`** (`https://git.door43.org/api/v1`).

## Catalog metadata (`catalogGetMetadata`)

**`GET /api/v1/catalog/metadata/{owner}/{repo}/{ref}`** returns processed manifest fields (`dublin_core`, `projects`). Use `fetchDoor43CatalogMetadata({ owner, repo, ref, fetch? })` or `buildCatalogMetadataUrl` for debugging. **`parseCatalogMetadata`** parses a JSON body (for tests or custom transports). **`door43MetadataClaimsUpstreamSource`** checks whether **`dublin_core.source`** names a given upstream **`language` + `identifier`** (used whenever pairing a target repo to a source).

Catalog search summaries from `listTcReadyTranslationHelpsResources` may include **`catalogOwner`**, **`catalogRepo`**, and **`catalogRef`** when the raw **`CatalogEntry`** has **`owner`** and **`name`** — use those with metadata to read **`dublin_core.source`** for source-first pairing (scripture and helps).
