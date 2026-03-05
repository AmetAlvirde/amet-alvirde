import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = ["/", "/writing"] as const;
const themes = ["light", "dark", "system"] as const;

for (const pagePath of pages) {
  for (const theme of themes) {
    test(`@a11y ${pagePath} [${theme}] has no axe-core violations`, async ({
      page,
    }) => {
      await page.addInitScript((preference) => {
        try {
          window.localStorage.setItem("theme", preference);
        } catch {
          // ignore
        }
      }, theme);

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
