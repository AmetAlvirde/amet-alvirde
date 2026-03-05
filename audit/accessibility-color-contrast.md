# Accessibility Color Contrast Audit

Generated as part of Step 2 (Accessibility and quality fixes) of the site audit plan. This document intentionally **does not** change the color palette; it records the current issues and concrete options for future palette or token adjustments.

## Summary

Tools:
- **axe-core** via Playwright (`pnpm test:a11y`)
- **Lighthouse CI** (`pnpm test:lighthouse`)

Status:
- Non-color issues (skip link, main landmarks, reduced motion, `<h1>` structure) are addressed in code.
- Remaining accessibility failures are all related to **insufficient color contrast** between text and background.

The errors below map directly to the axe output you saw in the terminal.

## Home page `/`

### 1. Hero subtitle: "Soy como tú" (light & system themes)

- **Selector / HTML (from axe):**
  - `target`: `.md\:text-lg`
  - `html`:  
    `<span class="text-base md:text-lg tracking-wider text-accent-foreground font-bold opacity-80">Soy como tú</span>`
- **Colors (axe data, light theme):**
  - `bgColor`: `#475500` (derived from `--accent` / solarized green on neutral background)
  - `fgColor`: `#b3bda3` (derived from `--accent-foreground` in light mode, adjusted by opacity)
  - `contrastRatio`: **4.17:1**
  - `expectedContrastRatio`: **4.5:1** (WCAG AA for normal text)
- **Issue:**
  - 4.17:1 < 4.5:1 → **fails WCAG AA** for normal-sized text.
- **Potential future fixes (palette / token level):**
  - Lighten the foreground (`--accent-foreground`) slightly so it is more distant from the accent background in Oklch.
  - Darken the accent background (`--accent`) in light mode so the delta L between `--accent` and `--accent-foreground` is larger.
  - Consider using `--text-primary` or `--text-muted` on this background, if that still matches the intended art direction.

### 2. Hero title + subtitle (dark theme)

- **Selectors / HTML (from axe):**
  - Title:  
    - `target`: `.xs\:text-xl`  
    - `html`: `<span class="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold tracking-wider uppercase leading-tight">Amet Alvirde</span>`
  - Subtitle:  
    - `target`: `.md\:text-lg`  
    - `html`: `<span class="text-base md:text-lg tracking-wider text-accent-foreground font-bold opacity-80">Soy como tú</span>`
- **Colors (axe data, dark theme):**
  - Title:
    - `bgColor`: `#819500`
    - `fgColor`: `#ced7cc`
    - `contrastRatio`: **2.28:1**
    - Expected: **3:1** (large/bold text)
  - Subtitle:
    - `bgColor`: `#819500`
    - `fgColor`: `#bfcaa3`
    - `contrastRatio`: **1.95:1**
    - Expected: **4.5:1**
- **Issue:**
  - Both title and subtitle in dark mode have **insufficient contrast** against the accent background.
- **Potential future fixes:**
  - Increase the lightness contrast between the accent background (`--accent` in `.dark`) and whatever token is used for `--accent-foreground` / text here.
  - Use `--text-primary` or `--text-secondary` for hero text in dark mode, reserving `--accent` for borders and small accents rather than large blocks of text on accent-colored backgrounds.

## Writing page `/writing`

### 3. Header subtitle: "mantra #2" (light, dark, system themes)

- **Selector / HTML (from axe, light/system):**
  - `target`: `.opacity-80`
  - `html`:  
    `<span class="text-base md:text-lg tracking-wider text-accent font-bold opacity-80 font-mono uppercase">mantra #2</span>`
- **Colors (axe light mode):**
  - `bgColor`: `#ced7cc` (body background / surface)
  - `fgColor`: `#626f29` (accent text)
  - `contrastRatio`: **3.71:1**
  - Expected: **4.5:1**
- **Colors (axe dark mode):**
  - `bgColor`: `#000408` (off-black)
  - `fgColor`: `#677802` (accent text)
  - `contrastRatio`: **4.17:1**
  - Expected: **4.5:1**
- **Issue:**
  - In both themes, the "mantra #2" label does not meet AA for normal text.
- **Potential future fixes:**
  - Increase the contrast between `text-accent` and the background:
    - Light: slightly darken the accent hue or lighten the surface/background token behind it.
    - Dark: slightly increase the lightness of accent foreground relative to the off-black background, or reduce saturation.
  - Alternatively, treat the label as large text (increase size ≥ 18pt / 24px or 14pt / 18.66px bold) and ensure a ≥ 3:1 ratio instead.

### 4. CTA: "MAPA DE MI CONSCIENCIA ↗" (dark theme)

- **Selector / HTML (from axe):**
  - `target`: `.border-accent`
  - `html`:  
    `<a href="https://publish.obsi..." target="_blank" rel="noopener noreferrer" class="inline-flex items-ce...">MAPA DE MI CONSCIENCIA ↗</a>`
- **Colors (axe data, dark):**
  - `bgColor`: `#819500` (accent background on CTA)
  - `fgColor`: `#ced7cc` (accent-foreground-like text color)
  - `contrastRatio`: **2.28:1**
  - Expected: **4.5:1** (normal text)
- **Issue:**
  - CTA text on accent background in dark mode fails AA.
- **Potential future fixes:**
  - Either:
    - Use `--text-primary` (light neutral) on a darker accent-variant background, or
    - Use `--accent-foreground` on a **darker** accent background so the ratio reaches ≥ 4.5:1.
  - Consider a CTA style that uses a border-accent + neutral background instead of a full accent fill, so the text uses the primary foreground tokens which already pass.

## Lighthouse / broader signals

Lighthouse CI (`pnpm test:lighthouse`) currently surfaces:
- **Accessibility category < 1.0** due primarily to the same `color-contrast` violations listed above.
- Additional performance/best-practices flags (e.g., render-blocking resources) that are **independent** of colors and will be handled in other parts of the plan.

## Recommendations for a future color-focused pass

When you’re ready to adjust the palette itself:

1. **Work at the token level** in `src/styles/global.css`:
   - Adjust `--accent`, `--accent-foreground`, and related semantic tokens (`--text-primary`, `--text-muted`) in both the root and `.dark` sections.
   - Re-run `pnpm test:a11y` and `pnpm test:lighthouse` after each iteration.

2. **Use a contrast checker with exact values from the tokens**:
   - Plug the current `oklch(...)` or hex values into a tool like the WebAIM contrast checker to verify AA/AAA.
   - Target:
     - Normal text: ≥ 4.5:1
     - Large or bold text: ≥ 3:1

3. **Revisit the design intent for accent blocks**:
   - For large hero blocks and CTA backgrounds, favor a combination where:
     - The background is either significantly darker or lighter than the text, not close in lightness.
     - Accents that need to be subtle (e.g., badges) can afford lower contrast only when they are redundant with another clear indicator (icon, shape, or text).

This audit should give you a concrete checklist of color-adjustment work to do later, while allowing the current refactor to proceed without altering the established palette right now.

