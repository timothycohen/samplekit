import { error } from '@sveltejs/kit';
import { allPostData } from '$lib/articles/load';
import type { ProcessedFrontMatter } from '$lib/articles/schema';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }): Promise<{ article: ProcessedFrontMatter }> => {
	const slug = url.pathname.split('/').pop()!;
	const article = allPostData.find((p) => p.articleSlug === slug);
	if (!article) return error(404, `Article not found`);
	return { article };
};
