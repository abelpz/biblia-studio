/**
 * Driven port: public Door43 repo discovery (no auth).
 * Implemented by adapters that call `@biblia-studio/door43`.
 */
export type Door43RepoListItem = {
  fullName: string;
  name: string;
  htmlUrl: string;
};

export interface Door43ReposPort {
  searchPublicRepos(args: {
    query: string;
    limit?: number;
  }): Promise<Door43RepoListItem[]>;
}
