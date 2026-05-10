1. Did it go as planned? [Yes / No] -- Yes; `IconButton` now renders through one primary path with tag-specific semantics only, and variant class decisions are centralized in a test-covered utility contract.
2. What changed from the sub-issue plan:
   - Introduced `src/utils/icon-button-contract.ts` to own variant class selection and class composition, then updated `src/components/icon-button.astro` to consume that contract.
   - Reduced duplicate attribute wiring by creating shared accessibility/styling attributes once, while preserving `<a>` `href` and `<button>` `type` semantics.
   - Kept the existing caller surface intact (`as`, `variant`, `ariaLabel`, `title`, pass-through attrs), including compatibility with theme active-state class usage.
3. Carry-forward -- flags to write in the parent, divergence to note for future siblings, notes for the parent issue's AAR:
   - No divergence requiring parent flags; this slice stayed within the planned boundaries.
   - Carry forward: for upcoming variant-path refactors (`NavTile`, `Cartouche`, `CTA`), prefer utility-level class contracts plus minimal semantic branching in Astro templates.
   - Carry forward: avoid running Playwright suites that rely on the same web server in parallel; run sequentially to prevent transient startup conflicts.
