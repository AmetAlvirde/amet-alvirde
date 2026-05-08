# Theme Runtime And Component Variants PRD

## Focus

Deepen the existing theme runtime and component variant surfaces so the personal website can be refactored without reintroducing theme flash, duplicated theme semantics, or duplicated component markup.

## Intentions

- Preserve the visitor's selected **Theme preference** from the first paint through client-side initialization.
- Make the absence of **Theme flash** the primary quality bar for all theme changes.
- Turn theme behavior into a small, explicit runtime contract with thin boot and interaction adapters.
- Simplify presentational components by moving variant differences into named class and attribute decisions instead of duplicated render branches.
- Keep the cycle focused on codebase depth before adding new sections, content collections, or prototype-driven features.
- Treat the **Performance budget** as a descriptive reference signal during this cycle, not as a hard blocker.

## Goals

- Create one canonical theme runtime contract for valid preferences, storage key, actual theme resolution, document attributes, and favicon target selection.
- Keep or improve the current no-flash theme boot behavior for light, dark, and system preferences.
- Reduce the public export surface of the theme runtime to the smallest interface needed by boot, interaction, and tests.
- Remove theme code that has no current observable responsibility only when tests and first-paint checks prove it is not protecting against **Theme flash**.
- Refactor `IconButton`, `NavTile`, `Cartouche`, and `CTA` toward single render paths with explicit variants where the existing markup branches are behavior-preserving duplicates.
- Update context and cycle docs to state that performance budgets are reference baselines unless a later cycle makes them imperative.
- Preserve the current **Accessibility baseline** on `/` and `/writing`.
- Preserve the current **Visual baseline** except for intentional, reviewed snapshot updates caused by behavior-preserving component cleanup.

## Non-goals

- Do not add Astro Content Collections, mantra routes, section registries, or new public pages.
- Do not activate `SOFTWARE`, `Fotos`, or `VIDEOS`.
- Do not redesign the visual language, typography, color palette, or navigation model.
- Do not make performance budgets a hard gate for this cycle.
- Do not remove duplicated theme boot logic merely because it looks redundant; remove or consolidate it only after proving the no-**Theme flash** behavior remains intact.
- Do not use the unrevealed prototype as an inferred product direction.

## User stories

- As a returning visitor, I want my saved **Theme preference** applied before the page visibly renders so that I do not see the wrong theme flash on load.
- As a visitor using system theme, I want the page to match my system setting on first paint and after system changes so that the site feels visually stable.
- As a maintainer, I want one theme runtime contract so that changing theme behavior does not require auditing inline scripts, utility exports, CSS selectors, and tests separately.
- As a maintainer, I want component variants expressed in one render path where practical so that I can adjust button, tile, CTA, and cartouche behavior without mentally diffing duplicated JSX.
- As a maintainer, I want performance budgets documented as reference signals so that I can record trade-offs without treating every size movement as a blocker.

## Encounter statements

- When the home surface loads in dark preference, the first visible frame is already dark.
- When the writing section loads in light preference, the first visible frame is already light.
- When the visitor changes the theme control, the document attributes, favicon, active control state, and rendered colors stay coherent.
- When a component variant changes, its structure remains recognizable and the visual regression check shows whether the change is intentional.
- When a build exceeds the current performance reference, the cycle records the movement instead of stopping unrelated refactor work by default.

## Constraints and assumptions

- The site remains an Astro static site using Tailwind CSS.
- The theme boot path may still need an inline script or equivalent pre-paint mechanism; avoiding **Theme flash** is more important than eliminating apparent duplication.
- The current visual and accessibility checks cover `/` and `/writing` across supported theme preferences.
- Browser first-paint behavior must be checked with a real browser path, not only Vitest DOM tests.
- Component variant cleanup should be behavior-preserving and should not introduce a new styling framework.
- **Performance budget** changes are observed and documented, but they are not cycle-stopping by themselves.

## Success metrics

- No visible **Theme flash** is observed on `/` and `/writing` for light, dark, and system preferences during real-browser verification.
- `pnpm test:unit` passes for the deepened theme contract and runtime adapter behavior.
- `pnpm test:a11y` reports zero axe-core violations.
- `pnpm test:visual` either passes unchanged or produces only intentional snapshot diffs reviewed as component cleanup.
- Theme runtime exports are reduced to the contract needed by production code and tests.
- Each refactored component has one primary render path unless a branch has a distinct semantic responsibility.
- Any performance-budget movement is documented as a descriptive signal.

## Success signals

- Future theme changes can be reviewed by reading a small contract plus boot/interaction adapters.
- Maintainers can explain which code exists specifically to prevent **Theme flash**.
- Deleted theme code has an explicit deletion-test note showing why it was safe to remove.
- Component variants are named and localized, making visual changes easier to review.
- Product context no longer implies that the performance budget blocks all refactor progress.

## Open questions

- RESOLVE THROUGH IMPLEMENTATION: What is the smallest inline or pre-paint theme boot code that preserves no-**Theme flash** behavior?
- RESOLVE THROUGH IMPLEMENTATION: Which currently duplicated component branches are truly behavior-preserving and safe to collapse?
- RESOLVE THROUGH IMPLEMENTATION: Should active theme control state be represented by `aria-pressed`, `data-state`, a class, or a combination that best preserves accessibility and styling clarity?
- RESOLVE THROUGH IMPLEMENTATION: What verification method should be used to make first-paint theme stability visible enough to trust during this cycle?
