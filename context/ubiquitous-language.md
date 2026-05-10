# Personal Website

> Canonical glossary for this context -- terms, relationships, example dialogue. Product pitch, goals, and constraints live in `product.md`.

## Public Identity

| Term | Definition | Aliases to avoid |
| --- | --- | --- |
| **Amet Alvirde** | The public person and identity represented by the website. | brand, portfolio owner |
| **Personal website** | The static public site that gathers Amet's public identity, navigation, and owned presentation. | portfolio, blog |
| **Public identity** | The coherent expression of Amet's name, tone, work facets, and presentation across the site. | branding |
| **Human experience** | The self-description used by the site to frame Amet as a person rather than only a professional role. | persona |
| **Consciousness work** | Amet's reflective writing and mapped thought around consciousness, peace, and lived experience. | self-help content |

## Site Surfaces

| Term | Definition | Aliases to avoid |
| --- | --- | --- |
| **Home surface** | The root page that introduces Amet and routes visitors to available or planned sections. | landing page |
| **Section** | A named area of the website that represents one facet of Amet's public work. | category |
| **Writing section** | The section that presents Amet's written consciousness work on the site. | blog |
| **Planned section** | A section shown in navigation as future direction but intentionally unavailable to visitors. | coming soon page |
| **External surface** | A public destination linked from the website but not owned by this codebase. | integration |

## Experience Quality

| Term | Definition | Aliases to avoid |
| --- | --- | --- |
| **Theme preference** | The visitor's selected light, dark, or system visual mode. | color mode |
| **Theme flash** | A visible mismatch between the intended theme and the rendered page during initial load or navigation. | FOUC, loading flash |
| **Visual baseline** | The approved screenshot set that represents intentional layout and theme behavior. | snapshot truth |
| **Accessibility baseline** | The current expectation that automated axe-core checks report zero violations on covered pages. | a11y pass |
| **Performance budget** | The configured reference limits for generated HTML, CSS, and JavaScript output. | hard bundle gate |
| **Regression check** | An automated check that protects known behavior, layout, accessibility, performance, or code quality. | test |

## Relationships

- A **Personal website** represents exactly one **Amet Alvirde**.
- A **Home surface** belongs to the **Personal website**.
- A **Section** belongs to the **Personal website**.
- A **Writing section** is a **Section**.
- A **Planned section** is a **Section**.
- An **External surface** may be linked from a **Section**.
- A **Theme preference** affects the **Home surface** and every **Section**.
- A **Theme flash** may violate a visitor's intended **Theme preference**.
- A **Regression check** may protect a **Visual baseline**, **Accessibility baseline**, or **Performance budget**.

## Example Dialogue

> **Dev:** "Should the home page behave like a marketing landing page?"
> **Domain expert:** "No. The **Home surface** should introduce **Amet Alvirde** and route visitors through the **Personal website**."

> **Dev:** "Can we turn the disabled software tile into an empty route?"
> **Domain expert:** "Not yet. It remains a **Planned section** until there is real content or a defined cycle."

> **Dev:** "Is the Obsidian map part of this product?"
> **Domain expert:** "It is an **External surface** linked from the **Writing section**, not owned by this codebase."

> **Dev:** "Can a visual tweak ship without updating screenshots?"
> **Domain expert:** "Only if it preserves the **Visual baseline**; intentional visual changes must update it."

> **Dev:** "Can the page briefly render light before switching to dark?"
> **Domain expert:** "No. A **Theme flash** breaks the expected **Theme preference** experience."

> **Dev:** "Should a performance budget warning stop every refactor?"
> **Domain expert:** "No. A **Performance budget** is a reference signal unless the active cycle makes it a hard gate."

## Flagged Ambiguities

- "writing" can refer to on-site content or external consciousness work -- resolved: use **Writing section** for the on-site route and **Consciousness work** or **External surface** for linked material.
