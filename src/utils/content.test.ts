import { describe, expect, it } from "vitest";
import {
  getFeaturedRead,
  getReadBySlug,
  getReadsBySeries,
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

describe("content", () => {
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
      const readsNoFavorite: Read[] = mockReads.map((r) => ({
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
