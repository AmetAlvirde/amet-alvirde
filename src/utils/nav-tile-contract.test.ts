import { describe, expect, it } from "vitest";
import { getNavTileState } from "./nav-tile-contract";

describe("nav-tile-contract", () => {
  it("returns disabled semantics and non-interactive classes", () => {
    const state = getNavTileState(true);

    expect(state.ariaDisabled).toBe("true");
    expect(state.containerClass).toContain("pointer-events-none");
  });

  it("returns enabled semantics and interactive classes", () => {
    const state = getNavTileState(false);

    expect(state.ariaDisabled).toBeUndefined();
    expect(state.containerClass).toContain("hover:border-accent");
    expect(state.showsDisabledLabel).toBe(false);
  });

  it("switches title and trailing styles by state", () => {
    const disabledState = getNavTileState(true);
    const enabledState = getNavTileState(false);

    expect(disabledState.titleClass).toContain("text-muted");
    expect(disabledState.trailingClass).toContain("tracking-[0.2em]");
    expect(enabledState.titleClass).toContain("text-foreground");
    expect(enabledState.trailingClass).toContain("shrink-0");
  });
});
