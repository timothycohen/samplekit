import { error } from '@sveltejs/kit';
import { getProduct, getProductRecommendations } from '$lib/shop';

export const load = async ({ params, fetch }) => {
	const { handle } = params;

	const product = await getProduct({ handle, fetch });
	if (!product) return error(404, 'Product not found');

	const relatedProducts = await getProductRecommendations({ productId: product.id, fetch });

	return { product, relatedProducts };
};
