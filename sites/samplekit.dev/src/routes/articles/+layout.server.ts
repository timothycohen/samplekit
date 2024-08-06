import { error } from '@sveltejs/kit';
import { allPostData } from '$lib/articles/load';
import { processedCodeMap, resolveMainPromise } from '$lib/articles/load/demos/server';
import { type ServerFrontMatter } from '$lib/articles/schema';
import type { LayoutRouteId, LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ route }) => {
	const articlePath = route.id as Exclude<LayoutRouteId, '/articles'>;

	const frontMatter = allPostData.find((p) => p.articlePath === articlePath);
	if (!frontMatter) return error(404, `Article not found`);

	const article: ServerFrontMatter = frontMatter;
	const demos = processedCodeMap[articlePath];
	if (demos?.main) demos.main = await resolveMainPromise(demos.main);
	if (demos) article.demos = demos;
	return { article };
};
