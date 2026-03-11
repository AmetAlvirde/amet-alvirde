import { getCollection } from "astro:content";

export type Series = {
  slug: string;
  title: string;
  image: string;
  active: boolean;
  reads: string[];
};

export type RecommendedRead = {
  title: string;
  slug: string;
};

export type Read = {
  slug: string;
  seriesSlug: string;
  title: string;
  date: string;
  isFavorite: boolean;
  sourceUrl: string;
  recommendations: RecommendedRead[];
};

export async function getSeries(): Promise<Series[]> {
  const entries = await getCollection("series");
  const withOrder = entries.map((e) => ({
    slug: e.data.slug ?? e.id,
    title: e.data.title,
    image: e.data.image,
    active: e.data.active,
    reads: e.data.reads,
    order: e.data.order ?? Infinity,
  }));
  return withOrder
  .sort((a, b) => a.order - b.order)
  .map(({ slug, title, image, active, reads }) => ({
    slug,
    title,
    image,
    active,
    reads,
  }));
}

export async function getReads(): Promise<Read[]> {
  const entries = await getCollection("reads");
  return entries.map((e) => ({
    slug: e.data.slug ?? e.id,
    seriesSlug: e.data.seriesSlug,
    title: e.data.title,
    date: e.data.date,
    isFavorite: e.data.isFavorite,
    sourceUrl: e.data.sourceUrl,
    recommendations: e.data.recommendations,
  }));
}

export function getSeriesBySlug(
  series: Series[],
  slug: string,
): Series | undefined {
  return series.find((s) => s.slug === slug);
}

export function getReadBySlug(reads: Read[], slug: string): Read | undefined {
  return reads.find((r) => r.slug === slug);
}

export function getReadsBySeries(reads: Read[], readSlugs: string[]): Read[] {
  const bySlug = new Map(reads.map((r) => [r.slug, r]));
  return readSlugs
    .map((slug) => bySlug.get(slug))
    .filter((r): r is Read => r !== undefined);
}

export function getFeaturedRead(reads: Read[]): Read | undefined {
  const favorite = reads.find((r) => r.isFavorite);
  return favorite ?? reads[0];
}
