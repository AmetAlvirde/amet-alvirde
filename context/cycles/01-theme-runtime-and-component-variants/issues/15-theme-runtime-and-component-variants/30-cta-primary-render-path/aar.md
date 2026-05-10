1. Did it go as planned? [Yes / No] -- Yes; `CTA` now renders through one shared scaffold with semantic tag-specific behavior preserved, and all required regression checks passed.
2. What changed from the sub-issue plan:
   - Added tracer-bullet first-contact coverage in `tests/cta.spec.ts` through the public `/writing` surface to verify CTA semantic marker and external-link behavior.
   - Refactored `src/components/cta.astro` to one primary render path using a dynamic element and centralized shared class composition.
   - Kept tag-specific responsibilities explicit through `tagSpecificAttrs` (`href`/`target`/`rel` for links, `type="button"` for buttons).
   - Added stable route-surface contract markers (`data-cta`, `data-cta-as`) to verify behavior without coupling tests to template internals.
   - Resolved the parent targeting flag during pre-activation in `issue.md` and documented rubric-driven in-component consolidation.
   - Verified closure checks with `pnpm test:unit`, `pnpm test:a11y`, and `pnpm test:visual` all passing.
3. Carry-forward -- flags to write in the parent, divergence to note for future siblings, notes for the parent issue's AAR:
   - No new future-sibling flags; this was the final planned component-variant slice under parent issue #15.
   - No ADR required; no hard-to-reverse architecture decision was introduced in this slice.
   - Parent issue AAR should record the cross-slice pattern: extraction was used for higher-behavior components (`IconButton`, `NavTile`) while lower-complexity presentational components (`Cartouche`, `CTA`) stayed in-component under the same leverage/locality/testability rubric.
