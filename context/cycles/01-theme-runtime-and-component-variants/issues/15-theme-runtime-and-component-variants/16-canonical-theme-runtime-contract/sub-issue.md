# Issue #16: Canonical Theme Runtime Contract

## Description

Define the smallest canonical theme runtime contract for valid preferences,
storage key, actual theme resolution, document attributes, and favicon target
selection. Use this slice to make theme behavior reviewable through one explicit
surface before changing boot or interaction adapters.

## Dependency Classification

| Dependency                                          | Category            | Testing strategy                                                                           |
| --------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------ |
| Theme preference values and storage key             | In-process          | Test directly through the exported contract.                                               |
| Actual theme resolution for light, dark, and system | Local-substitutable | Substitute `matchMedia` behavior in unit tests.                                            |
| Document attribute decisions                        | In-process          | Test generated attribute values without requiring a browser paint.                         |
| Favicon target selection                            | In-process          | Test selected target values through the contract.                                          |
| Browser first-paint behavior                        | Irreplaceable       | Preserve for later narrow real-browser verification before boot deletion or consolidation. |

## Interface Design

Entry points:

- Export one contract module consumed by boot, interaction, and tests.
- Keep valid **Theme preference** values, storage key, actual theme resolution,
  document attribute decisions, and favicon target selection in that contract.

Inputs:

- Stored preference candidate.
- System dark-mode match state.

Outputs:

- Normalized **Theme preference**.
- Actual resolved theme.
- Document attributes to apply.
- Favicon target for the resolved theme.

Invariants:

- Invalid stored values fall back to system preference semantics.
- Light and dark preferences resolve without consulting system state.
- System preference resolves from the current system match state.
- Contract exports remain smaller than the current scattered runtime surface.

Error modes:

- Storage may contain an invalid value.
- System preference may be unavailable in non-browser tests.

Design-it-twice:

- Alternative A: minimal surface with plain functions and constants for
  preferences, storage, resolution, attributes, and favicon selection.
- Alternative B: common-caller object that returns all document and favicon
  decisions in one call for boot and interaction adapters.
- Chosen design: start with Alternative A because the PRD prioritizes a small
  explicit runtime contract and reduced export surface.
- Rejected design: Alternative B may be useful later, but it risks bundling
  unrelated decisions before the actual callers prove they need a combined
  shape.

## Acceptance Criteria

- Valid **Theme preference** values and storage key are defined in one contract
  module.
- Actual theme resolution for light, dark, and system preferences is covered by
  unit tests.
- Document attribute decisions are covered by unit tests.
- Favicon target selection is covered by unit tests.
- Production code and tests consume the contract instead of redefining
  equivalent theme values.
- No boot-code deletion is performed in this slice unless existing tests and
  first-paint checks already prove it is safe.

## Proposed Tests

- Unit test valid preference normalization, including invalid stored values.
- Unit test actual theme resolution for explicit light, explicit dark, system
  light, and system dark.
- Unit test document attribute decisions for each resolved theme.
- Unit test favicon target selection for each resolved theme.
- Existing `pnpm test:unit` passes.

## Affected Artifacts

- Theme runtime contract module.
- Theme boot adapter imports, only where needed to consume the contract without
  changing first-paint behavior.
- Theme interaction adapter imports, only where needed to consume the contract.
- Theme unit tests.

## Dependencies

- Parent issue:
  `context/cycles/01-theme-runtime-and-component-variants/issues/15-theme-runtime-and-component-variants/issue.md`.
- Source PRD: `context/cycles/01-theme-runtime-and-component-variants/prd.md`.
- Existing no-**Theme flash** behavior must remain protected while this contract
  is introduced.
