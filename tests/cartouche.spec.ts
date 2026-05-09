import { expect, test } from "@playwright/test";

test("cartouche exposes variant markers on home and writing surfaces", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const homeCartouche = page.locator('[data-cartouche="true"]');
  await expect(homeCartouche).toHaveCount(1);
  await expect(homeCartouche).toHaveAttribute("data-cartouche-variant", "hero");

  await page.goto("/writing", { waitUntil: "networkidle" });

  const writingCartouche = page.locator('[data-cartouche="true"]');
  await expect(writingCartouche).toHaveCount(1);
  await expect(writingCartouche).toHaveAttribute(
    "data-cartouche-variant",
    "section",
  );
});
