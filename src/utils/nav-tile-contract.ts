export interface NavTileState {
  containerClass: string;
  titleClass: string;
  trailingClass: string;
  ariaDisabled?: "true";
  showsDisabledLabel: boolean;
}

const SHARED_CONTAINER_CLASS =
  "flex items-center justify-between border-2 text-foreground no-underline transition-all duration-150 w-full relative gap-4 px-5 md:px-6 [-webkit-tap-highlight-color:transparent]";

const ENABLED_CONTAINER_CLASS =
  "border-border border-t-2 bg-surface py-7 md:py-8 [@media(hover:hover)]:hover:border-accent active:border-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2";

const DISABLED_CONTAINER_CLASS =
  "border-t-0 !border-border bg-canvas py-6 md:py-7 cursor-not-allowed pointer-events-none";

const ENABLED_TITLE_CLASS =
  "text-sm font-medium tracking-widest uppercase leading-tight text-foreground";

const DISABLED_TITLE_CLASS =
  "text-sm font-medium tracking-widest uppercase leading-tight text-muted";

const ENABLED_TRAILING_CLASS = "flex items-center shrink-0";

const DISABLED_TRAILING_CLASS =
  "text-xs uppercase tracking-[0.2em] font-semibold text-muted";

export const getNavTileState = (disabled: boolean): NavTileState => {
  if (disabled) {
    return {
      containerClass: `${SHARED_CONTAINER_CLASS} ${DISABLED_CONTAINER_CLASS}`,
      titleClass: DISABLED_TITLE_CLASS,
      trailingClass: DISABLED_TRAILING_CLASS,
      ariaDisabled: "true",
      showsDisabledLabel: true,
    };
  }

  return {
    containerClass: `${SHARED_CONTAINER_CLASS} ${ENABLED_CONTAINER_CLASS}`,
    titleClass: ENABLED_TITLE_CLASS,
    trailingClass: ENABLED_TRAILING_CLASS,
    showsDisabledLabel: false,
  };
};
