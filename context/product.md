# Amet Alvirde Product Frame

## Elevator Pitch

Problem: Amet needs a small, coherent public home for writing, software, photos, videos, and links to longer-form consciousness work.
Who: Visitors who want to understand Amet Alvirde through his public creative and technical work.
Gap: Social profiles and external publishing surfaces fragment the identity, navigation, and tone of the work.
Distinction: The site presents Amet as a polymath human experience through a restrained, personal, Spanish-first interface rather than a portfolio template or feed.
Form / access surface: A static Astro website at `ametalvirde.com` with a home navigation surface and section pages.

## Intentions

- Preserve Amet's public identity as the organizing center of the website.
- Keep the site fast, accessible, and visually stable across supported themes and viewports.
- Let new sections grow from the home navigation without weakening the site's personal tone.
- Favor durable, readable content over high-maintenance presentation mechanics.

## Goals

- Maintain a coherent home surface that routes visitors to available and planned sections.
- Keep writing available as a first-class section.
- Support light, dark, and system theme preferences without visible boot-time inconsistency.
- Protect the current regression baseline with visual, accessibility, Lighthouse, build-budget, unit, format, and lint checks, while treating performance budgets as descriptive reference signals unless a cycle explicitly makes them blocking.

## Access Surface

- Public visitors enter through `/`.
- Writing is available at `/writing`.
- Planned sections are represented from the home navigation but remain disabled until ready.
- External long-form consciousness work is reached from the writing page through the public Obsidian map link.

## Work Boundaries

- This project owns the public website source, generated static site behavior, local component system, theme handling, and regression checks.
- This project does not own external publishing platforms, social networks, analytics products, or the content lifecycle of linked external surfaces.
- Disabled sections should communicate future direction without creating dead navigable pages.

## Generative Core

The generative core is a personal navigation surface that lets Amet add public facets of his work while keeping identity, accessibility, theme behavior, and performance coherent.

## Coherence Signals

- The first viewport clearly identifies Amet Alvirde.
- The interface remains Spanish-first unless a specific section intentionally chooses otherwise.
- Navigation labels and section copy feel personal, not generic.
- Theme controls work consistently before and after client-side initialization.
- The first paint uses the intended theme without a visible theme flash.
- Visual changes are intentional and reflected in approved snapshots.
- Lighthouse and performance budget movement is recorded as a product signal; it should inform trade-offs without automatically blocking refactor work.

## Constraints

- The site is built with Astro and Tailwind CSS.
- The current automated check surface is documented in `tests/README.md`.
- Public pages must preserve automated accessibility checks with zero axe-core violations.
- Static output is measured against configured performance budgets as a descriptive baseline; exceeding a budget requires an explicit note, not an automatic stop.
- New SDP cycles should be created lazily under `context/cycles/` only when there is an actual feature, refactor, or closure target.
