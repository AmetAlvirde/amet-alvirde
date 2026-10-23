import { expect, test } from "@playwright/test";

// The map CTA is disabled while the public map is offline (Obsidian Publish
// was cancelled; the new home is in progress). The enabled external-link
// path (href, target, rel) is covered by src/components/cta.test.ts until a
// page uses it again.
test("CTA exposes route-surface contract markers and its disabled state", async ({
  page,
}) => {
  await page.goto("/writing", { waitUntil: "networkidle" });

  const cta = page.locator('[data-cta="true"]');
  await expect(cta).toHaveCount(1);
  await expect(cta).toHaveAttribute("data-cta-as", "span");
  await expect(cta).toHaveAttribute("data-cta-state", "disabled");
  await expect(cta).toHaveAttribute("aria-disabled", "true");
  await expect(cta).toHaveAttribute("role", "link");
  await expect(cta).toHaveAttribute("tabindex", "0");
  await expect(cta).toHaveJSProperty("tagName", "SPAN");
  await expect(cta).not.toHaveAttribute("href", /.*/);
  await expect(cta).toContainText("PRONTO");

  await cta.focus();
  await expect(cta).toBeFocused();
});
