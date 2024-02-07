import { error } from '@sveltejs/kit';
import { allPostData, demoMetaComponentsMap, type ArticleSlug } from '$lib/articles/load';
import { demoCodeMap } from '$lib/articles/load/server';
import { defaultMetaRawComponents, type DemoLazyServer, type ServerFrontMatter } from '$lib/articles/schema';
import type { LayoutServerLoad } from './$types';

/**
 * Sort Order:
 * The rendered components
 * folder depth
 * alphabetic svelte files
 * alphabetic ts files
 * alphabetic extensions
 * alphabetic file name
 */
const sortInPlace = <T extends { title: string; renderIndex: number }>(hasTitle: T[]): T[] =>
	hasTitle.sort((a, b) => {
		if (a.renderIndex >= 0 && b.renderIndex >= 0) {
			return a.renderIndex - b.renderIndex;
		}
		if (a.renderIndex >= 0 || b.renderIndex >= 0) {
			return b.renderIndex - a.renderIndex;
		}

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
	const article: ServerFrontMatter = { ...frontMatter, lazyDemos: {} };

	const demos = demoCodeMap[slug];
	if (!demos) return { article };

	const { main, lazy } = Object.entries(demos).reduce<{
		main: DemoLazyServer;
		lazy: Record<string, DemoLazyServer>;
	}>(
		(acc, [demoName, demoModulesCode]) => {
			const svelteFileNames = Object.keys(demoMetaComponentsMap[slug]?.[demoName] ?? defaultMetaRawComponents);

			const highlightedFiles = sortInPlace(
				demoModulesCode.map(({ filename, highlightedRawHTML }) => ({
					title: filename,
					rawHTML: highlightedRawHTML,
					renderIndex: svelteFileNames.indexOf(filename),
				})),
			);
			if (demoName === 'main') acc.main = { highlightedFiles };
			else acc.lazy[demoName] = { highlightedFiles };
			return acc;
		},
		{ main: { highlightedFiles: [] }, lazy: {} },
	);

	if (main.highlightedFiles.length) {
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
