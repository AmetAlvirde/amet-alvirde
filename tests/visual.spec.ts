import { test, expect } from "@playwright/test";

const pages = ["/", "/writing"] as const;

const viewports = [
  { name: "xs", width: 320, height: 800 },
  { name: "iPhone14ProMax", width: 430, height: 932 },
  { name: "sm", width: 640, height: 800 },
  { name: "md", width: 768, height: 1024 },
  { name: "lg", width: 1280, height: 800 },
] as const;

const themes = ["light", "dark", "system"] as const;

for (const pagePath of pages) {
  for (const theme of themes) {
    for (const viewport of viewports) {
      test(`@visual ${pagePath} [${theme}] ${viewport.name}`, async ({
        page,
      }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        // Ensure theme preference is set before the app script runs
        await page.addInitScript(preference => {
          try {
            window.localStorage.setItem("theme", preference);
          } catch {
            // ignore
          }
        }, theme);

        await page.goto(pagePath, { waitUntil: "networkidle" });

        const fileSafePath = pagePath === "/" ? "home" : "writing";
        await expect(page).toHaveScreenshot(
          `page-${fileSafePath}-${theme}-${viewport.name}.png`,
          { fullPage: true },
        );
      });
    }
  }
}
