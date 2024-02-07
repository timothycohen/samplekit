import { addMetaDefaults, demoComponentMap, demoMetaMap } from '$lib/articles/load/client';
import type { ArticleSlug } from '$lib/articles/load/common';
import type { ClientFrontMatter } from '$lib/articles/schema';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url, data: serverData }): Promise<{ article: ClientFrontMatter }> => {
	const slug = url.pathname.split('/').pop()! as ArticleSlug;
	const { mainDemo, lazyDemos, ...rest } = serverData.article;
	const article: ClientFrontMatter = rest;

	if (!mainDemo && !lazyDemos) return { article };

	if (mainDemo) {
		const demoName = 'main';
		const highlightedFiles = mainDemo.highlightedFiles;
		const component = await demoComponentMap[slug]?.[demoName];
		if (!component) {
			article.mainDemo = { highlightedFiles };
		} else {
			const meta = demoMetaMap[slug]?.[demoName];
			article.mainDemo = { highlightedFiles, renderable: { component, meta: addMetaDefaults(meta) } };
		}
	}

	if (lazyDemos) {
		article.lazyDemos = Object.entries(lazyDemos).reduce<NonNullable<ClientFrontMatter['lazyDemos']>>(
			(acc, [demoName, { highlightedFiles }]) => {
				const component = demoComponentMap[slug]?.[demoName];
				if (!component) {
					acc[demoName] = { highlightedFiles };
				} else {
					const meta = demoMetaMap[slug]?.[demoName];
					acc[demoName] = { highlightedFiles, renderable: { component, meta: addMetaDefaults(meta) } };
				}
				return acc;
			},
			{},
		);
	}

	return { article };
};
