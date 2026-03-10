import { test, expect } from "@playwright/test";

test.describe("SEO meta tags", () => {
  test("read page has og:title", async ({ page }) => {
    await page.goto("/writing/mantra-2", { waitUntil: "domcontentloaded" });
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /Mantra/);
  });

  test("read page has og:image", async ({ page }) => {
    await page.goto("/writing/mantra-2", { waitUntil: "domcontentloaded" });
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveCount(1);
  });

  test("series page has og:title", async ({ page }) => {
    await page.goto("/writing/mantras", { waitUntil: "domcontentloaded" });
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /Mantras|Amet/);
  });
});
