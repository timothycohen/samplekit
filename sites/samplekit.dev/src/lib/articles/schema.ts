import { z } from 'zod';
import type { CodeProcessedEager, CodeProcessedLazy, ComponentProcessedEager, ComponentProcessedLazy } from './load';
import type { LayoutRouteId } from '../../routes/articles/$types';

export type ArticlePath = Exclude<LayoutRouteId, '/articles'>;
const articlePaths = Object.keys(import.meta.glob('/src/routes/articles/**/+page.svelte')).map((s) =>
	s.replace('/src/routes', '').replace('/+page.svelte', ''),
) as ArticlePath[];
export const articlePathSchema = z.custom<ArticlePath>((val) => articlePaths.includes(val));

export const readingSchema = z.object({ readingTime: z.number(), wordCount: z.number() });
export type ReadingTime = z.infer<typeof readingSchema>;

const baseTocSchema = z.object({ title: z.string(), href: z.string() });
export type TocItem = z.infer<typeof baseTocSchema> & { children?: TocItem[] };
const tocSchema: z.ZodType<TocItem> = baseTocSchema.extend({
	children: z.lazy(() => tocSchema.array().optional()),
});

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
	finalPublishDate: z.date({ coerce: true }),
	all: z.array(
		z.object({
			title: z.string(),
			articlePath: z.string(),
			position: z.number(),
			publishedAt: z.date({ coerce: true }),
		}),
	),
});
export type ExpandedSeries = z.infer<typeof expandedSeries>;

/** what is defined in the `+page.svelte` script module */
export const rawFrontMatterSchema = z.object({
	title: z.string(),
	/** Relative link on this website */
	implementationPath: z.string(),
	/** GitHub */
	srcCodeHref: z.string(),
	description: z.string(),
	publishedAt: z.date({ coerce: true }),
	authors: z.array(authorSchema),

	imgSm: z.string().optional(),
	imgLg: z.string().optional(),
	video: z.string().optional(),
	tags: z.array(z.string()).optional().nullable().readonly(),
	featured: z.boolean().optional(),
	series: z.object({ name: z.string(), position: z.number() }).optional(),
	updates: z.array(z.object({ at: z.date({ coerce: true }), descriptions: z.array(z.string()) })).optional(),
});
export type RawFrontMatter = z.infer<typeof rawFrontMatterSchema>;

/**
 * loaded from articleDir/generated/metadata.ts.
 * if it doesn't exist or is different from the cache, it's generated on page load (dev only)
 * */
export const loadedFrontMatter = rawFrontMatterSchema.extend({
	/** Relative link on this website */
	articlePath: articlePathSchema,
	wordCount: z.number(),
	readingTime: z.number(),
	toc: z.array(tocSchema),
});
export type LoadedFrontMatter = z.infer<typeof loadedFrontMatter>;

/** checks if the article is part of a series and adds prev/next links */
export const processedFrontMatter = loadedFrontMatter.extend({
	series: expandedSeries.optional(),
	prev: loadedFrontMatter.optional(),
	next: loadedFrontMatter.optional(),
});
export type ProcessedFrontMatter = z.infer<typeof processedFrontMatter>;

export type MetaRawComponents = Record<
	`${string}${'.svelte'}`,
	{ bg?: true; center?: true; noBorder?: true; noPadding?: true; title?: string }
>;
export type MetaProcessedComponents = MetaRawComponents[keyof MetaRawComponents] & { title: string };

export type MetaRawCode = { modules: Array<{ rawCodePromise: () => Promise<string>; title: string }> };

export type ServerFrontMatter = ProcessedFrontMatter & {
	demos?: {
		main?: CodeProcessedEager[] | undefined;
		lazy?: Record<string, CodeProcessedLazy[]> | undefined;
	};
};
export type ClientFrontMatter = ProcessedFrontMatter & {
	demos?: {
		main?: (CodeProcessedEager | ComponentProcessedEager)[];
		lazy?: Record<string, (CodeProcessedLazy | ComponentProcessedLazy)[]>;
	};
};
