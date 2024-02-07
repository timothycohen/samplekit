import { z } from 'zod';

export const authorSchema = z.object({
	name: z.string(),
	title: z.string().optional(),
	email: z.string().optional(),
	link: z.string().optional(),
	avatarUrl: z.string().optional(),
});

export type Author = z.infer<typeof authorSchema>;

export const frontmatterSchema = z.object({
	/** Relative to $lib/articles */
	articleSlug: z.string(),
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

export type FrontMatter = z.infer<typeof frontmatterSchema>;
