# Theme Runtime And Component Variants Pitch

Problem: Future maintainers cannot safely simplify theme and component internals because the current code protects against theme flash through duplicated runtime paths and repeated component branches.
Who: Maintainers of the personal website who need to improve the current codebase before adding new public sections.
Gap: The existing implementation works, but its theme behavior requires cross-file reasoning and its component variants require mentally diffing duplicated markup.
Distinction: This cycle deepens the current static site without introducing new content models, routes, or product surfaces.
Form / access surface: A refactor cycle for the Astro source, documented under `context/cycles/01-theme-runtime-and-component-variants/`.
