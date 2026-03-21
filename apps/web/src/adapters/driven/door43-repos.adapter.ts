import { searchDoor43Repos } from "@biblia-studio/door43";
import type {
  Door43RepoListItem,
  Door43ReposPort,
} from "../../ports/door43-repos-port";

function mapRow(row: {
  fullName: string;
  name: string;
  htmlUrl: string;
}): Door43RepoListItem {
  return {
    fullName: row.fullName,
    name: row.name,
    htmlUrl: row.htmlUrl,
  };
}

export function createDoor43ReposAdapter(): Door43ReposPort {
  return {
    async searchPublicRepos({ query, limit }) {
      const rows = await searchDoor43Repos({ query, limit });
      return rows.map(mapRow);
    },
  };
}
