1. Did it go as planned? [Yes / No] -- Yes; `NavTile` now renders through one shared scaffold, with state-specific behavior centralized in a small utility contract and covered by unit tests.
2. What changed from the sub-issue plan:
   - Introduced `src/utils/nav-tile-contract.ts` to centralize enabled/disabled class and semantic decisions.
   - Updated `src/components/nav-tile.astro` to a single render path with a narrow state branch for trailing content (`disabledLabel` vs arrow icon).
   - Added helper tests in `src/utils/nav-tile-contract.test.ts` for disabled semantics, enabled semantics, and state-specific class switching.
3. Carry-forward -- flags to write in the parent, divergence to note for future siblings, notes for the parent issue's AAR:
   - No sibling-blocking divergence; this slice remains within planned scope and is mergeable.
   - Carry forward: continue the same pattern for upcoming component slices (`Cartouche`, `CTA`): extract state/variant decisions into a testable utility and keep Astro templates on one primary render scaffold.
