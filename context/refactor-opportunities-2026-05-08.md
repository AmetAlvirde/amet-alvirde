# Refactor Opportunity Report

Date: 2026-05-08

## SDP State

The repository is a single-context SDP project: `context/product.md` and
`context/ubiquitous-language.md` exist, with no `context/context-map.md`.
There are no active cycle folders and no ADR index. Per `sdp-orchestrator`, the
next move is Flow B refactor exploration, not immediate cycle scaffolding.

Per `sdp-refactor`, this report stops at numbered candidates. After a candidate
is selected, the next step is to write a refactor-cycle pitch/PRD for that one
candidate under `context/cycles/`.

## Product Pressure

The product frame says the generative core is "a personal navigation surface"
that can add public facets while keeping identity, accessibility, theme
behavior, and performance coherent. The current codebase already protects those
qualities with visual, accessibility, Lighthouse, performance-budget, unit,
format, and lint checks. The refactor opportunities below focus on making those
qualities easier to preserve as new sections are added.

No ADR conflicts were found.

## Candidate 1: Deepen Theme Preference Into A Single Runtime Contract

Affected artifacts:

- `src/layouts/base-layout.astro`
- `src/utils/theme-manager.ts`
- `src/utils/theme-manager.test.ts`
- `src/components/theme-controls.astro`
- `src/components/monogram-display.astro`
- `src/styles/global.css`
- `tests/visual.spec.ts`
- `tests/a11y.spec.ts`

Concrete friction:

- Theme boot behavior is split across inline HTML (`base-layout.astro` lines
  26-57), the client manager (`theme-manager.ts` lines 1-297), CSS selectors
  (`global.css` lines 223-235), monogram display rules, and test init scripts.
- The same concepts recur in several places: valid preferences, the `theme`
  localStorage key, favicon switching, `matchMedia`, `data-theme`, and
  `data-theme-preference`.
- The interface around theme controls is nearly as large as the implementation:
  the manager exports several internals so tests can reach behavior that is not
  otherwise represented as a small domain contract.
- The inline script and the hydrated manager both register system-theme change
  listeners. They are currently compatible, but future changes need cross-file
  reasoning.

Deletion test:

- Delete only the inline script: boot-time theme stability is at risk.
- Delete only the hydrated manager: the initial theme can still apply, but the
  visitor cannot change theme.
- Delete only the CSS active selector block: button state still changes in JS,
  but visual state depends on the class/CSS interaction.
- Result: theme behavior cannot be deleted or reasoned about at one deepened
  interface. It requires bouncing through layout, utility code, CSS, component
  IDs, and tests.

Proposed change:

- Introduce a small theme contract module that owns constants, preference
  validation, actual-theme resolution, document attribute application, and
  favicon target selection.
- Keep the inline boot script minimal and explicitly generated from or mirrored
  against that contract, with a test that catches drift.
- Turn the client manager into an adapter for DOM controls and system-change
  events rather than the primary owner of theme semantics.
- Prefer explicit `aria-pressed`/`data-state` button state over global ID-based
  CSS overrides where practical.

Expected gain in locality and leverage:

- Theme changes become local to one contract plus thin adapters.
- Visual boot stability remains protected without duplicating the whole logic
  engine in the layout.
- Future theme or asset changes have a smaller blast radius.

Test improvement at the deepened interface:

- Fast unit tests for the pure preference/state contract.
- DOM unit tests only for the adapter behavior.
- One Playwright interaction test for the real controls across light, dark, and
  system, instead of relying only on screenshot/a11y setup.

## Candidate 2: Extract A Section Registry For The Personal Navigation Surface

Affected artifacts:

- `src/pages/index.astro`
- `src/pages/writing/index.astro`
- `src/components/nav-tile.astro`
- `src/components/cta.astro`
- `tests/visual.spec.ts`
- `tests/a11y.spec.ts`
- `lighthouserc.cjs`
- `scripts/check-perf-budget.mjs`
- `context/product.md`
- `context/ubiquitous-language.md`

Concrete friction:

- Domain concepts such as Section, Writing section, Planned section, and
  External surface exist in context, but the executable source does not have a
  section model.
- The home surface hardcodes section tiles directly in
  `src/pages/index.astro` lines 18-46.
- The writing page hardcodes section content and the external consciousness
  surface directly in `src/pages/writing/index.astro` lines 21-52.
- Regression checks repeat route knowledge in visual tests, accessibility
  tests, Lighthouse config, and the performance budget script.

Deletion test:

- Delete a planned tile from the home page: no central model records whether
  that public facet is intentionally planned or removed.
- Delete `/writing` from the Playwright page arrays: Lighthouse and performance
  checks still know about it separately.
- Delete the Obsidian URL from the writing page: no domain object records the
  external surface relationship.
- Result: the generative core is present in the product language but shallow in
  code.

Proposed change:

- Add a typed section registry that represents section slug, label, description,
  status (`available` or `planned`), route, external surfaces, and regression
  coverage metadata.
- Render the home tiles from that registry.
- Let tests consume a shared route matrix derived from the registry, while
  keeping test-specific viewport/theme configuration in test code.
- Keep page content close to the page for now unless the writing section needs
  multiple entries.

Expected gain in locality and leverage:

- Adding a public facet becomes one coherent change instead of page, tests,
  Lighthouse, and budget updates in separate places.
- The code gains an executable representation of the domain language already in
  `context/ubiquitous-language.md`.
- Planned sections stay intentional without creating empty routes.

Test improvement at the deepened interface:

- Unit test the registry invariants: each available section has a route, each
  planned section has no navigable route, and each covered route appears in the
  app-level check matrix.
- Existing visual and a11y tests remain the acceptance surface for rendered
  behavior.

## Candidate 3: Consolidate Component Surface Styling Into Explicit Variants

Affected artifacts:

- `src/components/icon-button.astro`
- `src/components/nav-tile.astro`
- `src/components/cta.astro`
- `src/components/cartouche.astro`
- `src/components/Navigation.astro`
- `src/components/Footer.astro`
- `src/styles/global.css`

Concrete friction:

- Several components carry long Tailwind class strings with repeated structure:
  border, background, transition, hover, focus, spacing, uppercase, and tracking
  patterns.
- `IconButton` has variant strings that duplicate most of their class content
  (`icon-button.astro` lines 27-34).
- `NavTile` branches disabled and enabled markup, duplicating layout structure
  while changing behavior and trailing affordance (`nav-tile.astro` lines
  19-54).
- `Cartouche` branches hero and section markup, duplicating identity lockup
  structure (`cartouche.astro` lines 14-38).
- `global.css` says site-specific styles live in `site.css`, but there is no
  `site.css`; site-specific component state currently lives in global selectors
  with `!important` (`global.css` lines 223-235).

Deletion test:

- Delete a single utility class from one component: the same visual rule may
  still exist elsewhere, but no component variant contract tells whether the
  difference is intentional.
- Delete the global active button override: active-state rendering changes even
  though component code still adds `icon-button--active`.
- Delete one branch of `NavTile` or `Cartouche`: the other branch is not a
  reusable primitive; behavior and visual surface are coupled.
- Result: the component system is visually coherent but shallow. The styling
  interface is encoded as repeated strings instead of named variants.

Proposed change:

- Introduce explicit component variants using `class:list`, small helper maps,
  or `@layer components` classes for stable primitives such as interactive
  surface, icon button, nav tile, identity lockup, and CTA.
- Replace ID-based active styling with component-owned state attributes.
- Keep Tailwind as the styling engine; the refactor is about local interfaces,
  not a styling framework change.

Expected gain in locality and leverage:

- Visual language changes become edits to variants rather than hunts through
  long class strings.
- New sections can reuse the same small component vocabulary without copying
  markup.
- The visual baseline remains useful because screenshots catch intentional
  variant changes instead of incidental class-string drift.

Test improvement at the deepened interface:

- Add a small rendered fixture or page-level coverage for component states:
  enabled/disabled nav tile, active/inactive icon button, hero/section
  cartouche.
- Keep full-page snapshots as the regression baseline.

## Candidate 4: Make Regression Coverage And Budgets A First-Class Check Matrix

Affected artifacts:

- `tests/visual.spec.ts`
- `tests/a11y.spec.ts`
- `lighthouserc.cjs`
- `scripts/check-perf-budget.mjs`
- `tests/README.md`
- `package.json`

Concrete friction:

- Covered pages are repeated in `tests/visual.spec.ts`, `tests/a11y.spec.ts`,
  `lighthouserc.cjs`, and `scripts/check-perf-budget.mjs`.
- `scripts/check-perf-budget.mjs` hardcodes only `index.html` and
  `writing/index.html` for HTML weight, so future available sections can be
  missed unless the script is manually updated.
- `tests/README.md` documents 50 KB HTML, 20 KB CSS, and 10 KB JS budgets, but
  `scripts/check-perf-budget.mjs` enforces 80 KB HTML, 300 KB CSS, and 700 KB
  JS. The documented baseline and executable check have drifted.
- `package.json` masks Lighthouse command failure with `|| true`, which makes
  the check less authoritative than the documented regression gate.

Deletion test:

- Delete `/writing` from one test file: other check surfaces still include it,
  so coverage intent is fragmented.
- Delete a route from the performance script: the build still passes while the
  route may no longer be budgeted.
- Delete the README budget values: executable checks still run, but maintainers
  lose the stated baseline.
- Result: regression coverage is broad, but the coverage model is not deep.

Proposed change:

- Create a shared check matrix for public routes and supported theme
  preferences.
- Update visual and a11y tests to consume that matrix.
- Move performance budgets into a small config object consumed by
  `scripts/check-perf-budget.mjs` and documented from the same source, or at
  minimum align the README and script.
- Decide whether Lighthouse should fail the pipeline on assertion failures and
  only filter the GitHub-token noise without swallowing the command status.

Expected gain in locality and leverage:

- Adding an available route becomes one update to the check matrix.
- Budget drift becomes visible and intentional.
- The regression surface better matches the product promise: fast, accessible,
  visually stable, and covered across public surfaces.

Test improvement at the deepened interface:

- Unit test the route-to-built-file mapping used by the budget script.
- Keep Playwright and Lighthouse as app-level checks, now driven by shared
  coverage intent.

## Recommendation

If the next cycle should reduce the most immediate implementation risk, choose
Candidate 1. Theme preference is a named product goal, crosses the most runtime
boundaries, and already has enough tests to refactor safely.

If the next cycle should prepare the site for more public facets, choose
Candidate 2. It aligns most directly with the generative core and will make the
next section addition cleaner.

If the next cycle should harden the project gate before more feature work,
choose Candidate 4. It contains a concrete drift between documented and
enforced budgets and improves confidence in every later refactor.

Candidate 3 is useful, but it has the highest chance of creating snapshot churn
without changing product leverage unless paired with a section or theme cycle.

## Candidate Selection Needed

Select one candidate to pursue as the SDP refactor cycle. The next step is to
load `sdp-pitch-prd` and write the cycle pitch/PRD for the chosen candidate.
