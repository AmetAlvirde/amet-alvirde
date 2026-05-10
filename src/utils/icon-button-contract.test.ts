import { describe, expect, it } from "vitest";
import { getIconButtonClasses } from "./icon-button-contract";

describe("icon-button-contract", () => {
  it("returns default variant classes with caller class appended", () => {
    const classes = getIconButtonClasses("default", "icon-button--active");

    expect(classes).toContain("icon-button");
    expect(classes).toContain(
      "border-2 border-border bg-canvas text-foreground",
    );
    expect(classes).toContain("icon-button--active");
  });

  it("returns inherit variant classes", () => {
    const classes = getIconButtonClasses("inherit");

    expect(classes).toContain(
      "border-2 border-transparent bg-transparent text-inherit",
    );
    expect(classes).toContain("focus-visible:outline-currentColor");
  });

  it("returns borderless variant classes", () => {
    const classes = getIconButtonClasses("borderless");

    expect(classes).toContain("border-0 bg-canvas text-foreground");
    expect(classes).toContain("hover:bg-accent-as-surface");
    expect(classes).not.toContain("border-border");
  });
});
