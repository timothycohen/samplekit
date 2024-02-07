import { frontmatterSchema, type FrontMatter } from '../schema';

const getPublishedPostData = async (): Promise<Array<FrontMatter>> => {
	let modules;
	try {
		modules = Object.entries(import.meta.glob('./**/data.ts'));
	} catch {
		console.error('Error reading posts directory. Skipping...');
		return [];
	}

	const maybePosts = await Promise.all(
		modules.map(async ([path, load]) => {
			const rawData = ((await load()) as { default: FrontMatter })?.default ?? {};
			rawData.articleSlug = path.split('/')[1]!;
			const validated = frontmatterSchema.safeParse(rawData);
			if (validated.success) return validated.data;
			console.error(`Error reading frontmatter for \`${path}\`. Skipping...`);
			console.error(validated.error.errors);
			return null;
		}),
	);

	return maybePosts
		.filter((p): p is FrontMatter => p !== null)
		.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
};

type Neighbor = { slug: string; title: string } | null;

function addPrevNext(sortedParsed: FrontMatter[]) {
	return sortedParsed.map((data, i) => {
		const prevFM = sortedParsed[i - 1];
		const nextFM = sortedParsed[i + 1];

		const prev: Neighbor = prevFM ? { slug: prevFM.articleSlug, title: prevFM.title } : null;
		const next: Neighbor = nextFM ? { slug: nextFM.articleSlug, title: nextFM.title } : null;
		return { ...data, prev, next };
	});
}

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

export const allPostData = await getPublishedPostData().then(addPrevNext).then(expandSeries);

const modules = import.meta.glob('./**/+page.svx', { eager: true }) as Record<string, typeof import('./post.svx')>;

export const getPublishedPost = async (slug: string) => {
	const data = allPostData.find((p) => p.articleSlug === slug);
	if (!data) return null;
	try {
		const module = modules[`./${slug}/+page.svx`];
		if (!module) throw new Error('module not found');
		return { data, readingTime: module.metadata.readingTime, component: module.default };
	} catch (e) {
		console.log(`unable to load article ${slug}`);
		return null;
	}
};
