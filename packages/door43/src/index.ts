/**
 * Door43 (`git.door43.org`) API integration — discovery, content, auth patterns.
 * API reference: https://git.door43.org/swagger.v1.json (browser: `/api/swagger`).
 */
export { BIBLIA_STUDIO } from "@biblia-studio/core";

export { DOOR43_API_V1_BASE_URL, DOOR43_HOST_DEFAULT } from "./constants.js";
export {
  DOOR43_REPO_SEARCH_DEFAULT_QUERY,
  searchDoor43Repos,
  type Door43RepoSummary,
} from "./repos-search.js";
export { fetchDoor43Version, type Door43VersionResponse } from "./version.js";
export {
  DEFAULT_TC_READY_HELP_SUBJECTS,
  buildCatalogUrl,
  listTcReadyTranslationHelpsResources,
  type Door43CatalogResourceSummary,
  type ListTcReadyHelpsOptions,
} from "./catalog.js";
export {
  buildCatalogMetadataUrl,
  fetchDoor43CatalogMetadata,
  parseCatalogMetadata,
  type Door43CatalogDublinCoreSummary,
  type Door43CatalogMetadataResponse,
  type Door43CatalogMetadataSourceItem,
  type Door43CatalogProjectRow,
  type FetchDoor43CatalogMetadataOptions,
} from "./catalog-metadata.js";
