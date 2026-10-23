import { describe, expect, it } from "vitest";
import { getCtaClass } from "./cta-contract";

describe("cta-contract", () => {
  it("returns a non-interactive surface with a focus ring when disabled", () => {
    const cls = getCtaClass(true);

    expect(cls).toContain("cursor-not-allowed");
    expect(cls).toContain("focus-visible:outline-2");
    expect(cls).not.toContain("hover:bg-foreground");
  });

  it("returns the accent surface when enabled", () => {
    const cls = getCtaClass(false);

    expect(cls).toContain("bg-accent-as-surface");
    expect(cls).toContain("hover:bg-foreground");
  });
});
