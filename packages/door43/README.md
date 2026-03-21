# `@biblia-studio/door43`

HTTP client surfaces and types for **Door43** ([Gitea](https://git.door43.org/)). Follow the [Door43 API developer guide](https://github.com/unfoldingWord/uW-Tools-Collab) and live [Swagger](https://git.door43.org/api/swagger).

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
