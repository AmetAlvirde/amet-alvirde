Testing Overview
================

This document describes the automated checks we run against this site and the current baseline as of **2026‑03‑06**.  
Use it as a guide during refactors: if a test starts failing, this explains what changed and why it matters.

We group tests into:

- Visual regression tests (Playwright)
- Accessibility tests (Playwright + axe-core)
- Lighthouse audits (performance, a11y, best practices, SEO)
- Performance budget checks (build size)
- Static analysis (formatting + linting)

Each section below explains:

- **What we test**
- **How we run it**
- **What “pass” means today**
- **Why we keep this test**

---

Visual Regression Tests
-----------------------

- **What we test**
  - File: `tests/visual.spec.ts`
  - Pages covered: `/` (home) and `/writing`
  - Viewports:
    - `xs` \(320×800\)
    - `iPhone14ProMax` \(430×932\)
    - `sm` \(640×800\)
    - `md` \(768×1024\)
    - `lg` \(1280×800\)
  - Themes:
    - `light`
    - `dark`
    - `system`
  - For every combination of page × theme × viewport, Playwright:
    - Sets the viewport.
    - Preloads `window.localStorage.theme` so the app boots in the correct theme.
    - Navigates to the page and waits for `networkidle`.
    - Asserts that the full-page screenshot matches the existing baseline snapshot.

- **How we run it**
  - All visual tests:
    - `pnpm test:visual`
  - Update the approved snapshots when an intentional visual change is made:
    - `pnpm test:update-snapshots`

- **Current result (baseline)**
  - At the time of writing, the visual suite passes after `pnpm test:visual`, meaning:
    - All current layouts and theming are consistent with the checked-in snapshots for `/` and `/writing` across all listed viewports and themes.

- **Why this test exists**
  - Guards against unintended visual regressions when we:
    - Adjust typography, spacing, or layouts.
    - Tweak theme handling or color tokens.
    - Change content that could affect wrapping or line breaks.
  - Provides a fast signal if:
    - A component breaks at a specific breakpoint.
    - A theme has missing or incorrect styles.
  - When this test fails during a refactor:
    - Compare new vs. old screenshots to decide whether to:
      - Fix an accidental regression, or
      - Intentionally accept the change and update snapshots.

---

Accessibility Tests
-------------------

- **What we test**
  - File: `tests/a11y.spec.ts`
  - Pages covered: `/` and `/writing`
  - Themes:
    - `light`
    - `dark`
    - `system`
  - For every page × theme combination, Playwright:
    - Preloads `window.localStorage.theme`.
    - Navigates to the page and waits for `networkidle`.
    - Runs `@axe-core/playwright` and collects `results.violations`.
    - Logs any violations with:
      - Rule id
      - Impact
      - Description
      - Number of affected nodes
    - Asserts that `results.violations` is an empty array.

- **How we run it**
  - `pnpm test:a11y`

- **Current result (baseline)**
  - At the time of writing, `pnpm test:a11y` passes, which means:
    - Axe-core reports **no automatic accessibility violations** for `/` and `/writing` in any of the three themes.
  - Note: this is still an automated baseline; some accessibility issues require manual review and are not covered by axe.

- **Why this test exists**
  - Enforces a **zero‑known‑violations** policy for automated a11y checks.
  - Helps catch regressions like:
    - Missing or incorrect ARIA attributes.
    - Insufficient color contrast (where axe can detect it).
    - Incorrect heading or landmark usage.
    - Non‑descriptive link or button text.
  - During refactors:
    - A new failure pinpoints a specific rule and number of affected nodes.
    - Use the printed violations as a to‑do list to restore passing status.

---

Lighthouse Audits (Performance, A11y, Best Practices, SEO)
----------------------------------------------------------

- **What we test**
  - Script: `pnpm test:lighthouse`
  - Uses `@lhci/cli` \(Lighthouse CI\) to run Lighthouse against the built site.
  - Stores reports under `.lighthouseci/`, including:
    - `.lighthouseci/lhr-*.json` and `.html` reports.
  - Categories measured:
    - **Performance**
    - **Accessibility**
    - **Best Practices**
    - **SEO**

- **How we run it**
  - `pnpm test:lighthouse`

- **Current result (baseline)**
  - Based on the latest report in `.lighthouseci/lhr-1772750225775.json` \(fetchTime `2026-03-05T22:36:47.342Z`\):
    - **Performance**: score `1.00` \(100/100\)
    - **Accessibility**: score `1.00` \(100/100\)
    - **Best Practices**: score `1.00` \(100/100\)
    - **SEO**: score `1.00` \(100/100\)
  - This reflects the state of the home page at that time; future changes might move these scores up or down.

- **Why this test exists**
  - Provides an end‑to‑end, real‑browser view of:
    - Load and interaction performance.
    - Additional automated accessibility checks.
    - Security and UX best practices.
    - Basic search‑engine friendliness.
  - Acts as a **high‑level regression alarm**:
    - If any category score drops, inspect the corresponding Lighthouse report in `.lighthouseci/` to see:
      - Which audits failed.
      - How they changed relative to this baseline.
  - During refactors:
    - Aim to **keep or improve** each category score.
    - If a score goes down, decide whether it is an acceptable trade‑off or should be fixed.

---

Performance Budget Check (Build Size)
-------------------------------------

- **What we test**
  - Script: `pnpm test:build`
  - This script:
    1. Runs `astro build` to generate static output under `dist/`.
    2. Runs `node scripts/check-perf-budget.mjs` to enforce size budgets.
  - Budgets enforced by `scripts/check-perf-budget.mjs`:
    - **Total HTML size** for `index.html` and `writing/index.html` combined:
      - Limit: **50 KB**
    - **Total CSS size** of all `.css` files in `dist/`:
      - Limit: **20 KB**
    - **Total JS size** of all `.js` files in `dist/`:
      - Limit: **10 KB**
  - The script prints a summary and fails the process if any budget is exceeded.

- **How we run it**
  - `pnpm test:build`

- **Current result (baseline)**
  - From the latest run:
    - `HTML total: 33.92 KB (limit 50 KB)`
    - `CSS total:  18.97 KB (limit 20 KB)`
    - `JS total:   0.00 KB (limit 10 KB)`
    - Status: **All performance budgets are within limits.**
  - This is our current performance budget baseline for the built site.

- **Why this test exists**
  - Keeps the site intentionally **small and fast** by:
    - Capping HTML, CSS, and JS growth.
    - Making any significant weight increase visible in CI.
  - During refactors:
    - If this test fails, inspect `dist/` to see which assets grew.
    - Typical follow‑ups:
      - Remove unused CSS or JS.
      - Split or compress assets.
      - Re‑evaluate whether the new weight is justified and, if so, consider adjusting the budget intentionally.

---

Static Analysis: Formatting and Linting
---------------------------------------

- **What we test**
  - **Formatting**:
    - Tool: `@biomejs/biome`
    - Scripts:
      - `pnpm format` – auto‑formats the codebase.
      - `pnpm format:check` – verifies formatting without changing files.
  - **Linting**:
    - Tooling:
      - `eslint`
      - `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser`
    - Scripts:
      - `pnpm lint` – runs ESLint on the project.
      - `pnpm lint:fix` – attempts to auto‑fix lint issues.

- **How we run it**
  - Formatting check only:
    - `pnpm format:check`
  - Linting only:
    - `pnpm lint`
  - Both, plus tests, as a pre‑merge gate:
    - `pnpm test:pre-merge`
      - Runs, in order:
        1. `pnpm format:check`
        2. `pnpm lint`
        3. `pnpm test` \(all Playwright tests\)
        4. `pnpm test:lighthouse`
        5. `pnpm test:build`

- **Current result (baseline)**
  - As of this document, the codebase is expected to:
    - Pass `pnpm format:check` \(formatted according to Biome rules\).
    - Pass `pnpm lint` \(no outstanding ESLint errors\).
  - If this changes, `pnpm test:pre-merge` will fail and highlight the offending files.

- **Why this test exists**
  - Keeps the project:
    - Consistently formatted \(easier to review changes\).
    - Free of common bugs and code smells flagged by ESLint.
  - During refactors:
    - Fix formatting and lint errors first; this:
      - Simplifies diffs.
      - Reduces noise when debugging failing Playwright or Lighthouse tests.

---

How to Use This Baseline During Refactors
-----------------------------------------

- **Before large changes**
  - Run `pnpm test:pre-merge` to ensure you start from a clean, fully‑passing state.

- **After refactors**
  - Re‑run:
    - `pnpm test:visual` to confirm no unwanted visual regressions.
    - `pnpm test:a11y` to keep axe‑based accessibility clean.
    - `pnpm test:lighthouse` to compare category scores against the 100/100 baseline.
    - `pnpm test:build` to ensure bundle sizes stay within the budgets noted above.

- **When tests fail**
  - Use the explanations in this document to:
    - Understand what changed.
    - Decide whether to:
      - Fix a regression to restore the current baseline, or
      - Intentionally accept a new behavior and update snapshots/budgets/config accordingly.