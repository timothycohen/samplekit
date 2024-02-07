import { error } from '@sveltejs/kit';
import { allPostData, type ArticleSlug } from '$lib/articles/load';
import { processedCodeMap, resolveMainPromise } from '$lib/articles/load/demos/server';
import { type ServerFrontMatter } from '$lib/articles/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
	const slug = url.pathname.split('/').pop()! as ArticleSlug;

	const frontMatter = allPostData.find((p) => p.articleSlug === slug);
	if (!frontMatter) return error(404, `Article not found`);

	const article: ServerFrontMatter = frontMatter;
	const demos = processedCodeMap[slug];
	if (demos?.main) demos.main = await resolveMainPromise(demos.main);
	if (demos) article.demos = demos;
	return { article };
};
