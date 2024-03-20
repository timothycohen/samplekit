import { getCollectionProducts, getProducts } from '$lib/shop';

export const load = async ({ fetch }) => {
	const [homepageProducts, marqueeProducts] = await Promise.all([
		getCollectionProducts({ collectionHandle: 'frontpage', filters: {}, fetch }),
		getProducts({ filters: {}, fetch }),
	]);

	return { homepageProducts, marqueeProducts };
};
