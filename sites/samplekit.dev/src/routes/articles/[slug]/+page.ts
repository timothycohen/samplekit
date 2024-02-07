import { error } from '@sveltejs/kit';
import { getPublishedPost } from '$lib/articles/load';

export async function load({ params }) {
	const article = await getPublishedPost(params.slug);
	if (!article) return error(404, `Article not found`);
	return { article };
}
