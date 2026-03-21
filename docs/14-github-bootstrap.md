# GitHub bootstrap (labels, branch protection, PAT)

One-time or **fork** setup so local workflows match the canonical repo.

## Labels (agent workflow)

From the repo root (requires [GitHub CLI](https://cli.github.com/) `gh` auth):

```sh
OWNER=abelpz
REPO=biblia-studio

gh label create agent --color 0E8A16 --description "Work suitable for an AI coding agent" --repo "$OWNER/$REPO" 2>/dev/null || true
gh label create needs-triage --color FBCA04 --description "Human should refine scope before an agent starts" --repo "$OWNER/$REPO" 2>/dev/null || true
```

(`|| true` avoids failing if labels already exist.)

## Branch protection (CLI)

After **at least one green CI run**, the required check name is usually **`checks`** (job id in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)).

Prefer **Settings → Branches** in the GitHub UI (see [CI & branch protection](./09-ci-and-branch-protection.md)). For automation, use the [REST API](https://docs.github.com/en/rest/branches/branch-protection) or `gh api` with a token that has **admin** on the repo—mis-typed context names block merges.

## Cursor — GitHub MCP token

Set `GITHUB_MCP_PAT` in your environment (or Cursor env) per [GitHub MCP](./07-github-mcp.md). Copy [`.env.example`](../.env.example) to `.env` locally **only** for tooling that reads it; never commit secrets.

## Related

- [CI & branch protection](./09-ci-and-branch-protection.md)
- [GitHub agent workflow](./08-github-agent-workflow.md)
