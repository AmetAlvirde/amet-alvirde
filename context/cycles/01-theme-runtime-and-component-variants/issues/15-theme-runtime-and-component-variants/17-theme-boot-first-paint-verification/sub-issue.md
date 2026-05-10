# Issue #17: Theme Boot First-Paint Verification

## Description

Protect the pre-paint theme boot path with a narrow real-browser verification
slice for `/` and `/writing` before any boot-adjacent deletion or consolidation.
Align the inline boot adapter with the canonical theme runtime contract only
where that preserves first-paint behavior and makes the no-**Theme flash**
evidence reviewable.

## Dependency Classification

| Dependency                                        | Category            | Testing strategy                                                                                                         |
| ------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Canonical theme runtime contract                  | In-process          | Consume existing constants and decisions directly where Astro can safely inject them into the inline boot script.        |
| Browser first paint on `/` and `/writing`         | Irreplaceable       | Use a narrow Playwright/browser check that observes the initial document theme state before normal post-load assertions. |
| `localStorage` theme preference before navigation | Local-substitutable | Seed preference with `page.addInitScript` or equivalent browser setup before the page runs app scripts.                  |
| System color-scheme preference                    | Local-substitutable | Use Playwright color-scheme emulation for dark and light system cases.                                                   |
| Favicon link target after boot                    | In-process          | Assert the active non-media favicon target follows the resolved theme after the boot script runs.                        |
| Inline Astro boot script execution order          | Irreplaceable       | Keep verification in a real Astro-built or served page rather than jsdom-only tests.                                     |

## Interface Design

Entry points:

- Existing inline boot script in `src/layouts/base-layout.astro`.
- Existing canonical contract exports from
  `src/utils/theme-runtime-contract.ts`.
- A narrow first-paint verification path under the Playwright test suite.

Inputs:

- Page path: `/` or `/writing`.
- Stored **Theme preference**: `light`, `dark`, or `system`.
- Emulated system color-scheme for system preference checks.

Outputs:

- Initial `html.dark` class state.
- Initial `data-theme` and `data-theme-preference` attributes.
- Active non-media favicon `href` target.
- A documented verification result showing no visible **Theme flash** for the
  covered paths and preferences.

Invariants:

- The boot script applies `data-theme`, `data-theme-preference`, and `.dark`
  before the first visible frame.
- Invalid or missing stored preferences retain system preference semantics.
- Favicon target selection remains consistent with the resolved actual theme.
- No boot code is deleted or consolidated in this slice unless the same
  first-paint verification proves behavior is unchanged.

Error modes:

- Browser storage access may throw or be unavailable.
- `matchMedia` may be unavailable only outside the real-browser verification
  path.
- Inline script token injection can regress if contract values are not injected
  as serializable Astro variables.
- A verification that waits for network idle or DOMContentLoaded may miss a
  first-paint regression.

Design-it-twice:

- Alternative A: add a dedicated Playwright first-paint spec that seeds storage
  and color-scheme before navigation, then checks the earliest observable theme
  state and favicon target without changing the runtime surface.
- Alternative B: extract the inline boot logic into a generated shared helper so
  unit tests and boot code execute the same source.
- Chosen design: Alternative A because the primary risk is real-browser paint
  ordering, and the current contract already gives the boot script the small
  values it needs.
- Rejected design: Alternative B increases bundling and script-order risk before
  deletion/consolidation has evidence to justify the extra seam.

## Acceptance Criteria

- Real-browser verification covers `/` and `/writing` for explicit light,
  explicit dark, system-light, and system-dark first-paint cases.
- Verification checks the initial `data-theme`, `data-theme-preference`, and
  `.dark` class state before relying on client-side theme manager hydration.
- Verification checks the active non-media favicon target follows the resolved
  actual theme.
- The inline boot path consumes the canonical contract values that are safe to
  inject without changing first-paint behavior.
- No visible **Theme flash** is observed during the verification run.
- No boot-code deletion or consolidation is included unless deletion-test
  evidence is recorded in this sub-issue.
- `pnpm test:unit` and the first-paint browser verification pass.

## Proposed Tests

- Add or update a Playwright spec that seeds `localStorage` before page scripts
  run and visits `/` and `/writing` for `light`, `dark`, and `system`.
- For system preference, run separate browser contexts or test cases with light
  and dark color-scheme emulation.
- Assert `document.documentElement` theme attributes and `.dark` class as early
  as the verification method allows.
- Assert `link[rel="icon"]:not([media])` resolves to the expected favicon target
  for the actual theme.
- Run `pnpm test:unit`.
- Run the targeted first-paint browser verification command, or document why the
  existing `pnpm test:visual` command is the executed real-browser path.

## Affected Artifacts

- `src/layouts/base-layout.astro`
- `src/utils/theme-runtime-contract.ts`, only if an already-planned boot-safe
  export is missing.
- Playwright theme first-paint verification under `tests/`.
- Existing visual or accessibility tests only if they need shared setup cleanup
  after the first-paint path is introduced.

## Dependencies

- Parent issue:
  `context/cycles/01-theme-runtime-and-component-variants/issues/15-theme-runtime-and-component-variants/issue.md`.
- Previous sub-issue:
  `context/cycles/01-theme-runtime-and-component-variants/issues/15-theme-runtime-and-component-variants/16-canonical-theme-runtime-contract/sub-issue.md`.
- Source PRD: `context/cycles/01-theme-runtime-and-component-variants/prd.md`.
- Current boot script in `src/layouts/base-layout.astro`.
- Current contract in `src/utils/theme-runtime-contract.ts`.
- Current Playwright configuration and `/`, `/writing` route coverage.

## Closure

Status: Closed

Acceptance criteria check:

- [x] Real-browser verification covers `/` and `/writing` for explicit light,
  explicit dark, system-light, and system-dark first-paint cases in
  `tests/theme-first-paint.spec.ts`.
- [x] Verification checks initial `data-theme`, `data-theme-preference`, and
  `.dark` class state before hydration.
- [x] Verification checks active non-media favicon target with
  `FAVICON_SELECTOR` and `FAVICON_TARGETS`.
- [x] Inline boot path consumes canonical contract values via
  `define:vars` (`THEME_STORAGE_KEY`, `THEME_PREFERENCES`, `FAVICON_SELECTOR`,
  `FAVICON_TARGETS`) in `src/layouts/base-layout.astro`.
- [x] No visible **Theme flash** observed in first-paint verification runs.
- [x] No boot deletion or consolidation is included in this slice.
- [x] `pnpm test:unit` and targeted first-paint browser verification pass.

Verification run:

- [x] `pnpm test --grep @firstpaint` (8 tests passed).
- [x] `pnpm test:unit` (17 tests passed).
