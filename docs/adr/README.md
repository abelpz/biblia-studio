# Architecture Decision Records (ADRs)

Use ADRs for **significant, hard-to-reverse** choices (auth model, sync strategy, storage, major API shapes). Skip them for routine bugs and small refactors.

## When to add one

- Multiple valid options existed and you picked one.
- Future contributors or agents might otherwise re-debate the same topic.
- The decision affects more than one package or app.

## Naming

`NNNN-short-kebab-title.md` with a **four-digit** sequence (e.g. `0001-use-ports-for-door43.md`). The next number is one higher than the latest file in this folder.

## Suggested sections

1. **Status** — Proposed | Accepted | Superseded by ADR-NNNN
2. **Context** — Problem and constraints.
3. **Decision** — What we chose.
4. **Consequences** — Tradeoffs, follow-up work, what we are _not_ doing.

This follows the style popularized by Michael Nygard; short is better than exhaustive.

## Index

| ADR | Title                                              |
| --- | -------------------------------------------------- |
| —   | _Add the first ADR when a major decision is made._ |
