# Issue #27: IconButton Primary Render Path

## Description

Refactor `IconButton` so it has one primary render path with explicit semantic
differences only where HTML responsibility differs (`<a>` vs `<button>`). Keep
variant behavior (`default`, `inherit`, `borderless`) and existing call sites
intact while reducing duplicated class and attribute logic.

## Dependency Classification

| Dependency                                              | Category            | Testing strategy                                                                                  |
| ------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------- |
| `IconButton` public props surface (`as`, `variant`, etc.) | In-process          | Verify behavior through rendered output and existing call sites, not internal helper sequencing. |
| Theme controls and social links using `IconButton`      | Local-substitutable | Validate in local page routes and Playwright checks where those surfaces already render.         |
| Tailwind utility class behavior                          | Irreplaceable       | Confirm no unintended visual drift in real-browser visual snapshots.                             |
| Accessibility behavior for focus/label semantics         | Irreplaceable       | Re-run existing route-level axe checks and ensure zero violations.                               |

## Interface Design

Entry points:

- `src/components/icon-button.astro` as the only public component surface.
- Existing call sites in `src/components/theme-controls.astro`,
  `src/components/social-links.astro`, and `src/components/Navigation.astro`.

Inputs:

- `as` (`"button" | "a"`), `href`, `ariaLabel`, `title`, `type`, `variant`,
  and pass-through attributes.

Outputs:

- Rendered interactive element with consistent base classes, variant classes,
  and caller-provided attributes.
- Preserved focus-visible, hover, and active-state styling hooks.

Invariants:

- `aria-label` is always present from `ariaLabel`.
- `title` defaults to `ariaLabel` when not explicitly provided.
- Exactly one variant class recipe is applied per render.
- `<button>` keeps explicit `type`; `<a>` keeps `href` and link-only attrs.

Error modes:

- Invalid or missing `href` while `as="a"` can produce a non-functional link.
- Caller-provided `class` or spread attrs may override expected styling.

Design-it-twice:

- Alternative A: keep inline branching in Astro template but reduce duplication
  by centralizing class map and shared attributes.
- Alternative B: extract a tiny class/attribute decision helper in `src/utils`
  with unit tests, then use one Astro render scaffold with minimal tag branch.
- Chosen design: Alternative B for better testability and clearer contract of
  variant decisions without coupling tests to Astro template internals.
- Rejected design: Alternative A is lower churn, but it keeps behavior decisions
  embedded in template structure and harder to test in isolation.

## Acceptance Criteria

- `IconButton` renders through one primary component path with only semantic
  tag-specific branching (`<a>` vs `<button>`).
- Variant class decisions are centralized and no longer duplicated across
  multiple unrelated conditional blocks.
- Existing call sites render without API changes.
- Theme control active-state class (`icon-button--active`) remains available and
  unaffected.
- `pnpm test:unit` passes with any added helper tests.
- `pnpm test:a11y` remains green for covered routes.
- `pnpm test:visual` remains green or records only intentional diffs.

## Proposed Tests

- Add unit tests for extracted variant/class decision helper (if introduced).
- Confirm `IconButton` still supports `default`, `inherit`, and `borderless`
  variants through route-level rendering.
- Run `pnpm test:unit`.
- Run `pnpm test:a11y`.
- Run `pnpm test:visual` and review any intentional snapshot updates.

## Affected Artifacts

- `src/components/icon-button.astro`
- `src/utils/*` helper module for class/attribute decisions, only if introduced.
- Unit tests for helper logic under `src/utils/*.test.ts`, only if introduced.
- `tests/visual.spec.ts` and/or snapshots only if intentional rendering changes
  occur.

## Dependencies

- Parent issue:
  `context/cycles/01-theme-runtime-and-component-variants/issues/15-theme-runtime-and-component-variants/issue.md`.
- Previous sub-issue:
  `context/cycles/01-theme-runtime-and-component-variants/issues/15-theme-runtime-and-component-variants/18-theme-interaction-state-alignment/sub-issue.md`.
- Current component surface: `src/components/icon-button.astro`.
- Current route-level regression suite: `tests/visual.spec.ts` and
  `tests/a11y.spec.ts`.
