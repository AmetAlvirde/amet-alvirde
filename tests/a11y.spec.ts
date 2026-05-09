import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  THEME_PREFERENCES,
  THEME_STORAGE_KEY,
} from "../src/utils/theme-runtime-contract";

const pages = ["/", "/writing"] as const;
const themes = THEME_PREFERENCES;

for (const pagePath of pages) {
  for (const theme of themes) {
    test(`@a11y ${pagePath} [${theme}] has no axe-core violations`, async ({
      page,
    }) => {
      await page.addInitScript(
        ({ preference, storageKey }) => {
          try {
            window.localStorage.setItem(storageKey, preference);
          } catch {
            // ignore
          }
        },
        { preference: theme, storageKey: THEME_STORAGE_KEY },
      );

      await page.goto(pagePath, { waitUntil: "networkidle" });

      const results = await new AxeBuilder({ page }).analyze();
      if (results.violations.length > 0) {
        // Helpful output in case of failure
        console.log(
          `Accessibility violations for ${pagePath} [${theme}]:`,
          results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            nodes: v.nodes.length,
          })),
        );
      }
      expect(results.violations).toEqual([]);
    });
  }
}
