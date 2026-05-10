1. Did it go as planned? [Yes / No] -- Yes; `Cartouche` now renders through one shared scaffold with focused variant decisions, and regression checks stayed green.
2. What changed from the sub-issue plan:
   - Added one route-surface contract test in `tests/cartouche.spec.ts` as tracer-bullet first contact, using stable `data-cartouche` markers.
   - Refactored `src/components/cartouche.astro` from duplicated branch markup to one primary render path with computed `containerClass`, `subtitleClass`, and variant-gated monogram fill pass-through.
   - Introduced `data-cartouche="true"` and `data-cartouche-variant` markers to keep behavior verification on the public surface without asserting internal template structure.
   - Verified closure checks with `pnpm test:unit`, `pnpm test:a11y`, and `pnpm test:visual` all passing.
3. Carry-forward -- flags to write in the parent, divergence to note for future siblings, notes for the parent issue's AAR:
   - Divergence noted from closed sibling AAR guidance (`27`, `28`): this slice intentionally did not extract a new utility helper because leverage was low under the stated rubric (leverage/locality/testability).
   - Parent flag added for the future `CTA` sibling to apply the same rubric explicitly instead of assuming extraction-by-default.
   - No ADR required; no hard-to-reverse architectural decision was introduced in this slice.
