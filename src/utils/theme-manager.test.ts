import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getActualTheme,
  getCurrentPreference,
  getCurrentTheme,
  setDarkTheme,
  setLightTheme,
  setSystemTheme,
  initializeThemeManager,
} from "./theme-manager";

const getButtons = () => {
  const lightThemeButton = document.querySelector(
    "#light-theme-button",
  ) as HTMLButtonElement | null;
  const systemThemeButton = document.querySelector(
    "#system-theme-button",
  ) as HTMLButtonElement | null;
  const darkThemeButton = document.querySelector(
    "#dark-theme-button",
  ) as HTMLButtonElement | null;

  if (!lightThemeButton || !systemThemeButton || !darkThemeButton) {
    throw new Error("Test DOM not initialized correctly");
  }

  return {
    lightThemeButton,
    systemThemeButton,
    darkThemeButton,
  };
};

const createThemeElements = () => {
  const { lightThemeButton, systemThemeButton, darkThemeButton } = getButtons();

  return {
    lightThemeButton,
    systemThemeButton,
    darkThemeButton,
    monogram: document.querySelector("#monogram") as HTMLElement | null,
  };
};

describe("theme-manager", () => {
  beforeEach(() => {
    // Reset DOM
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-theme-preference");
    document.documentElement.className = "";

    document.head.innerHTML =
      '<link rel="icon" rel="icon" href="/favicon-light-mode.svg" />';

    document.body.innerHTML = `
      <button id="light-theme-button" class="icon-button"></button>
      <button id="system-theme-button" class="icon-button"></button>
      <button id="dark-theme-button" class="icon-button"></button>
      <div id="monogram"></div>
    `;

    // Reset storage and mocks
    window.localStorage.clear();
    vi.restoreAllMocks();

    // Default matchMedia stub
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  describe("getActualTheme", () => {
    it("returns the explicit preference when not system", () => {
      expect(getActualTheme("light")).toBe("light");
      expect(getActualTheme("dark")).toBe("dark");
    });

    it("derives theme from matchMedia when preference is system", () => {
      vi.stubGlobal("matchMedia", () => ({
        matches: true,
        media: "(prefers-color-scheme: dark)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(getActualTheme("system")).toBe("dark");
    });
  });

  describe("getCurrentPreference", () => {
    it("prefers data-theme-preference attribute when present", () => {
      document.documentElement.setAttribute("data-theme-preference", "dark");
      window.localStorage.setItem("theme", "light");

      expect(getCurrentPreference()).toBe("dark");
    });

    it("falls back to localStorage when attribute is missing", () => {
      window.localStorage.setItem("theme", "light");
      expect(getCurrentPreference()).toBe("light");
    });

    it("defaults to system when nothing is set or value is invalid", () => {
      expect(getCurrentPreference()).toBe("system");

      window.localStorage.setItem("theme", "invalid");
      expect(getCurrentPreference()).toBe("system");
    });
  });

  describe("getCurrentTheme", () => {
    it("returns current data-theme value", () => {
      document.documentElement.setAttribute("data-theme", "dark");
      expect(getCurrentTheme()).toBe("dark");
      document.documentElement.setAttribute("data-theme", "light");
      expect(getCurrentTheme()).toBe("light");
    });

    it("returns null when data-theme is not set", () => {
      document.documentElement.removeAttribute("data-theme");
      expect(getCurrentTheme()).toBeNull();
    });
  });

  describe("setLightTheme / setDarkTheme / setSystemTheme", () => {
    it("sets light theme correctly", () => {
      const elements = createThemeElements();

      setLightTheme(elements);

      expect(window.localStorage.getItem("theme")).toBe("light");
      expect(
        document.documentElement.getAttribute("data-theme-preference"),
      ).toBe("light");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
      expect(document.documentElement.classList.contains("dark")).toBe(false);

      const { lightThemeButton, systemThemeButton, darkThemeButton } =
        getButtons();
      expect(lightThemeButton.classList.contains("icon-button--active")).toBe(
        true,
      );
      expect(systemThemeButton.classList.contains("icon-button--active")).toBe(
        false,
      );
      expect(darkThemeButton.classList.contains("icon-button--active")).toBe(
        false,
      );

      const favicon = document.querySelector(
        'link[rel="icon"]:not([media])',
      ) as HTMLLinkElement | null;
      expect(favicon?.href.endsWith("/favicon-light-mode.svg")).toBe(true);
    });

    it("sets dark theme correctly", () => {
      const elements = createThemeElements();

      setDarkTheme(elements);

      expect(window.localStorage.getItem("theme")).toBe("dark");
      expect(
        document.documentElement.getAttribute("data-theme-preference"),
      ).toBe("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);

      const { lightThemeButton, systemThemeButton, darkThemeButton } =
        getButtons();
      expect(lightThemeButton.classList.contains("icon-button--active")).toBe(
        false,
      );
      expect(systemThemeButton.classList.contains("icon-button--active")).toBe(
        false,
      );
      expect(darkThemeButton.classList.contains("icon-button--active")).toBe(
        true,
      );

      const favicon = document.querySelector(
        'link[rel="icon"]:not([media])',
      ) as HTMLLinkElement | null;
      expect(favicon?.href.endsWith("/favicon-dark-mode.svg")).toBe(true);
    });

    it("sets system theme correctly using matchMedia", () => {
      vi.stubGlobal("matchMedia", () => ({
        matches: true,
        media: "(prefers-color-scheme: dark)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const elements = createThemeElements();

      setSystemTheme(elements);

      expect(window.localStorage.getItem("theme")).toBe("system");
      expect(
        document.documentElement.getAttribute("data-theme-preference"),
      ).toBe("system");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);

      const { systemThemeButton } = getButtons();
      expect(systemThemeButton.classList.contains("icon-button--active")).toBe(
        true,
      );
    });
  });

  describe("initializeThemeManager", () => {
    it("initializes theme and makes buttons interactive", () => {
      window.localStorage.setItem("theme", "dark");

      initializeThemeManager();

      expect(
        document.documentElement.getAttribute("data-theme-preference"),
      ).toBe("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

      const { lightThemeButton, systemThemeButton, darkThemeButton } =
        getButtons();

      expect(lightThemeButton.getAttribute("tabindex")).toBe("0");
      expect(systemThemeButton.getAttribute("tabindex")).toBe("0");
      expect(darkThemeButton.getAttribute("tabindex")).toBe("0");
    });

    it("handles missing required elements without throwing", () => {
      document.body.innerHTML = "";
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => initializeThemeManager()).not.toThrow();
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
