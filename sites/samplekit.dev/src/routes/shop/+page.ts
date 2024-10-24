import { shop } from '$lib/shop';

export const load = async ({ fetch }) => {
	const [homepageProducts, marqueeProducts] = await Promise.all([
		shop.product.getByCollection({ collectionHandle: 'frontpage', filters: {}, fetch }),
		shop.product.getAll({ filters: {}, fetch }),
	]);

	return { homepageProducts, marqueeProducts };
};
