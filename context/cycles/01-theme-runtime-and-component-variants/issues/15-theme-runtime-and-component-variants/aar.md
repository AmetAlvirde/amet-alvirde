1. Did it go as planned? [Yes / No] -- Yes; all planned sub-issues (`16`, `17`, `18`, `27`, `28`, `29`, `30`) were completed, and final regression/first-paint/performance checks passed.
2. What changed from the parent issue plan:
   - Added dedicated real-browser first-paint coverage (`tests/theme-first-paint.spec.ts`) and fixed boot-time favicon assignment at commit for light/system-light scenarios.
   - Explicitly standardized active theme-control semantics on `aria-pressed` while retaining class hooks for presentation.
   - Component variant cleanup landed with one primary render path per component, but implementation strategy varied by rubric: utility extraction for higher-behavior components (`IconButton`, `NavTile`) and in-component consolidation for lower-complexity components (`Cartouche`, `CTA`).
   - Added route-surface contract tests for presentational slices (`tests/cartouche.spec.ts`, `tests/cta.spec.ts`) to verify behavior via public surfaces instead of internal template assertions.
   - Final closure verification included `pnpm test:unit`, `pnpm test:a11y`, `pnpm test:visual`, `pnpm test --grep @firstpaint`, and `pnpm test:build` (performance budgets within limits).
3. ADRs made during this parent issue (reference INDEX.md rows):
   - None. No qualifying hard-to-reverse architectural decision required an ADR in this parent issue.
4. New considerations or constraints surfaced:
   - Keep Playwright suites sequential when they depend on the same managed web server to avoid transient startup conflicts.
   - Preserve first-paint verification as a hard closure check before any future boot-path consolidation.
   - For component consolidation work, apply one explicit leverage/locality/testability rubric per slice and document the reasoned choice to avoid implied extraction-by-default drift.
5. Patterns across sub-issue AARs:
   - Theme runtime work improved coherence by centralizing contract constants and reusing them across boot, interaction adapter, and tests.
   - Interaction correctness depends on semantic state (`aria-pressed`) plus compatibility guards (`matchMedia` legacy listeners) rather than style hooks alone.
   - Variant-path refactors are most stable when behavior is verified through caller-facing route surfaces and not through template internals.
   - Extraction is valuable when behavioral state space is broader (`IconButton`, `NavTile`), while in-component consolidation preserves locality when decision complexity is low (`Cartouche`, `CTA`).
6. Carry-forward -- flags to write in the cycle, notes for the PRD AAR:
   - No new cycle-level blocking flags from this parent issue.
   - PRD AAR should record that cycle acceptance checks passed with no visible **Theme flash** on covered routes and all automated regression suites green.
   - PRD AAR should record performance budget status as a descriptive signal: HTML 33.96 KB / 80 KB, CSS 81.19 KB / 300 KB, JS 0.00 KB / 700 KB.
