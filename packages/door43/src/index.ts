/**
 * Door43 (`git.door43.org`) API integration — discovery, content, auth patterns.
 * API reference: https://git.door43.org/api/swagger
 */
export { BIBLIA_STUDIO } from "@biblia-studio/core";

export { DOOR43_HOST_DEFAULT } from "./constants.js";
export {
  DOOR43_REPO_SEARCH_DEFAULT_QUERY,
  searchDoor43Repos,
  type Door43RepoSummary,
} from "./repos-search.js";
export { fetchDoor43Version, type Door43VersionResponse } from "./version.js";
