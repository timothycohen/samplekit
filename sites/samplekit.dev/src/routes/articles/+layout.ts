import { merge } from '$lib/articles/load';
import { processedComponentsMap } from '$lib/articles/load/demos/client';
import type { ClientFrontMatter } from '$lib/articles/schemas';
import type { LayoutRouteId } from './$types';

export const load = async ({ route, data: serverData }) => {
	const articlePath = route.id as Exclude<LayoutRouteId, '/articles'>;

	const article: ClientFrontMatter = {
		...serverData.article,
		demos: await merge({ code: serverData.article.demos, components: processedComponentsMap[articlePath] }),
	};

	const meta: App.PageData['meta'] = {
		title: `${article.title} | SampleKit`,
		description: article.description,
		ogType: 'article',
	};

	if (article.imgLg) {
		meta.ogImage = article.imgLg;
		meta.twitterImage = article.imgLg;
	}

	return { article, meta };
};
