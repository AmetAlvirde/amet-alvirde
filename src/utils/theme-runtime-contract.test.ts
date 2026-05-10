import { describe, expect, it } from "vitest";
import {
  FAVICON_SELECTOR,
  THEME_PREFERENCES,
  THEME_STORAGE_KEY,
  getDocumentThemeAttributes,
  getFaviconTarget,
  normalizeThemePreference,
  resolveActualTheme,
} from "./theme-runtime-contract";

describe("theme-runtime-contract", () => {
  it("defines canonical theme preferences and storage key", () => {
    expect(THEME_STORAGE_KEY).toBe("theme");
    expect(THEME_PREFERENCES).toEqual(["light", "dark", "system"]);
    expect(FAVICON_SELECTOR).toBe('link[rel="icon"]:not([media])');
  });

  it("normalizes invalid or missing preferences to system", () => {
    expect(normalizeThemePreference("light")).toBe("light");
    expect(normalizeThemePreference("dark")).toBe("dark");
    expect(normalizeThemePreference("system")).toBe("system");
    expect(normalizeThemePreference("invalid")).toBe("system");
    expect(normalizeThemePreference(null)).toBe("system");
    expect(normalizeThemePreference(undefined)).toBe("system");
  });

  it("resolves actual theme for explicit and system preferences", () => {
    expect(resolveActualTheme("light", true)).toBe("light");
    expect(resolveActualTheme("dark", false)).toBe("dark");
    expect(resolveActualTheme("system", false)).toBe("light");
    expect(resolveActualTheme("system", true)).toBe("dark");
  });

  it("returns document attributes for resolved theme", () => {
    expect(getDocumentThemeAttributes("system", "dark")).toEqual({
      dataTheme: "dark",
      dataThemePreference: "system",
      isDarkClass: true,
    });

    expect(getDocumentThemeAttributes("light", "light")).toEqual({
      dataTheme: "light",
      dataThemePreference: "light",
      isDarkClass: false,
    });
  });

  it("selects favicon target by resolved theme", () => {
    expect(getFaviconTarget("light")).toBe("/favicon-light-mode.svg");
    expect(getFaviconTarget("dark")).toBe("/favicon-dark-mode.svg");
  });
});
