// @vitest-environment node
import { Window } from "happy-dom";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import CTA from "./cta.astro";

const { document } = new Window();

const render = async (props: Record<string, unknown>) => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(CTA, { props });
  const host = document.createElement("div");
  host.innerHTML = html;
  const el = host.querySelector('[data-cta="true"]');
  if (!el) throw new Error(`CTA marker missing in: ${html}`);
  return el;
};

describe("cta render paths", () => {
  it("renders an enabled external link that opens safely in a new tab", async () => {
    const el = await render({
      label: "MAPA",
      href: "https://example.com",
      external: true,
    });

    expect(el.tagName).toBe("A");
    expect(el.getAttribute("data-cta-as")).toBe("a");
    expect(el.getAttribute("data-cta-state")).toBe("enabled");
    expect(el.getAttribute("href")).toBe("https://example.com");
    expect(el.getAttribute("target")).toBe("_blank");
    expect(el.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("renders an enabled internal link without target or rel", async () => {
    const el = await render({ label: "MAPA", href: "/writing" });

    expect(el.tagName).toBe("A");
    expect(el.hasAttribute("target")).toBe(false);
    expect(el.hasAttribute("rel")).toBe(false);
  });

  it("renders a disabled link as a focusable span with no href", async () => {
    const el = await render({ label: "MAPA", disabled: true });

    expect(el.tagName).toBe("SPAN");
    expect(el.getAttribute("data-cta-as")).toBe("span");
    expect(el.getAttribute("data-cta-state")).toBe("disabled");
    expect(el.getAttribute("role")).toBe("link");
    expect(el.getAttribute("tabindex")).toBe("0");
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el.hasAttribute("href")).toBe(false);
    expect(el.hasAttribute("title")).toBe(false);
    expect(el.textContent).toContain("PRONTO");
  });

  it("renders a disabled button with the native attribute", async () => {
    const el = await render({ as: "button", label: "MAPA", disabled: true });

    expect(el.tagName).toBe("BUTTON");
    expect(el.hasAttribute("disabled")).toBe(true);
    expect(el.getAttribute("type")).toBe("button");
  });

  it("keeps the disabled contract when callers pass conflicting attributes", async () => {
    const el = await render({
      label: "MAPA",
      disabled: true,
      tabindex: "-1",
      role: "button",
      "aria-disabled": "false",
      "data-cta-state": "enabled",
    });

    expect(el.getAttribute("tabindex")).toBe("0");
    expect(el.getAttribute("role")).toBe("link");
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el.getAttribute("data-cta-state")).toBe("disabled");
  });
});
