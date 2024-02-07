import { z } from 'zod';

export const authorSchema = z.object({
	name: z.string(),
	title: z.string().optional(),
	email: z.string().optional(),
	link: z.string().optional(),
	avatarUrl: z.string().optional(),
});
export type Author = z.infer<typeof authorSchema>;

export const expandedSeries = z.object({
	name: z.string(),
	position: z.number(),
	finalPublishDate: z.date(),
	all: z.array(
		z.object({
			title: z.string(),
			articleSlug: z.string(),
			position: z.number(),
			publishedAt: z.date(),
		}),
	),
});
export type ExpandedSeries = z.infer<typeof expandedSeries>;

export const rawFrontMatterSchema = z.object({
	/** Relative link on this website */
	implementationSlug: z.string(),
	/** GitHub */
	srcCodeHref: z.string(),
	title: z.string(),
	description: z.string(),
	publishedAt: z.date(),
	authors: z.array(authorSchema),

	tags: z.array(z.string()).optional().nullable(),
	updates: z.array(z.object({ at: z.date(), descriptions: z.array(z.string()) })).optional(),
	series: z.object({ name: z.string(), position: z.number() }).optional(),
	imgSm: z.string().optional(),
	imgSmGif: z.string().optional(),
	imgLg: z.string().optional(),
	featured: z.boolean().optional(),
});

export const loadedFrontMatter = rawFrontMatterSchema.extend({
	/** Relative to $lib/articles */
	articleSlug: z.string(),
});

export const processedFrontMatter = loadedFrontMatter.extend({
	series: expandedSeries.optional(),
	prev: z.object({ slug: z.string(), title: z.string() }).nullable(),
	next: z.object({ slug: z.string(), title: z.string() }).nullable(),
});

export type RawFrontMatter = z.infer<typeof rawFrontMatterSchema>;
export type LoadedFrontMatter = z.infer<typeof loadedFrontMatter>;
export type ProcessedFrontMatter = z.infer<typeof processedFrontMatter>;
