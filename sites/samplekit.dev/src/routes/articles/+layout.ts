import { demoComponentMap } from '$lib/articles/load/client';
import {
	addMetaComponentsDefaults,
	isSvelteFile,
	type ArticleSlug,
	demoMetaComponentsMap,
} from '$lib/articles/load/common';
import type { ClientFrontMatter, MetaProcessedComponents } from '$lib/articles/schema';
import type { NoPropComponent } from '$lib/utils/common';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url, data: serverData }): Promise<{ article: ClientFrontMatter }> => {
	const slug = url.pathname.split('/').pop()! as ArticleSlug;
	const { mainDemo, lazyDemos, ...rest } = serverData.article;
	const article: ClientFrontMatter = rest;

	if (!mainDemo && !lazyDemos) return { article };

	if (mainDemo) {
		const demoName = 'main';
		const highlightedFiles = mainDemo.highlightedFiles;
		const components = demoComponentMap[slug]?.[demoName] ?? {};
		if (!Object.keys(components).length) {
			article.mainDemo = { highlightedFiles };
		} else {
			const meta = demoMetaComponentsMap[slug]?.[demoName];

			const promises = {
				highlightedFiles: highlightedFiles,
				renderables: highlightedFiles.reduce<
					Array<{ meta: MetaProcessedComponents; component: Promise<NoPropComponent> }>
				>((acc, file) => {
					if (!isSvelteFile(file.title)) return acc;
					const component = components[file.title];
					if (!component) return acc;
					acc.push({ component, meta: addMetaComponentsDefaults(meta?.[file.title]) });
					return acc;
				}, []),
			};

			article.mainDemo = {
				highlightedFiles: promises.highlightedFiles,
				renderables: await Promise.all(
					promises.renderables.map(async ({ component, meta }) => ({ component: await component, meta })),
				),
			};
		}
	}

	if (lazyDemos) {
		article.lazyDemos = Object.entries(lazyDemos).reduce<NonNullable<ClientFrontMatter['lazyDemos']>>(
			(acc, [demoName, { highlightedFiles }]) => {
				const components = demoComponentMap[slug]?.[demoName] ?? {};
				if (!Object.keys(components).length) {
					acc[demoName] = { highlightedFiles };
				} else {
					const meta = demoMetaComponentsMap[slug]?.[demoName];

					const promises = {
						highlightedFiles: highlightedFiles,
						renderables: highlightedFiles.reduce<
							Array<{ meta: MetaProcessedComponents; component: Promise<NoPropComponent> }>
						>((acc, file) => {
							if (!isSvelteFile(file.title)) return acc;
							const component = components[file.title];
							if (!component) return acc;
							acc.push({ component, meta: addMetaComponentsDefaults(meta?.[file.title]) });
							return acc;
						}, []),
					};
					acc[demoName] = promises;
				}

				return acc;
			},
			{},
		);
	}

	return { article };
};
