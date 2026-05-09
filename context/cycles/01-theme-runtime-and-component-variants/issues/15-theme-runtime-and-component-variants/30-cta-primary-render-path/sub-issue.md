# Issue #30: CTA Primary Render Path

## Description

Refactor `CTA` to one primary render path while preserving the distinct semantic
responsibilities of `<a>` and `<button>`. Keep current writing-page call sites,
visual tone, and external-link affordance intact while reducing duplicated
branch markup and keeping class/state decisions explicit.

## Dependency Classification

| Dependency | Category | Testing strategy |
| --- | --- | --- |
| `CTA` public props surface (`as`, `href`, `external`, `label`, `class`) | In-process | Verify rendered output through the component contract and caller-facing behavior, not internal expression ordering. |
| Writing route usage in `src/pages/writing/index.astro` | Local-substitutable | Validate behavior through local route rendering and existing route/browser checks for `/writing`. |
| Tailwind utility class behavior for CTA states | Irreplaceable | Confirm no unintended visual drift via real-browser visual snapshots. |
| Accessibility semantics for link/button usage and focus behavior | Irreplaceable | Re-run route-level axe checks and verify zero violations. |

## Interface Design

Entry points:

- `src/components/cta.astro` as the only public component surface.
- Existing call sites in `src/pages/writing/index.astro`.

Inputs:

- `as` (`"a" | "button"`), optional `href`, `external`, `label`, `class`, and
  pass-through attributes.

Outputs:

- A shared CTA scaffold with consistent class composition and text treatment.
- Semantic element output (`<a>` or `<button>`) with tag-specific attributes.
- External-link indicator glyph when `external` is true for anchors.

Invariants:

- One shared CTA structural scaffold renders for both semantic tags.
- Base CTA class recipe remains unchanged unless intentionally updated.
- `<a>` keeps `href`, optional `target`, and optional `rel` behavior.
- `<button>` keeps explicit `type="button"` unless caller overrides with a
  deliberate attribute.
- External indicator remains present only for external anchors.

Error modes:

- Missing or invalid `href` while `as="a"` can produce non-functional
  navigation.
- Caller-provided classes or spread attrs can override expected styling.
- Misuse of `external` with non-anchor rendering can create confusing intent.

Design-it-twice:

- Alternative A (minimal surface): keep decisions inside `cta.astro` and
  consolidate shared scaffold/class composition, with a small semantic tag
  branch only where responsibilities differ.
- Alternative B (common-caller optimized): extract a helper in `src/utils` for
  tag-specific attribute and external-indicator decisions, then keep Astro
  template as a thin renderer.
- Decision rubric used: leverage (cross-component/caller reuse), locality (keep
  behavior near markup when complexity is low), and testability (ability to
  verify behavior without unnecessary seams).
- Chosen design: Alternative A. For `CTA`, decision complexity is low and mostly
  local to one component and one stable caller. Under the rubric, extraction is
  low leverage, weakly positive at best for testability, and negative for
  locality due to extra indirection.
- Rejected design: Alternative B. It would create a helper seam before there is
  sufficient repeated decision logic or multi-caller pressure to justify it.
- Revisit trigger: if additional CTA variants/callers introduce repeated
  attribute/state policies, revisit helper extraction with focused unit tests.

## Acceptance Criteria

- `CTA` renders through one primary component path with only semantic tag
  branching where HTML responsibility differs.
- Class composition and shared scaffold are centralized instead of duplicated
  across full markup branches.
- Existing call sites render without API changes.
- External-anchor behavior (`target`, `rel`, glyph) remains intact.
- `pnpm test:unit` passes with any required test updates.
- `pnpm test:a11y` remains green for covered routes.
- `pnpm test:visual` remains green or records only intentional diffs.

## Proposed Tests

- Add or adjust tests to verify shared scaffold behavior and tag-specific
  attributes (`<a>` vs `<button>`).
- Verify external-anchor behavior for `target`, `rel`, and external indicator
  rendering.
- Run `pnpm test:unit`.
- Run `pnpm test:a11y`.
- Run `pnpm test:visual` and review any intentional snapshot updates.

## Affected Artifacts

- `src/components/cta.astro`
- `src/pages/writing/index.astro`, only if fixture/call-site adjustments are
  required to preserve behavior.
- Optional helper/tests under `src/utils/*` only if implementation departs from
  the default in-component consolidation design.
- `tests/visual.spec.ts` and/or snapshots only if intentional rendering changes
  occur.

## Dependencies

- Parent issue:
  `context/cycles/01-theme-runtime-and-component-variants/issues/15-theme-runtime-and-component-variants/issue.md`.
- Previous sub-issue:
  `context/cycles/01-theme-runtime-and-component-variants/issues/15-theme-runtime-and-component-variants/29-cartouche-primary-render-path/sub-issue.md`.
- Current component surface: `src/components/cta.astro`.
- Current route-level regression suite: `tests/visual.spec.ts` and
  `tests/a11y.spec.ts`.
