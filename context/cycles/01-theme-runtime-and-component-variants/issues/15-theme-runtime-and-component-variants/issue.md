# Issue #15: Theme Runtime And Component Variants

## Acceptance criteria

- No visible **Theme flash** is observed on `/` and `/writing` for light, dark, and system preferences during real-browser verification.
- `pnpm test:unit` passes for the deepened theme contract and runtime adapter behavior.
- `pnpm test:a11y` reports zero axe-core violations.
- `pnpm test:visual` either passes unchanged or produces only intentional snapshot diffs reviewed as component cleanup.
- Theme runtime exports are reduced to the contract needed by production code and tests.
- Each refactored component has one primary render path unless a branch has a distinct semantic responsibility.
- Any **Performance budget** movement is documented as a descriptive signal.

## Implementation approach

- Start with the canonical theme runtime contract and export boundary.
- Preserve and verify pre-paint theme boot behavior before deleting or consolidating boot-adjacent code.
- Align theme interaction state, document attributes, favicon updates, and tests with the contract.
- Delete unused theme code only with deletion-test evidence that it is not protecting against **Theme flash**.
- Collapse behavior-preserving component variant branches in focused vertical slices for `IconButton`, `NavTile`, `Cartouche`, and `CTA`.
- Document **Performance budget** movement as a reference signal, not a hard gate, unless a later cycle changes that policy.
- Run final unit, accessibility, visual, and first-paint verification before closing the parent issue.

## Dependencies

- Source PRD: `context/cycles/01-theme-runtime-and-component-variants/prd.md`.
- Sub-PRD: `context/cycles/01-theme-runtime-and-component-variants/issues/15-theme-runtime-and-component-variants/sub-prd.md`.
- Current theme runtime, boot path, interaction adapter, favicon behavior, and theme tests.
- Current component implementations for `IconButton`, `NavTile`, `Cartouche`, and `CTA`.
- Regression checks documented for unit, accessibility, visual, and real-browser first-paint verification.

## Flags

- Do not add Astro Content Collections, mantra routes, section registries, or new public pages.
- Do not activate `SOFTWARE`, `Fotos`, or `VIDEOS`.
- Do not redesign the visual language, typography, color palette, or navigation model.
- Do not make performance budgets a hard gate for this cycle.
- Do not remove duplicated theme boot logic merely because it looks redundant; remove or consolidate it only after proving no-**Theme flash** behavior remains intact.
- Resolve the active theme control representation during implementation: `aria-pressed`, `data-state`, class names, or a combination that best preserves accessibility and styling clarity.
- Resolve the first-paint verification method during implementation with a real browser path, not only DOM tests.
