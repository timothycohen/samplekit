import { error } from '@sveltejs/kit';
import { shop } from '$lib/shop';

export const load = async ({ params, fetch }) => {
	const { handle } = params;

	const product = await shop.product.get({ handle, fetch });
	if (!product) return error(404, 'Product not found');

	const relatedProducts = await shop.product.getRecommendations({ productId: product.id, fetch });

	return { product, relatedProducts };
};
