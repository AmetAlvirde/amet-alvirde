import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const recommendedReadSchema = z.object({
  title: z.string(),
  slug: z.string(),
});

const series = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/series" }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    image: z.string(),
    active: z.boolean(),
    reads: z.array(z.string()),
    order: z.number().optional(),
  }),
});

const reads = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/reads" }),
  schema: z.object({
    slug: z.string(),
    seriesSlug: z.string(),
    title: z.string(),
    date: z.string(),
    isFavorite: z.boolean(),
    sourceUrl: z.string(),
    recommendations: z.array(recommendedReadSchema),
  }),
});

export const collections = {
  series,
  reads,
};
