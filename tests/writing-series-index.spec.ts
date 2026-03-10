import { test, expect } from "@playwright/test";

test.describe("SeriesIndex", () => {
  test("SeriesIndex visible on /writing/mantras", async ({ page }) => {
    await page.goto("/writing/mantras", { waitUntil: "networkidle" });
    const index = page.locator('[data-testid="series-index"]');
    await expect(index).toBeVisible();
  });

  test("SeriesIndex hidden on /writing/mantra-2", async ({ page }) => {
    await page.goto("/writing/mantra-2", { waitUntil: "networkidle" });
    const index = page.locator('[data-testid="series-index"]');
    await expect(index).not.toBeVisible();
  });

  test("clicking read entry in index navigates to read", async ({ page }) => {
    await page.goto("/writing/mantras", { waitUntil: "networkidle" });
    await page.locator('a[href*="mantra-2"]').first().click();
    await expect(page).toHaveURL(/\/writing\/mantra-2/);
  });

  test("current read is highlighted in index", async ({ page }) => {
    await page.goto("/writing/mantras", { waitUntil: "networkidle" });
    // First read (mantra-1) is shown when viewing series - it should be highlighted
    const highlighted = page.locator(
      '[data-current-read="true"], .text-accent',
    );
    await expect(highlighted.first()).toBeVisible();
  });
});
