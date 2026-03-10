import { test, expect } from "@playwright/test";

test.describe("writing routes", () => {
  test("GET /writing returns 200", async ({ page }) => {
    const res = await page.goto("/writing", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(200);
  });

  test("GET /writing/mantra-2 returns 200 and renders article content", async ({
    page,
  }) => {
    const res = await page.goto("/writing/mantra-2", {
      waitUntil: "domcontentloaded",
    });
    expect(res?.status()).toBe(200);
    await expect(page.locator("main article")).toBeVisible();
    await expect(
      page.getByText("Elijo vivir en paz", { exact: false }),
    ).toBeVisible();
  });

  test("GET /writing/mantras returns 200", async ({ page }) => {
    const res = await page.goto("/writing/mantras", {
      waitUntil: "domcontentloaded",
    });
    expect(res?.status()).toBe(200);
  });

  test("GET /writing/mantra-2 shows source link to Obsidian vault", async ({
    page,
  }) => {
    await page.goto("/writing/mantra-2", { waitUntil: "networkidle" });
    const link = page.locator('a[href*="obsidian"]');
    await expect(link).toBeVisible();
  });
});
