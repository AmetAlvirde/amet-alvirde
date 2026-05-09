import { expect, test } from "@playwright/test";
import {
  FAVICON_SELECTOR,
  FAVICON_TARGETS,
  THEME_STORAGE_KEY,
} from "../src/utils/theme-runtime-contract";

test("@firstpaint / [light] applies theme state at commit", async ({
  page,
}) => {
  await page.addInitScript(
    ({ preference, storageKey }) => {
      try {
        window.localStorage.setItem(storageKey, preference);
      } catch {
        // ignore storage restrictions in test browser contexts
      }
    },
    { preference: "light", storageKey: THEME_STORAGE_KEY },
  );

  await page.goto("/", { waitUntil: "commit" });

  const firstPaintState = await page.evaluate((faviconSelector) => {
    const root = document.documentElement;
    const favicon = document.querySelector(faviconSelector);

    return {
      dataTheme: root.getAttribute("data-theme"),
      dataThemePreference: root.getAttribute("data-theme-preference"),
      isDarkClassApplied: root.classList.contains("dark"),
      faviconHref: favicon instanceof HTMLLinkElement ? favicon.href : null,
    };
  }, FAVICON_SELECTOR);

  expect(firstPaintState.dataTheme).toBe("light");
  expect(firstPaintState.dataThemePreference).toBe("light");
  expect(firstPaintState.isDarkClassApplied).toBe(false);
  expect(firstPaintState.faviconHref).toContain(FAVICON_TARGETS.light);
});

test("@firstpaint /writing [dark] applies theme state at commit", async ({
  page,
}) => {
  await page.addInitScript(
    ({ preference, storageKey }) => {
      try {
        window.localStorage.setItem(storageKey, preference);
      } catch {
        // ignore storage restrictions in test browser contexts
      }
    },
    { preference: "dark", storageKey: THEME_STORAGE_KEY },
  );

  await page.goto("/writing", { waitUntil: "commit" });

  const firstPaintState = await page.evaluate((faviconSelector) => {
    const root = document.documentElement;
    const favicon = document.querySelector(faviconSelector);

    return {
      dataTheme: root.getAttribute("data-theme"),
      dataThemePreference: root.getAttribute("data-theme-preference"),
      isDarkClassApplied: root.classList.contains("dark"),
      faviconHref: favicon instanceof HTMLLinkElement ? favicon.href : null,
    };
  }, FAVICON_SELECTOR);

  expect(firstPaintState.dataTheme).toBe("dark");
  expect(firstPaintState.dataThemePreference).toBe("dark");
  expect(firstPaintState.isDarkClassApplied).toBe(true);
  expect(firstPaintState.faviconHref).toContain(FAVICON_TARGETS.dark);
});

test("@firstpaint / [dark] applies theme state at commit", async ({ page }) => {
  await page.addInitScript(
    ({ preference, storageKey }) => {
      try {
        window.localStorage.setItem(storageKey, preference);
      } catch {
        // ignore storage restrictions in test browser contexts
      }
    },
    { preference: "dark", storageKey: THEME_STORAGE_KEY },
  );

  await page.goto("/", { waitUntil: "commit" });

  const firstPaintState = await page.evaluate((faviconSelector) => {
    const root = document.documentElement;
    const favicon = document.querySelector(faviconSelector);

    return {
      dataTheme: root.getAttribute("data-theme"),
      dataThemePreference: root.getAttribute("data-theme-preference"),
      isDarkClassApplied: root.classList.contains("dark"),
      faviconHref: favicon instanceof HTMLLinkElement ? favicon.href : null,
    };
  }, FAVICON_SELECTOR);

  expect(firstPaintState.dataTheme).toBe("dark");
  expect(firstPaintState.dataThemePreference).toBe("dark");
  expect(firstPaintState.isDarkClassApplied).toBe(true);
  expect(firstPaintState.faviconHref).toContain(FAVICON_TARGETS.dark);
});

test("@firstpaint /writing [light] applies theme state at commit", async ({
  page,
}) => {
  await page.addInitScript(
    ({ preference, storageKey }) => {
      try {
        window.localStorage.setItem(storageKey, preference);
      } catch {
        // ignore storage restrictions in test browser contexts
      }
    },
    { preference: "light", storageKey: THEME_STORAGE_KEY },
  );

  await page.goto("/writing", { waitUntil: "commit" });

  const firstPaintState = await page.evaluate((faviconSelector) => {
    const root = document.documentElement;
    const favicon = document.querySelector(faviconSelector);

    return {
      dataTheme: root.getAttribute("data-theme"),
      dataThemePreference: root.getAttribute("data-theme-preference"),
      isDarkClassApplied: root.classList.contains("dark"),
      faviconHref: favicon instanceof HTMLLinkElement ? favicon.href : null,
    };
  }, FAVICON_SELECTOR);

  expect(firstPaintState.dataTheme).toBe("light");
  expect(firstPaintState.dataThemePreference).toBe("light");
  expect(firstPaintState.isDarkClassApplied).toBe(false);
  expect(firstPaintState.faviconHref).toContain(FAVICON_TARGETS.light);
});

test.describe("@firstpaint system preference", () => {
  test.use({ colorScheme: "light" });

  test("/ [system-light] applies light theme at commit", async ({ page }) => {
    await page.addInitScript(
      ({ preference, storageKey }) => {
        try {
          window.localStorage.setItem(storageKey, preference);
        } catch {
          // ignore storage restrictions in test browser contexts
        }
      },
      { preference: "system", storageKey: THEME_STORAGE_KEY },
    );

    await page.goto("/", { waitUntil: "commit" });

    const firstPaintState = await page.evaluate((faviconSelector) => {
      const root = document.documentElement;
      const favicon = document.querySelector(faviconSelector);

      return {
        dataTheme: root.getAttribute("data-theme"),
        dataThemePreference: root.getAttribute("data-theme-preference"),
        isDarkClassApplied: root.classList.contains("dark"),
        faviconHref: favicon instanceof HTMLLinkElement ? favicon.href : null,
      };
    }, FAVICON_SELECTOR);

    expect(firstPaintState.dataTheme).toBe("light");
    expect(firstPaintState.dataThemePreference).toBe("system");
    expect(firstPaintState.isDarkClassApplied).toBe(false);
    expect(firstPaintState.faviconHref).toContain(FAVICON_TARGETS.light);
  });
});

test.describe("@firstpaint system preference dark", () => {
  test.use({ colorScheme: "dark" });

  test("/writing [system-dark] applies dark theme at commit", async ({
    page,
  }) => {
    await page.addInitScript(
      ({ preference, storageKey }) => {
        try {
          window.localStorage.setItem(storageKey, preference);
        } catch {
          // ignore storage restrictions in test browser contexts
        }
      },
      { preference: "system", storageKey: THEME_STORAGE_KEY },
    );

    await page.goto("/writing", { waitUntil: "commit" });

    const firstPaintState = await page.evaluate((faviconSelector) => {
      const root = document.documentElement;
      const favicon = document.querySelector(faviconSelector);

      return {
        dataTheme: root.getAttribute("data-theme"),
        dataThemePreference: root.getAttribute("data-theme-preference"),
        isDarkClassApplied: root.classList.contains("dark"),
        faviconHref: favicon instanceof HTMLLinkElement ? favicon.href : null,
      };
    }, FAVICON_SELECTOR);

    expect(firstPaintState.dataTheme).toBe("dark");
    expect(firstPaintState.dataThemePreference).toBe("system");
    expect(firstPaintState.isDarkClassApplied).toBe(true);
    expect(firstPaintState.faviconHref).toContain(FAVICON_TARGETS.dark);
  });

  test("/ [system-dark] applies dark theme at commit", async ({ page }) => {
    await page.addInitScript(
      ({ preference, storageKey }) => {
        try {
          window.localStorage.setItem(storageKey, preference);
        } catch {
          // ignore storage restrictions in test browser contexts
        }
      },
      { preference: "system", storageKey: THEME_STORAGE_KEY },
    );

    await page.goto("/", { waitUntil: "commit" });

    const firstPaintState = await page.evaluate((faviconSelector) => {
      const root = document.documentElement;
      const favicon = document.querySelector(faviconSelector);

      return {
        dataTheme: root.getAttribute("data-theme"),
        dataThemePreference: root.getAttribute("data-theme-preference"),
        isDarkClassApplied: root.classList.contains("dark"),
        faviconHref: favicon instanceof HTMLLinkElement ? favicon.href : null,
      };
    }, FAVICON_SELECTOR);

    expect(firstPaintState.dataTheme).toBe("dark");
    expect(firstPaintState.dataThemePreference).toBe("system");
    expect(firstPaintState.isDarkClassApplied).toBe(true);
    expect(firstPaintState.faviconHref).toContain(FAVICON_TARGETS.dark);
  });
});

test.describe("@firstpaint system preference light writing", () => {
  test.use({ colorScheme: "light" });

  test("/writing [system-light] applies light theme at commit", async ({
    page,
  }) => {
    await page.addInitScript(
      ({ preference, storageKey }) => {
        try {
          window.localStorage.setItem(storageKey, preference);
        } catch {
          // ignore storage restrictions in test browser contexts
        }
      },
      { preference: "system", storageKey: THEME_STORAGE_KEY },
    );

    await page.goto("/writing", { waitUntil: "commit" });

    const firstPaintState = await page.evaluate((faviconSelector) => {
      const root = document.documentElement;
      const favicon = document.querySelector(faviconSelector);

      return {
        dataTheme: root.getAttribute("data-theme"),
        dataThemePreference: root.getAttribute("data-theme-preference"),
        isDarkClassApplied: root.classList.contains("dark"),
        faviconHref: favicon instanceof HTMLLinkElement ? favicon.href : null,
      };
    }, FAVICON_SELECTOR);

    expect(firstPaintState.dataTheme).toBe("light");
    expect(firstPaintState.dataThemePreference).toBe("system");
    expect(firstPaintState.isDarkClassApplied).toBe(false);
    expect(firstPaintState.faviconHref).toContain(FAVICON_TARGETS.light);
  });
});
