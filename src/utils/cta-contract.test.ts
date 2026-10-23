import { describe, expect, it } from "vitest";
import { getCtaState } from "./cta-contract";

describe("cta-contract", () => {
  it("returns disabled semantics and a non-interactive surface", () => {
    const state = getCtaState(true);

    expect(state.ariaDisabled).toBe("true");
    expect(state.showsDisabledLabel).toBe(true);
    expect(state.class).toContain("cursor-not-allowed");
    expect(state.class).not.toContain("hover:bg-foreground");
  });

  it("returns enabled semantics and the accent surface", () => {
    const state = getCtaState(false);

    expect(state.ariaDisabled).toBeUndefined();
    expect(state.showsDisabledLabel).toBe(false);
    expect(state.class).toContain("bg-accent-as-surface");
    expect(state.class).toContain("hover:bg-foreground");
  });
});
