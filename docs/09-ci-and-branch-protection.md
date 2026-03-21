# CI and branch protection

## Continuous Integration (CI)

**Workflow:** [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

On every **push** to `main` and every **pull request** targeting `main`, GitHub Actions:

1. Checks out the repo on **Ubuntu**
2. Installs **Bun** `1.3.3` (matches [`package.json`](../package.json) `packageManager`)
3. Runs `bun install --frozen-lockfile`
4. Runs `bun run lint` → `bun run check-types` → `bun run test` → `bun run build`

PRs should stay green before merge. Agents must run the same commands locally when possible ([`AGENTS.md`](../AGENTS.md)).

## Branch protection (manual setup on GitHub)

CI only **reports** status; **branch protection** enforces it. A maintainer should configure:

1. Repo **Settings** → **Branches** → **Add rule** for `main`
2. Enable **Require a pull request before merging**
3. Enable **Require status checks to pass before merging** → select the **CI** workflow job (name may appear as **checks** or **CI / checks** after the first run)
4. Optionally: **Require branches to be up to date before merging**, **Do not allow bypassing** (as appropriate for your team)

Until this is enabled, merges can still proceed without a green CI if someone has rights.

### Applied on `abelpz/biblia-studio`

`main` is configured to **require the `checks` status** (GitHub Actions job from [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)) with **strict** updates (branch must be up to date before merge). This was set via the GitHub API after the first green run.

**Optional:** Turn on **Require a pull request before merging** in **Settings → Branches** if you want to disallow direct pushes to `main` (solo maintainers may rely on admin bypass or keep direct pushes for emergencies).

### Finding the exact status check name

After **one successful** workflow run on `main` or a PR, open **Actions** → latest **CI** run → the job is named **`checks`**. In branch protection, the selectable check often appears as **`CI / checks`** (workflow file name + job id).

### CLI alternative (advanced)

If you use the [GitHub REST API](https://docs.github.com/en/rest/branches/branch-protection) or `gh api`, the **context** string must match the check run name GitHub shows. Mis-typed contexts block merges silently until fixed. When unsure, use the **Settings → Branches** UI.

## Related

- [GitHub agent workflow](./08-github-agent-workflow.md) — PR flow with MCP
- [GitHub Actions docs](https://docs.github.com/en/actions)
