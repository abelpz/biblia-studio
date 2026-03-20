# UI philosophy

Biblia Studio front ends follow a **layered UI model** described by Adam Argyle in [*Headless, boneless, skinless & lifeless UI*](https://nerdy.dev/headless-boneless-and-skinless-ui) (nerdy.dev, 2024). The article separates concerns so teams can **compose** behavior, structure, and styling instead of defaulting to single “batteries included” kits.

## Terms (from the article)

| Layer | Idea | You bring |
| --- | --- | --- |
| **Headless** | Components with **behavior and structure**, minimal styling | Visual design (skin) |
| **Boneless** | **Style systems** — tokens, utilities, premade combinations | Markup / components (bones) and behavior (life) |
| **Skinless** | **Unstyled, functioning markup** (bones without opinionated skin) | Styling and app-specific “life” wiring |
| **Lifeless** | **Logic only** — hooks, state, types; **no rendered UI** | Elements, layout, and styles (bones + skin) |

Argyle’s point is that “headless” is often used loosely; splitting **skinless** (unstyled bones) and **lifeless** (pure logic) makes it clearer what a library actually owns.

## How we apply it in Biblia Studio

1. **Prefer lifeless and skinless primitives** for reusable building blocks — especially for scripture UX (navigation, ranges, lists) and editor-adjacent controls. Reach for hook- or state-first APIs (lifeless) and unstyled accessible components (skinless) before adopting heavily themed kits.
2. **Boneless is our design system layer** — consistent spacing, type, color, and motion via a **single** style approach in apps (e.g. utility CSS or token-driven CSS). Apps and `@repo/ui` apply this layer to bones we control.
3. **Headless fits where we want packaged behavior + structure** with styling left to us — useful for complex widgets when we still want inversion of control over look and feel.
4. **Apps own composition** — `apps/*` assemble lifeless + skinless/headless + boneless. `@biblia-studio/*` packages stay **domain- and data-centric**; UI that truly crosses apps should live in `@repo/ui` (or future shared UI packages), documented against this file.
5. **Hexagonal alignment** — UI and routes are **driving adapters**: they invoke use cases and map results to the screen; they do not own Door43 or format rules. See [Hexagonal apps](./05-hexagonal-apps.md).
6. **Fully loaded stacks are optional** — we do not forbid Chakra, shadcn/ui, MUI, etc., but they are **conscious choices** per surface, not the default abstraction for every screen.

## References

- Adam Argyle, [Headless, boneless, skinless & lifeless UI](https://nerdy.dev/headless-boneless-and-skinless-ui), nerdy.dev.
