// disabled assertion categories are not relevant for this site as is.
// We want to do a 1:1 to the web audit experience, meaning assesing only performance, accessibility, best practices and SEO.
module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm build && pnpm preview --port 4173",
      url: [
        "http://localhost:4173/",
        "http://localhost:4173/writing/",
        "http://localhost:4173/writing/mantra-2",
        "http://localhost:4173/writing/mantras",
      ],
      numberOfRuns: 1,
    },
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        "categories:performance": ["warn", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 1.0 }],
        "categories:best-practices": ["warn", { minScore: 0.95 }],
        "categories:seo": ["warn", { minScore: 0.95 }],
        "network-dependency-tree-insight": "off",
        "render-blocking-insight": "off",
        "render-blocking-resources": "off",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
