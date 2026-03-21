# GitHub MCP (Cursor)

This repo includes **project-level** MCP config at [`.cursor/mcp.json`](../.cursor/mcp.json) so the agent can use GitHub’s **remote** MCP server ([official server](https://github.com/github/github-mcp-server)).

## Prerequisites

- **Cursor v0.48.0+** (Streamable HTTP support for remote MCP)
- A **[GitHub Personal Access Token](https://github.com/settings/tokens)** (classic or fine-grained) with the scopes you are comfortable granting (often `repo`, `read:org`, `read:user`, and workflow/read as needed)

## 1. Create a token

Use a **fine-grained** PAT limited to `abelpz/biblia-studio` (or your org) where possible, or a classic PAT with minimal scopes. Never commit the token.

### Token permissions (scopes)

The MCP server can call **many** GitHub APIs; each tool needs matching access. Grant only what you want an agent to do. Official tool ↔ scope notes live in the [github-mcp-server README](https://github.com/github/github-mcp-server).

**Recommended: fine-grained PAT** (single repo)

| Goal                                                        | Typical repository permissions                                                                             |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Read-only** (browse code, issues, PRs, Actions logs)      | **Contents** Read, **Metadata** Read, **Issues** Read, **Pull requests** Read, **Actions** Read (optional) |
| **Day-to-day agent work** (branches, PRs, issues, comments) | Above + **Contents** Read/Write, **Issues** Read/Write, **Pull requests** Read/Write                       |
| **Org/team context** (if tools need it)                     | Under **Account**: **Organization permissions** — e.g. **Members** Read-only (or as required)              |

Add **Dependabot alerts** / security read permissions only if you will use security-related MCP tools.

**Classic PAT** (broader — use only if you must)

| Tier                                               | Scopes                                            |
| -------------------------------------------------- | ------------------------------------------------- |
| **Public repos only**                              | `public_repo`                                     |
| **Private repo + normal GitHub API for that user** | `repo` (full) — wide; prefer fine-grained instead |
| **Org membership / team visibility**               | `read:org`                                        |
| **Inspect Actions / workflows**                    | `read:workflow` (often paired with `repo`)        |
| **Dependabot / code scanning–style APIs**          | `security_events` (only if you need those tools)  |

Start with **read-only** fine-grained permissions; widen if a tool fails with **403** / “resource not accessible by integration”.

## 2. Expose it as `GITHUB_MCP_PAT`

The config reads **`GITHUB_MCP_PAT`** via Cursor’s [config interpolation](https://cursor.com/docs/context/mcp#config-interpolation) (`${env:GITHUB_MCP_PAT}`).

**Windows (current user, persistent)** — PowerShell:

```powershell
[System.Environment]::SetEnvironmentVariable("GITHUB_MCP_PAT", "ghp_your_token_here", "User")
```

Restart Cursor after setting.

**macOS / Linux** — add to `~/.zshrc` or `~/.bashrc`:

```bash
export GITHUB_MCP_PAT="ghp_your_token_here"
```

## 3. Restart Cursor

Fully quit and reopen Cursor so it picks up the env var and reloads MCP.

## 4. Verify

1. **Settings → Tools & Integrations → MCP** (or **Features → Model Context Protocol**): the **github** server should show a **green** / healthy status **and** a **non-zero tool count** (e.g. “N tools enabled”).
2. In Agent chat, check **Available Tools** for GitHub-related tools (e.g. `get_me`, `list_issues`).
3. Optional prompt: “List repositories I can access under abelpz/biblia-studio.”

### Troubleshooting: **“No tools, prompts, or resources”** (enabled but empty)

This usually means Cursor never received a valid capability list from the remote server—most often **auth** or **env**—not that you forgot to click something.

| Check                                  | What to do                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`GITHUB_MCP_PAT` visible to Cursor** | The variable must exist in the environment **when Cursor starts**. On Windows, set a **User** env var and **fully quit** Cursor (all windows), then reopen—or launch Cursor from a shell where you’ve `set`/`export` the variable for that session. If the header interpolates to an empty string, the server may connect but expose **no tools**.                                                                          |
| **Token not expired / not revoked**    | Regenerate on GitHub if unsure; update the env var; restart Cursor.                                                                                                                                                                                                                                                                                                                                                         |
| **Scopes too narrow**                  | Fine-grained: at least **Metadata** read + **Contents** + **Issues** + **Pull requests** for normal agent flows (widen if you still see 403 in **Output → MCP** logs). Classic: typically **`repo`** for private repos. Under-scoped tokens can fail server-side discovery. See [github-mcp-server#1663](https://github.com/github/github-mcp-server/issues/1663) (discussion: PAT scopes fixed “no tools” for some users). |
| **Use PAT in config, not OAuth-only**  | The hosted server expects **`Authorization: Bearer <PAT>`** in [`.cursor/mcp.json`](../.cursor/mcp.json). Relying on OAuth flows without a PAT can fail with auth/DCR errors in MCP logs ([same issue thread](https://github.com/github/github-mcp-server/issues/1663)).                                                                                                                                                    |
| **Cursor version**                     | Use a **recent Cursor** build (remote MCP uses Streamable HTTP); update if MCP logs show transport errors.                                                                                                                                                                                                                                                                                                                  |
| **Logs**                               | **View → Output** → choose **MCP** (or the GitHub server log channel). Look for **401**, **403**, “No server info”, or empty bearer—redact tokens before sharing.                                                                                                                                                                                                                                                           |

After fixing, you should see **many tools** (on the order of dozens), similar to other enabled MCP extensions—not “0 tools”.

## Alternative: local server (Docker)

If remote MCP is blocked (proxy, policy), use the **Docker** block from GitHub’s [Install in Cursor](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-cursor.md) guide and replace the token with `${env:GITHUB_MCP_PAT}` in the `env` section of `mcp.json`.

## Conflicts with global MCP

If you already define a server named `github` in **`~/.cursor/mcp.json`**, Cursor may show two entries or confusing behavior. Prefer **one** `github` definition: remove or rename the duplicate, or disable the extra server under **Settings → MCP**.

## Rotating the PAT

Do this whenever a token might be exposed (chat logs, screen share, committed file) or on your usual security schedule.

1. **Create a new token first** (same type as before: fine-grained on `biblia-studio` or classic), with the [same permissions](#token-permissions-scopes) you need.
2. **Update the environment variable** (Windows — replace the placeholder):

   ```powershell
   [System.Environment]::SetEnvironmentVariable("GITHUB_MCP_PAT", "paste_new_token_here", "User")
   ```

   Close all Cursor windows, then reopen (new processes read the updated user env).

3. **Confirm MCP** — Settings → MCP → GitHub server healthy; run a quick `get_me`–style check in Agent if you want.
4. **Revoke the old token** on GitHub so it cannot be reused:
   - **Fine-grained:** [Developer settings → Fine-grained tokens](https://github.com/settings/personal-access-tokens) → select token → **Delete**.
   - **Classic:** [Developer settings → Personal access tokens](https://github.com/settings/tokens) → **Delete** or **Regenerate** (regenerating invalidates the old secret immediately — only do that if you’re ready to paste the new value everywhere).

**Order:** Prefer **create new → update env → restart Cursor → verify → revoke old**. If you revoke first, MCP breaks until the new token is in place.

## Privacy (name & email in MCP tool output)

Tools like **`get_me`** return whatever the [GitHub REST API](https://docs.github.com/en/rest/users/users#get-the-authenticated-user) exposes to **your** token. You cannot change the MCP server itself; you reduce leakage at **GitHub** and **token** level, and by **not pasting** tool output into shared chats.

1. **Public profile** — [Profile settings](https://github.com/settings/profile): set **Public email** to **Don’t show my email publicly**. Clear or shorten **Name** if you don’t want it returned as profile metadata (some fields may still reflect your account).
2. **Email privacy** — [Email settings](https://github.com/settings/emails): use **Keep my email addresses private** and GitHub’s `noreply` address for git; that affects commits and visibility, not always every API field, but it aligns your account with private email.
3. **Fine-grained PAT** — When creating the token, under **Account permissions**, avoid granting **read** access to **Email addresses** unless a tool you need fails without it. Test MCP after removing it; `get_me` may still return a `name` but omit or limit `email` depending on GitHub’s behavior for that token.
4. **Classic PAT** — The broad **`user`** scope can expose more profile/email-related data. Prefer **fine-grained** tokens with the smallest **User** permissions you can.
5. **Shared agent sessions** — Treat MCP responses like any credential-adjacent output: don’t share screenshots or transcripts that include `get_me` JSON in public channels.

## Security

- Rotate the PAT if it leaks.
- Prefer **fine-grained** tokens scoped to this repository.
- Do **not** put real tokens in `mcp.json` or committed `.env` files.

## References

- [github/github-mcp-server](https://github.com/github/github-mcp-server)
- [Install GitHub MCP Server in Cursor](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-cursor.md)
- [Cursor MCP docs](https://cursor.com/docs/context/mcp)
