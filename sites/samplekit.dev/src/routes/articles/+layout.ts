import { merge } from '$lib/articles/load';
import { processedComponentsMap } from '$lib/articles/load/demos/client';
import type { ArticleSlug } from '$lib/articles/load';
import type { ClientFrontMatter } from '$lib/articles/schema';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url, data: serverData }) => {
	const slug = url.pathname.split('/').pop()! as ArticleSlug;
	const article: ClientFrontMatter = {
		...serverData.article,
		demos: merge({ code: serverData.article.demos, components: processedComponentsMap[slug] }),
	};

	const meta: App.PageData['meta'] = {
		title: article.title,
		description: article.description,
		ogType: 'article',
	};

	if (article.imgLg) {
		meta.ogImage = article.imgLg;
		meta.twitterImage = article.imgLg;
	}

	return { article };
};
