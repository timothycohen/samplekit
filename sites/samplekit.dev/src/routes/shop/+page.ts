import { getCollectionProducts, getProducts } from '$lib/shop';

export const load = async () => {
	const [homepageProducts, marqueeProducts] = await Promise.all([getCollectionProducts('frontpage'), getProducts()]);

	return { homepageProducts, marqueeProducts };
};
