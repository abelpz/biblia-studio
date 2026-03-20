## Summary

<!-- What does this PR do? Use `Closes #NN` / `Fixes #NN` when it completes an issue — see [`docs/08-github-agent-workflow.md`](../docs/08-github-agent-workflow.md). -->

## Agent / author checklist

- [ ] Scoped change (no unrelated refactors)
- [ ] `bun run lint` — run and passing (or explain)
- [ ] `bun run check-types` — run and passing (or explain)
- [ ] `bun run build` — if build-affecting, run and passing (or explain)
- [ ] No secrets / credentials / `.env` contents in diff
- [ ] Architecture: hexagonal boundaries for `apps/*` respected ([`docs/05-hexagonal-apps.md`](../docs/05-hexagonal-apps.md))
- [ ] UI aligns with [`docs/04-ui-philosophy.md`](../docs/04-ui-philosophy.md) or exception noted below
- [ ] Issue link: body contains **`Closes #…`** / **`Fixes #…`** (or explains why not) per [GitHub agent workflow](../docs/08-github-agent-workflow.md)

## Human reviewer checklist

- [ ] Product / security / data-integrity review as needed
- [ ] New dependencies justified (license, maintenance, size)
- [ ] Upstream spec alignment (Door43 / RC / USFM) or documented divergence
- [ ] Tests / docs updated for meaningful behavior changes

## Notes for reviewers

<!-- Risks, follow-ups, intentional deviations from docs. -->
