# Issue #29: Cartouche Primary Render Path

## Description

Refactor `Cartouche` to one primary render path while preserving the distinct
semantic responsibilities of `hero` and `section` variants. Keep existing
call sites, visual language, and monogram behavior intact while reducing
duplicated structure and class branching.

## Dependency Classification

| Dependency                                                              | Category            | Testing strategy                                                                                     |
| ----------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------- |
| `Cartouche` public props (`subtitle`, `variant`, `monogramFill`)       | In-process          | Verify rendered output through component contract and existing callers, not internal helper order. |
| Route usage in `src/pages/index.astro` and `src/pages/writing/index.astro` | Local-substitutable | Validate behavior through local route rendering and existing browser route checks.                  |
| `MonogramDisplay` integration (`inline`, `forceDark`, optional `fill`) | In-process          | Assert prop mapping and rendering behavior through component-level and route-level checks.          |
| Tailwind utility class behavior for hero/section styling               | Irreplaceable       | Confirm no unintended visual drift with real-browser visual snapshots.                              |
| Accessibility and heading/text structure                               | Irreplaceable       | Re-run route-level axe checks and verify zero violations.                                           |

## Interface Design

Entry points:

- `src/components/cartouche.astro` as the only public component surface.
- Existing call sites in `src/pages/index.astro` and
  `src/pages/writing/index.astro`.

Inputs:

- `subtitle`, `variant` (`"hero" | "section"`), and optional `monogramFill`.

Outputs:

- A shared rendered Cartouche scaffold with variant-specific style decisions.
- Correct `MonogramDisplay` usage for both variants.

Invariants:

- One shared structural scaffold renders for both variants.
- Hero variant preserves accent-as-surface background and foreground pairing.
- Section variant preserves accent-forward text treatment and optional monogram
  fill override.
- Title and subtitle hierarchy remains unchanged.
- `MonogramDisplay` remains `inline` and `forceDark` in both variants.

Error modes:

- Missing `subtitle` can degrade content clarity.
- Unexpected `monogramFill` values can reduce visual contrast.
- Caller-provided surrounding layout classes may alter spacing expectations.

Design-it-twice:

- Alternative A (minimal surface): keep decisions inside `cartouche.astro` and
  centralize only shared classes and child structure.
- Alternative B (common-caller optimized): extract variant class/prop decision
  helper to `src/utils`, then keep `cartouche.astro` as one template scaffold.
- Decision rubric used (same rubric as sibling component sub-issues):
  leverage (reusability across callers/components), locality (keep behavior near
  markup when cognitive load is low), and testability (can key behavior be
  asserted without introducing a new seam).
- Chosen design: Alternative A. For `Cartouche`, variant behavior is primarily
  presentational (class selection + monogram fill pass-through) with a single
  component seam and two stable callers. Under the rubric, extraction scores low
  on leverage, neutral-to-negative on locality, and only modestly positive on
  testability, so the helper boundary is not justified at this stage.
- Rejected design: Alternative B. It would align mechanically with extracted
  helper patterns in `IconButton`/`NavTile`, but those components carry higher
  interaction-state complexity. Applying extraction here only for stylistic
  consistency risks indirection without enough behavioral payoff.
- Revisit trigger: if `Cartouche` gains additional stateful variants, shared
  cross-component style policies, or repeated decision logic in new callers,
  re-open Alternative B and extract with focused unit tests.

## Acceptance Criteria

- `Cartouche` renders through one primary component path.
- Variant differences are represented as focused, explicit style/prop decisions
  instead of duplicated full markup branches.
- Existing call sites render without API changes.
- Hero and section visual intent remains intact.
- `pnpm test:unit` passes (including any component-level updates required by the
  refactor).
- `pnpm test:a11y` remains green for covered routes.
- `pnpm test:visual` remains green or records only intentional diffs.

## Proposed Tests

- Add or adjust tests to verify variant-specific class/prop decisions while
  asserting one shared structural scaffold.
- Verify `MonogramDisplay` prop coherence for hero vs section variants,
  including optional `monogramFill` behavior.
- Run `pnpm test:unit`.
- Run `pnpm test:a11y`.
- Run `pnpm test:visual` and review any intentional snapshot updates.

## Affected Artifacts

- `src/components/cartouche.astro`
- `src/components/monogram-display.astro`, only if contract adjustments are
  necessary to preserve behavior.
- Optional helper/tests under `src/utils/*` only if implementation chooses
  extraction despite the default design.
- `tests/visual.spec.ts` and/or snapshots only if intentional rendering changes
  occur.

## Dependencies

- Parent issue:
  `context/cycles/01-theme-runtime-and-component-variants/issues/15-theme-runtime-and-component-variants/issue.md`.
- Previous sub-issue:
  `context/cycles/01-theme-runtime-and-component-variants/issues/15-theme-runtime-and-component-variants/28-nav-tile-primary-render-path/sub-issue.md`.
- Current component surface: `src/components/cartouche.astro`.
- Monogram dependency: `src/components/monogram-display.astro`.
- Current route-level regression suite: `tests/visual.spec.ts` and
  `tests/a11y.spec.ts`.
