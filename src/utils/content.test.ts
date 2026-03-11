import { describe, expect, it, vi } from "vitest";
import {
  getFeaturedRead,
  getReadBySlug,
  getReadsBySeries,
  getSeries,
  getSeriesBySlug,
} from "./content";
import type { Read, Series } from "./content";

const mockSeries: Series[] = [
  {
    slug: "mantras",
    title: "Mantras",
    image: "/series/mantras.svg",
    active: true,
    reads: ["mantra-1", "mantra-2"],
  },
  {
    slug: "ensayos",
    title: "Ensayos",
    image: "/series/ensayos.svg",
    active: false,
    reads: [],
  },
];

const mockReads: Read[] = [
  {
    slug: "mantra-1",
    seriesSlug: "mantras",
    title: "Mantra #1",
    date: "Enero de 2026",
    isFavorite: false,
    sourceUrl: "https://example.com/mantra-1",
    recommendations: [],
  },
  {
    slug: "mantra-2",
    seriesSlug: "mantras",
    title: "Mantra #2",
    date: "Enero de 2026",
    isFavorite: true,
    sourceUrl: "https://publish.obsidian.md/amet-alvirde/Mapa+público",
    recommendations: [{ title: "Mantra #1", slug: "mantra-1" }],
  },
];

vi.mock("astro:content", () => ({
  getCollection: vi.fn().mockImplementation((coll: string) => {
    if (coll === "series") {
      return Promise.resolve([
        {
          id: "ensayos",
          data: {
            slug: "ensayos",
            title: "Ensayos",
            image: "/series/ensayos.svg",
            active: false,
            reads: [],
            order: 2,
          },
        },
        {
          id: "haikus",
          data: {
            slug: "haikus",
            title: "Haikus",
            image: "/series/haikus.svg",
            active: false,
            reads: [],
            order: 3,
          },
        },
        {
          id: "mantras",
          data: {
            slug: "mantras",
            title: "Mantras",
            image: "/series/mantras.svg",
            active: true,
            reads: ["mantra-1", "mantra-2"],
            order: 1,
          },
        },
      ]);
    }
    return Promise.resolve([]);
  }),
  getEntry: () => Promise.resolve(undefined),
  getEntries: () => Promise.resolve([]),
  render: () => Promise.resolve({ Content: () => null }),
  defineCollection: (c: unknown) => c,
  reference: (coll: string) => () => coll,
}));

describe("content", () => {
  describe("getSeries", () => {
    it("returns series sorted by order property (ascending)", async () => {
      const series = await getSeries();
      expect(series).toHaveLength(3);
      expect(series[0]!.slug).toBe("mantras");
      expect(series[1]!.slug).toBe("ensayos");
      expect(series[2]!.slug).toBe("haikus");
    });

    it("places series without order at the end (order defaults to Infinity)", async () => {
      const { getCollection } = await import("astro:content");
      (getCollection as ReturnType<typeof vi.fn>).mockImplementationOnce(
        (coll: string) => {
          if (coll === "series") {
            return Promise.resolve([
              {
                id: "no-order",
                data: {
                  slug: "no-order",
                  title: "No Order",
                  image: "/x.svg",
                  active: false,
                  reads: [],
                  // order omitted
                },
              },
              {
                id: "with-order",
                data: {
                  slug: "with-order",
                  title: "With Order",
                  image: "/y.svg",
                  active: false,
                  reads: [],
                  order: 1,
                },
              },
            ]);
          }
          return Promise.resolve([]);
        },
      );
      const series = await getSeries();
      expect(series[0]!.slug).toBe("with-order");
      expect(series[1]!.slug).toBe("no-order");
    });
  });

  describe("getSeriesBySlug", () => {
    it("returns the mantras series for slug mantras", () => {
      const mantras = getSeriesBySlug(mockSeries, "mantras");
      expect(mantras).toBeDefined();
      expect(mantras?.slug).toBe("mantras");
      expect(mantras?.title).toBe("Mantras");
      expect(mantras?.reads).toEqual(["mantra-1", "mantra-2"]);
    });

    it("returns undefined for unknown slug", () => {
      expect(getSeriesBySlug(mockSeries, "unknown")).toBeUndefined();
    });
  });

  describe("getReadBySlug", () => {
    it("returns mantra-2 for slug mantra-2", () => {
      const read = getReadBySlug(mockReads, "mantra-2");
      expect(read).toBeDefined();
      expect(read?.slug).toBe("mantra-2");
      expect(read?.title).toBe("Mantra #2");
      expect(read?.isFavorite).toBe(true);
    });

    it("returns undefined for unknown slug", () => {
      expect(getReadBySlug(mockReads, "unknown")).toBeUndefined();
    });
  });

  describe("getReadsBySeries", () => {
    it("returns reads in series order", () => {
      const readSlugs = mockSeries[0]!.reads;
      const ordered = getReadsBySeries(mockReads, readSlugs);
      expect(ordered).toHaveLength(2);
      expect(ordered[0]!.slug).toBe("mantra-1");
      expect(ordered[1]!.slug).toBe("mantra-2");
    });

    it("skips missing reads", () => {
      const ordered = getReadsBySeries(mockReads, [
        "mantra-1",
        "nonexistent",
        "mantra-2",
      ]);
      expect(ordered).toHaveLength(2);
      expect(ordered[0]!.slug).toBe("mantra-1");
      expect(ordered[1]!.slug).toBe("mantra-2");
    });
  });

  describe("getFeaturedRead", () => {
    it("returns favorite read when present", () => {
      const featured = getFeaturedRead(mockReads);
      expect(featured).toBeDefined();
      expect(featured?.isFavorite).toBe(true);
      expect(featured?.slug).toBe("mantra-2");
    });

    it("returns first read when none is favorite", () => {
      const readsNoFavorite: Read[] = mockReads.map(r => ({
        ...r,
        isFavorite: false,
      }));
      const featured = getFeaturedRead(readsNoFavorite);
      expect(featured).toBeDefined();
      expect(featured?.slug).toBe("mantra-1");
    });

    it("returns undefined for empty array", () => {
      expect(getFeaturedRead([])).toBeUndefined();
    });
  });
});
