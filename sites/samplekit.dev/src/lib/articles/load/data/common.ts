import { dev } from '$app/environment';
import { loadedFrontMatter } from '$lib/articles/schema';
import { logger } from '$lib/logging/client';
import type { ProcessedFrontMatter, LoadedFrontMatter, ArticlePath } from '$lib/articles/schema';
import type { Component } from 'svelte';

const dummyData = (articlePath: ArticlePath): LoadedFrontMatter => ({
	articlePath,
	wordCount: 1,
	readingTime: 1,
	toc: [],
	title: '',
	implementationPath: '',
	srcCodeHref: '',
	description: '',
	publishedAt: new Date(),
	authors: [],
});

const loadMetadata = (): Record<ArticlePath, LoadedFrontMatter> => {
	const files = import.meta.glob('/src/routes/articles/**/generated/metadata.ts', {
		eager: true,
	}) as Record<string, { default: unknown }>;
	const res = {} as Record<ArticlePath, LoadedFrontMatter>;

	const articlePaths = Object.keys(import.meta.glob('/src/routes/articles/**/+page.svelte')).map((s) =>
		s.replace('/src/routes', '').replace('/+page.svelte', ''),
	) as ArticlePath[];

	for (const path of articlePaths) {
		const metadataPath = '/src/routes' + path + '/generated/metadata.ts';
		const metadata = files[metadataPath]?.default;
		if (!metadata) {
			res[path] = dummyData(path);
			if (dev) logger.warn(`Missing metadata for \`${metadataPath}\``);
			continue;
		}
		const parsed = loadedFrontMatter.safeParse(metadata);
		if (!parsed.success) {
			res[path] = dummyData(path);
			logger.error(`Malformed metadata for \`${metadataPath}\``);
			continue;
		}
		res[path] = parsed.data;
	}

	return res;
};

const loadCardComponents = (): Record<ArticlePath, Component<{ metadata: LoadedFrontMatter }>> => {
	return (
		Object.entries(import.meta.glob('/src/routes/articles/**/FeatureCard.svelte', { eager: true })) as [
			string,
			{ default: Component<{ metadata: LoadedFrontMatter }> },
		][]
	).reduce(
		(acc, [url, { default: component }]) => {
			const articlePath = url.replace('/src/routes', '').replace('/FeatureCard.svelte', '') as ArticlePath;
			acc[articlePath] = component;
			return acc;
		},
		{} as Record<ArticlePath, Component<{ metadata: LoadedFrontMatter }>>,
	);
};

const expandSeries = <
	T extends { title: string; articlePath: string; publishedAt: Date; series?: { name: string; position: number } },
>(
	frontMatter: T[],
): (T & {
	series?: T['series'] & {
		finalPublishDate: Date;
		all: { title: string; articlePath: string; position: number; publishedAt: Date }[];
	};
})[] => {
	const seriesMap = new Map<string, { title: string; articlePath: string; position: number; publishedAt: Date }[]>();

	frontMatter.forEach((fm) => {
		if (fm.series) {
			const arr = seriesMap.get(fm.series.name) ?? [];
			arr.push({
				title: fm.title,
				articlePath: fm.articlePath,
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

const addPrevNextLinks = <T extends { articlePath: string; title: string }>(
	parsed: T[],
): (T & { prev: T | undefined; next: T | undefined })[] =>
	parsed.map((data, i) => ({ ...data, prev: parsed[i - 1], next: parsed[i + 1] }));

const metadata = loadMetadata();
const cardComponents = loadCardComponents();

export const allPostData: ProcessedFrontMatter[] = await Promise.all(Object.values(metadata))
	.then(expandSeries)
	.then(addPrevNextLinks)
	.then((fm) => sort(fm, 'date'));

export type FeatureCard = { metadata: ProcessedFrontMatter; FeatureCard: Component<{ metadata: LoadedFrontMatter }> };

export const featureCards = allPostData.reduce<FeatureCard[]>((acc, metadata) => {
	const FeatureCard = cardComponents[metadata.articlePath];
	if (!FeatureCard) {
		if (dev) logger.warn(`Missing card component for \`${metadata.articlePath}\``);
		return acc;
	}
	return [...acc, { metadata, FeatureCard }];
}, []);
