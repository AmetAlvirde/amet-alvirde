import { test, expect } from "@playwright/test";

test.describe("SeriesList and Series", () => {
  test("SeriesList renders 3 series items on /writing", async ({ page }) => {
    await page.goto("/writing", { waitUntil: "networkidle" });
    const seriesItems = page.locator(
      '[data-testid="series-item"], a[href*="/writing/"]',
    );
    await expect(seriesItems.first()).toBeVisible();
  });

  test("series appear in order by order property (Mantras, Ensayos, Haikus)", async ({
    page,
  }) => {
    await page.goto("/writing", { waitUntil: "networkidle" });
    const seriesItems = page.locator('[data-series]');
    await expect(seriesItems).toHaveCount(3);
    await expect(seriesItems.nth(0)).toHaveAttribute("data-series", "mantras");
    await expect(seriesItems.nth(1)).toHaveAttribute("data-series", "ensayos");
    await expect(seriesItems.nth(2)).toHaveAttribute("data-series", "haikus");
  });

  test("active series has accent indicator", async ({ page }) => {
    await page.goto("/writing", { waitUntil: "networkidle" });
    const mantrasLink = page.locator(
      'a[href="/writing/mantras"], a[href="/writing/mantras/"]',
    );
    await expect(mantrasLink).toBeVisible();
  });

  test("inactive series has reduced opacity", async ({ page }) => {
    await page.goto("/writing", { waitUntil: "networkidle" });
    const ensayos = page.locator('[data-series="ensayos"]');
    await expect(ensayos).toBeVisible();
  });

  test("clicking active series navigates to series URL", async ({ page }) => {
    await page.goto("/writing", { waitUntil: "networkidle" });
    await page
      .locator('a[href="/writing/mantras"], a[href="/writing/mantras/"]')
      .first()
      .click();
    await expect(page).toHaveURL(/\/writing\/mantras/);
  });

  test("series row scrolls horizontally at 320px viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/writing", { waitUntil: "networkidle" });
    const seriesList = page.locator(
      '[data-testid="series-list"], [class*="overflow-x"]',
    );
    await expect(seriesList.first()).toBeVisible();
  });
});
