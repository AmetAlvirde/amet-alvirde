# Issue #28: NavTile Primary Render Path

## Description

Refactor `NavTile` so it has one primary render path that preserves current
enabled and disabled behavior without duplicating markup. Keep existing call
sites and visual tone intact while centralizing class and state decisions.

## Dependency Classification

| Dependency                                                     | Category            | Testing strategy                                                                                  |
| -------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------- |
| `NavTile` public props surface (`href`, `title`, `disabled`)  | In-process          | Verify behavior through rendered output and caller-facing props, not internal helper sequencing. |
| Home surface nav usage in `src/pages/index.astro`             | Local-substitutable | Validate through route rendering and existing Playwright route coverage for `/`.                 |
| Tailwind utility class behavior for tile states               | Irreplaceable       | Confirm no unintended visual drift via real-browser visual snapshots.                            |
| Accessibility semantics for disabled and enabled interactions  | Irreplaceable       | Re-run route-level axe checks and verify zero violations.                                        |

## Interface Design

Entry points:

- `src/components/nav-tile.astro` as the only public component surface.
- Existing call sites in `src/pages/index.astro`.

Inputs:

- `href`, `title`, `description`, `disabled`, and `disabledLabel`.

Outputs:

- A rendered anchor tile with consistent shared structure.
- State-specific styling and affordances for enabled versus disabled behavior.

Invariants:

- `NavTile` keeps one shared structural scaffold for both states.
- Enabled tiles preserve hover/focus/active affordances and arrow icon.
- Disabled tiles preserve `aria-disabled="true"`, non-interactive behavior, and
  `disabledLabel` rendering.
- Existing visual hierarchy for `title` and `description` remains intact.

Error modes:

- Missing or invalid `href` can produce non-functional navigation.
- Caller-provided `disabledLabel` may overflow or create layout pressure.

Design-it-twice:

- Alternative A (minimal surface): keep all decisions inside
  `nav-tile.astro` and only centralize shared class fragments/constants.
- Alternative B (common-caller optimized): extract a small contract helper in
  `src/utils` that returns state-specific class and attribute decisions, then
  keep Astro template focused on one markup path.
- Chosen design: Alternative B for higher testability and cleaner separation of
  state decision logic from template structure.
- Rejected design: Alternative A is lower churn but keeps behavior decisions
  tightly coupled to template branching and harder to verify in isolation.

## Acceptance Criteria

- `NavTile` renders through one primary component path with shared structure.
- Enabled and disabled state decisions are centralized instead of duplicated
  across two full markup branches.
- Existing call sites render without API changes.
- Disabled affordance (`aria-disabled`, non-interactive behavior, label) remains
  intact.
- `pnpm test:unit` passes with any added helper tests.
- `pnpm test:a11y` remains green for covered routes.
- `pnpm test:visual` remains green or records only intentional diffs.

## Proposed Tests

- Add unit tests for extracted NavTile state/class decision helper (if
  introduced).
- Confirm home route NavTile variants still render as intended via route-level
  checks.
- Run `pnpm test:unit`.
- Run `pnpm test:a11y`.
- Run `pnpm test:visual` and review any intentional snapshot updates.

## Affected Artifacts

- `src/components/nav-tile.astro`
- `src/utils/*` helper module for NavTile state/class decisions, only if
  introduced.
- Unit tests for helper logic under `src/utils/*.test.ts`, only if introduced.
- `tests/visual.spec.ts` and/or snapshots only if intentional rendering changes
  occur.

## Dependencies

- Parent issue:
  `context/cycles/01-theme-runtime-and-component-variants/issues/15-theme-runtime-and-component-variants/issue.md`.
- Previous sub-issue:
  `context/cycles/01-theme-runtime-and-component-variants/issues/15-theme-runtime-and-component-variants/27-icon-button-primary-render-path/sub-issue.md`.
- Current component surface: `src/components/nav-tile.astro`.
- Current route-level regression suite: `tests/visual.spec.ts` and
  `tests/a11y.spec.ts`.
