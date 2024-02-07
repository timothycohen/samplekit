import { error } from '@sveltejs/kit';
import { allPostData, type ArticleSlug } from '$lib/articles/load';
import { demoCodeMap } from '$lib/articles/load/server';
import type { ServerFrontMatter } from '$lib/articles/schema';
import type { LayoutServerLoad } from './$types';

/**
 * Sort Order:
 * Demo.svelte
 * folder depth
 * alphabetic svelte files
 * alphabetic ts files
 * alphabetic extensions
 * alphabetic file name
 */
const sortInPlace = <T extends { title: string }>(hasTitle: T[]): T[] =>
	hasTitle.sort((a, b) => {
		if (a.title === 'Demo.svelte') return -1;
		else if (b.title === 'Demo.svelte') return 1;

		const extensionA = a.title.split('.').pop()!;
		const extensionB = b.title.split('.').pop()!;

		const depthA = a.title.split('/').length;
		const depthB = b.title.split('/').length;

		if (depthA !== depthB) return depthA < depthB ? -1 : 1;

		if (extensionA === extensionB) return a.title < b.title ? -1 : 1;

		if (extensionA === 'svelte') return -1;
		if (extensionB === 'svelte') return 1;

		if (extensionA === 'ts') return -1;
		if (extensionB === 'ts') return 1;

		return `${extensionA}${a.title}` < `${extensionB}${b.title}` ? -1 : 1;
	});

export const load: LayoutServerLoad = async ({ url }): Promise<{ article: ServerFrontMatter }> => {
	const slug = url.pathname.split('/').pop()! as ArticleSlug;
	const frontMatter = allPostData.find((p) => p.articleSlug === slug);
	if (!frontMatter) return error(404, `Article not found`);

	const demos = demoCodeMap[slug];
	if (!demos) return { article: frontMatter };

	const article: ServerFrontMatter = frontMatter;
	const { main, ...lazy } = Object.entries(demos).reduce<NonNullable<ServerFrontMatter['lazyDemos']>>(
		(acc, [demoName, demoModulesCode]) => {
			acc[demoName] = {
				highlightedFiles: sortInPlace(
					demoModulesCode.map(({ filename: title, highlightedRawHTML: rawHTML }) => ({ title, rawHTML })),
				),
			};
			return acc;
		},
		{},
	);

	if (main) {
		article.mainDemo = {
			highlightedFiles: await Promise.all(
				main.highlightedFiles.map(async ({ title, rawHTML }) => ({ title, rawHTML: await rawHTML })),
			),
		};
	}

	if (Object.keys(lazy).length) {
		article.lazyDemos = lazy;
	}

	return { article };
};
