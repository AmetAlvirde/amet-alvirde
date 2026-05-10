export type IconButtonVariant = "default" | "inherit" | "borderless";

const DEFAULT_CLASSES =
  "icon-button inline-flex items-center justify-center p-2 border-2 border-border bg-canvas text-foreground transition-all duration-150 cursor-pointer [@media(hover:hover)]:hover:bg-accent-as-surface [@media(hover:hover)]:hover:text-accent-as-surface-foreground [@media(hover:hover)]:hover:border-accent-as-surface focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2";

const INHERIT_CLASSES =
  "icon-button inline-flex items-center justify-center p-2 border-2 border-transparent bg-transparent text-inherit transition-all duration-150 cursor-pointer [@media(hover:hover)]:hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-currentColor";

const BORDERLESS_CLASSES =
  "icon-button inline-flex items-center justify-center p-2 border-0 bg-canvas text-foreground transition-all duration-150 cursor-pointer [@media(hover:hover)]:hover:bg-accent-as-surface [@media(hover:hover)]:hover:text-accent-as-surface-foreground focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2";

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  default: DEFAULT_CLASSES,
  inherit: INHERIT_CLASSES,
  borderless: BORDERLESS_CLASSES,
};

export const getIconButtonClasses = (
  variant: IconButtonVariant,
  extraClass?: string,
): string => [VARIANT_CLASSES[variant], extraClass].filter(Boolean).join(" ");
