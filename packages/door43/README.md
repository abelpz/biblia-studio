# `@biblia-studio/door43`

HTTP client surfaces and types for **Door43** ([Gitea](https://git.door43.org/)). Follow the [Door43 API developer guide](https://github.com/unfoldingWord/uW-Tools-Collab) and live [Swagger](https://git.door43.org/api/swagger).

## Public API (no auth)

The Gitea **`GET /api/v1/version`** endpoint is callable without authentication. Use `fetchDoor43Version()` to hit `https://<host>/api/v1/version` (default host: `git.door43.org`).

```ts
import { fetchDoor43Version } from "@biblia-studio/door43";

const { version } = await fetchDoor43Version();
```

Auth, tokens, and private resources are out of scope for this slice; see Swagger for endpoints that require login.
