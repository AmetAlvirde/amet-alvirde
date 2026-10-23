const SHARED_CLASS =
  "inline-flex items-center justify-center py-3 px-4 border-2 text-sm font-medium uppercase tracking-widest transition-all duration-150 no-underline";

const ENABLED_CLASS =
  "border-accent-as-surface bg-accent-as-surface text-accent-as-surface-foreground cursor-pointer [@media(hover:hover)]:hover:bg-foreground [@media(hover:hover)]:hover:text-canvas [@media(hover:hover)]:hover:border-foreground active:bg-foreground active:text-canvas active:border-foreground focus-visible:outline-2 focus-visible:outline-accent-as-surface focus-visible:outline-offset-2";

// A disabled link stays focusable (aria-disabled, not removed from the tab
// order), so it keeps a visible focus ring.
const DISABLED_CLASS =
  "border-border bg-canvas text-muted cursor-not-allowed gap-3 focus-visible:outline-2 focus-visible:outline-muted focus-visible:outline-offset-2";

export const DISABLED_LABEL_CLASS =
  "text-xs tracking-[0.2em] font-semibold text-muted";

export const getCtaClass = (disabled: boolean): string =>
  `${SHARED_CLASS} ${disabled ? DISABLED_CLASS : ENABLED_CLASS}`;
