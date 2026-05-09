import { expect, test } from "@playwright/test";

test("CTA exposes route-surface contract markers and external-link behavior", async ({
  page,
}) => {
  await page.goto("/writing", { waitUntil: "networkidle" });

  const cta = page.locator('[data-cta="true"]');
  await expect(cta).toHaveCount(1);
  await expect(cta).toHaveAttribute("data-cta-as", "a");
  await expect(cta).toHaveAttribute("target", "_blank");
  await expect(cta).toHaveAttribute("rel", "noopener noreferrer");
});
