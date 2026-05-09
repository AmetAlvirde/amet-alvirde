# Theme Runtime And Component Variants Sub-PRD

> Translated to `issue.md`. This sub-PRD records the product-level intent --
> user stories and dependencies. Update `issue.md` for ongoing technical work.
> Update this file only if the underlying user stories themselves change.

## User Stories Owned

- As a returning visitor, I want my saved **Theme preference** applied before the page visibly renders so that I do not see the wrong theme flash on load.
- As a visitor using system theme, I want the page to match my system setting on first paint and after system changes so that the site feels visually stable.
- As a maintainer, I want one theme runtime contract so that changing theme behavior does not require auditing inline scripts, utility exports, CSS selectors, and tests separately.
- As a maintainer, I want component variants expressed in one render path where practical so that I can adjust button, tile, CTA, and cartouche behavior without mentally diffing duplicated JSX.
- As a maintainer, I want performance budgets documented as reference signals so that I can record trade-offs without treating every size movement as a blocker.

## Encounter Statements

- When the home surface loads in dark preference, the first visible frame is already dark.
- When the writing section loads in light preference, the first visible frame is already light.
- When the visitor changes the theme control, the document attributes, favicon, active control state, and rendered colors stay coherent.
- When a component variant changes, its structure remains recognizable and the visual regression check shows whether the change is intentional.
- When a build exceeds the current performance reference, the cycle records the movement instead of stopping unrelated refactor work by default.

## Directional Dependencies

- Theme runtime contract work must precede theme boot and interaction cleanup so those adapters can depend on one small canonical surface.
- Theme boot verification must precede deletion of apparently duplicated theme code because no-**Theme flash** behavior is the primary quality bar.
- Theme interaction alignment depends on the runtime contract and must preserve coherent document attributes, favicon target selection, and active control state.
- Component variant cleanup can proceed after baseline theme behavior is protected because visual snapshots may otherwise conflate theme and markup changes.
- Performance budget documentation can proceed independently, but final cycle closure depends on recording any observed movement as a descriptive signal.
