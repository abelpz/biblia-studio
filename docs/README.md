# Biblia Studio — internal documentation

Start here, then read in order:

| Doc                                                        | Purpose                                                                                                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [Overview](./00-overview.md)                               | Mission, scope, and how this monorepo is organized                                                                                   |
| [Ecosystem references](./01-ecosystem-references.md)       | Authoritative upstream docs (Door43 / unfoldingWord) and how we use them                                                             |
| [Package map](./02-package-map.md)                         | Workspace packages and boundaries                                                                                                    |
| [Extending upstream docs](./03-extending-upstream-docs.md) | How we maintain our own docs alongside [uW-Tools-Collab](https://github.com/unfoldingWord/uW-Tools-Collab)                           |
| [UI philosophy](./04-ui-philosophy.md)                     | Layered UI model ([Argyle / nerdy.dev](https://nerdy.dev/headless-boneless-and-skinless-ui)): lifeless, skinless, headless, boneless |
| [Hexagonal apps](./05-hexagonal-apps.md)                   | Ports & adapters for `apps/*` ([Cockburn](https://alistair.cockburn.us/hexagonal-architecture/))                                     |
| [AI & human workflow](./06-ai-and-human-workflow.md)       | Agent/human roles, review gates, suggested CI & ADRs                                                                                 |
| [GitHub MCP](./07-github-mcp.md)                           | Cursor + GitHub MCP: `GITHUB_MCP_PAT`, verify in Settings                                                                            |
| [GitHub agent workflow](./08-github-agent-workflow.md)     | Issue-driven delivery + MCP tools (`issue_read`, `create_pull_request`, …)                                                           |
| [CI & branch protection](./09-ci-and-branch-protection.md) | GitHub Actions workflow + how to require checks on `main`                                                                            |
| [ADR guide](./adr/README.md)                               | When and how to add Architecture Decision Records                                                                                    |
| [First project checklist](./10-first-project.md)           | Ready to plan the first feature (CI, labels, branch protection)                                                                      |
