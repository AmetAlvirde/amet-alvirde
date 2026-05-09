# Issue #18: Theme Interaction State Alignment

## Description

Align theme interaction behavior with the canonical runtime contract so control
state, document attributes, and favicon updates remain coherent after user
actions and system theme changes. Resolve the parent flag for active theme
control representation by choosing one explicit accessibility-and-styling shape
and enforcing it through tests.

## Dependency Classification

| Dependency                                                                               | Category            | Testing strategy                                                                                                |
| ---------------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------- |
| Canonical theme runtime contract (`theme-runtime-contract`)                              | In-process          | Consume exported preference/theme/attribute/favicon decisions directly through the interaction adapter surface. |
| Theme interaction adapter (`theme-manager`)                                              | In-process          | Test behavior through exported manager functions and initialization path.                                       |
| Theme controls DOM (`#light-theme-button`, `#system-theme-button`, `#dark-theme-button`) | Local-substitutable | Use jsdom/happy-dom unit tests with real DOM nodes and events.                                                  |
| System color-scheme change events (`matchMedia`)                                         | Local-substitutable | Stub `matchMedia` and change listeners to simulate system dark/light changes.                                   |
| Browser runtime behavior after hydration                                                 | Irreplaceable       | Confirm with existing Playwright route coverage after unit behavior is aligned.                                 |

## Interface Design

Entry points:

- `initializeThemeManager()` for interactive setup.
- `setLightTheme()`, `setDarkTheme()`, and `setSystemTheme()` for explicit
  preference transitions.
- Theme controls rendered by `src/components/theme-controls.astro`.

Inputs:

- User click/keyboard activation on the three theme controls.
- Current stored preference and document attributes.
- System dark-mode change events while preference is `system`.

Outputs:

- Updated `data-theme` and `data-theme-preference` on `<html>`.
- Updated active control representation for exactly one selected preference.
- Updated active favicon target for the resolved actual theme.

Invariants:

- Theme interaction uses contract decisions for resolved actual theme and
  document attributes.
- Exactly one theme control is represented as active at any time.
- Active control representation remains accessible and styleable.
- Favicon target stays coherent with the resolved actual theme after any
  preference change.

Error modes:

- Missing controls on a page should fail safely without breaking unrelated page
  behavior.
- Storage operations may fail; interaction still updates in-memory DOM state.
- `matchMedia` event APIs may differ across environments and must be guarded in
  tests and runtime.

Design-it-twice:

- Alternative A: keep class-only active state (`icon-button--active`) and add
  test coverage for uniqueness and coherence.
- Alternative B: add semantic state (`aria-pressed` or `data-state`) as the
  canonical active indicator and keep class names as presentational affordance.
- Chosen design: Alternative B for stronger accessibility semantics and clearer
  styling intent while preserving existing class-based visual hooks.
- Rejected design: Alternative A is simpler, but it leaves active-state meaning
  implicit and less explicit for assistive tooling and future maintainers.

## Acceptance Criteria

- Active theme control representation is explicitly defined and implemented in
  the interaction path (`aria-pressed`, `data-state`, class names, or justified
  combination).
- Unit tests verify that exactly one control is active for light, dark, and
  system preferences.
- Unit tests verify document attribute coherence (`data-theme`,
  `data-theme-preference`, and `.dark`) for explicit and system transitions.
- Unit tests verify favicon updates remain coherent with resolved actual theme.
- System theme change handling updates theme only when preference is `system`.
- `pnpm test:unit` passes with the deepened interaction coverage.
- Existing Playwright checks relevant to theme behavior remain green or show
  only intentional updates.

## Proposed Tests

- Extend `src/utils/theme-manager.test.ts` to assert the chosen active control
  representation for each preference transition.
- Add/adjust tests for single-active invariant across all three controls.
- Verify system change event behavior when preference is `system` versus
  explicit `light`/`dark`.
- Verify favicon target and document attributes after interaction updates.
- Run `pnpm test:unit`.
- Run targeted browser checks (`pnpm test --grep @firstpaint` and/or
  `pnpm test:visual`) to ensure no interaction regressions leak into route
  behavior.

## Affected Artifacts

- `src/utils/theme-manager.ts`
- `src/utils/theme-manager.test.ts`
- `src/components/theme-controls.astro`, only if chosen semantics require
  explicit initial attributes.
- `tests/visual.spec.ts` or related browser tests only if expectation updates
  are needed for intentional interaction-state rendering changes.

## Dependencies

- Parent issue:
  `context/cycles/01-theme-runtime-and-component-variants/issues/15-theme-runtime-and-component-variants/issue.md`.
- Previous sub-issue:
  `context/cycles/01-theme-runtime-and-component-variants/issues/15-theme-runtime-and-component-variants/17-theme-boot-first-paint-verification/sub-issue.md`.
- Canonical contract: `src/utils/theme-runtime-contract.ts`.
- Interaction adapter: `src/utils/theme-manager.ts`.
- Theme control surface: `src/components/theme-controls.astro`.
