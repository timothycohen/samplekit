import { error } from '@sveltejs/kit';
import { getProduct, getProductRecommendations } from '$lib/shop';

export const load = async ({ params }) => {
	const { handle } = params;

	const product = await getProduct({ handle });
	if (!product) return error(404, 'Product not found');

	const relatedProducts = await getProductRecommendations(product.id);

	return { product, relatedProducts };
};
