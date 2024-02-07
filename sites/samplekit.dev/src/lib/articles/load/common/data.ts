import {
	rawFrontMatterSchema,
	type ProcessedFrontMatter,
	type RawFrontMatter,
	type LoadedFrontMatter,
} from '$lib/articles/schema';
import type { ArticleSlug } from './types';

/** @throws Error */
const postData: Record<string, Promise<LoadedFrontMatter>> = (() => {
	const dataModules = Object.entries(import.meta.glob('/src/routes/articles/**/meta.data.ts')) as [
		string,
		() => Promise<{ default: RawFrontMatter }>,
	][];

	return dataModules.reduce<Record<string, Promise<LoadedFrontMatter>>>((acc, [url, load]) => {
		const a = url.replace('/src/routes/articles/', '').split('/');
		const slug = a.splice(0, 2)[0]! as ArticleSlug;
		const frontMatter = load()
			.then((loaded) => loaded.default)
			.then((rawData) => {
				const validated = rawFrontMatterSchema.safeParse({ ...rawData });
				if (validated.success) return { ...validated.data, articleSlug: slug };
				console.error(validated.error.errors);
				throw new Error(`Error reading frontmatter for \`${slug}\`. Skipping...`);
			});
		acc[slug] = frontMatter;
		return acc;
	}, {});
})();

const expandSeries = <
	T extends { title: string; articleSlug: string; publishedAt: Date; series?: { name: string; position: number } },
>(
	frontMatter: T[],
): (T & {
	series?: T['series'] & {
		finalPublishDate: Date;
		all: { title: string; articleSlug: string; position: number; publishedAt: Date }[];
	};
})[] => {
	const seriesMap = new Map<string, { title: string; articleSlug: string; position: number; publishedAt: Date }[]>();

	frontMatter.forEach((fm) => {
		if (fm.series) {
			const arr = seriesMap.get(fm.series.name) ?? [];
			arr.push({
				title: fm.title,
				articleSlug: fm.articleSlug,
				position: fm.series.position,
				publishedAt: fm.publishedAt,
			});
			seriesMap.set(fm.series.name, arr);
		}
	});

	const series = [...seriesMap.entries()].map(([name, all]) => {
		const finalPublishedDate = all.reduce(
			(acc, curr) => (curr.publishedAt > acc ? curr.publishedAt : acc),
			new Date(0),
		);
		all.sort((a, b) => a.position - b.position);
		return { name, all, finalPublishedDate };
	});

	// @ts-expect-error - spreading in the series
	return frontMatter.map((fm) => {
		if (fm.series) {
			const s = series.find(({ name }) => name === fm.series!.name) ?? [];
			fm.series = { ...fm.series, ...s };
		}
		return fm;
	});
};

const sort = <T extends { publishedAt: Date; series?: { name: string; position: number; finalPublishDate: Date } }>(
	parsed: T[],
	method: 'date' | 'series',
): T[] => {
	if (method === 'date') return parsed.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

	return parsed.sort((a, b) => {
		if (a.series && b.series) {
			if (a.series.name === b.series.name) {
				return b.series.position - a.series.position;
			}
		}
		return (
			(b.series?.finalPublishDate ?? b.publishedAt).getTime() - (a.series?.finalPublishDate ?? a.publishedAt).getTime()
		);
	});
};

function addPrevNextLinks<T extends { articleSlug: string; title: string }>(
	parsed: T[],
): (T & { prev: { slug: string; title: string } | null; next: { slug: string; title: string } | null })[] {
	type Neighbor = { slug: string; title: string } | null;

	return parsed.map((data, i) => {
		const nextFM = parsed[i - 1];
		const prevFM = parsed[i + 1];

		const prev: Neighbor = prevFM ? { slug: prevFM.articleSlug, title: prevFM.title } : null;
		const next: Neighbor = nextFM ? { slug: nextFM.articleSlug, title: nextFM.title } : null;
		return { ...data, prev, next };
	});
}

/**
 * .svx files are first processed by transforming markdown code and tables into valid html – see svelte.config.js
 *
 * in articles/load/common, all meta.article/*\/data.ts files are imported and transformed from RawFrontMatter into ProcessedFrontMatter
 *
 * in articles/load/server, all article/*\live-demo/* files are imported as raw strings, wrapped in small markdown code blocks, and passed to the markdown preprocessor to highlight and transform back into html
 *
 * in articles/load/client, all article/*\live-demo/Demo.svelte files are imported as modules, loaded and mapped to .default (the component).
 *
 * in articles/[some-article-slug], the LayoutServerLoad awaits the highlighter promises and passes the data to the client LayoutLoad
 *
 * finally, the LayoutLoad adds the LiveDemoComponent to the LayoutServerLoad data and passes it all the to TabPanels.svelte in +layout.svelte
 */
export const allPostData: ProcessedFrontMatter[] = await Promise.all(Object.values(postData))
	.then(expandSeries)
	.then(addPrevNextLinks)
	.then((fm) => sort(fm, 'date'));
