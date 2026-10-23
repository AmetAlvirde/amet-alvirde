import { getViteConfig } from "astro/config";

// getViteConfig compiles .astro files so component tests can render them
// through the Astro Container API.
export default getViteConfig({
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts"],
  },
});
