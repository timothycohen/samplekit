import { error } from '@sveltejs/kit';
import { shop, parseSearchAndFilterParams } from '$lib/shop';

export const load = async ({ params, url, fetch }) => {
	const { collectionHandle } = params;
	const filters = parseSearchAndFilterParams(url.searchParams);

	if (collectionHandle === 'all') return { products: await shop.product.getAll({ filters, fetch }) };

	// https://shopify.dev/docs/api/storefront/2024-10/objects/Collection#connection-collection-products
	// collection().products doesn't support title search

	// https://shopify.dev/docs/api/storefront/2024-10/queries/products#query-arguments
	// products() doesn't support collection

	// https://shopify.dev/docs/api/storefront/2024-10/queries/search
	// search() doesn't support collection

	// This calls collection() and filters with JS afterwards, which would affect the $first count if we had enough products for it to matter
	// The alternative is to call query.set(value, { root: handleToPath({ handle: 'all', kind: 'collection' }) }) so products() via getProducts(filters) is called
	// This would mean it's no longer in the collection (user is redirected to all page) but the count and pagination would be easier
	const products = await shop.product.getByCollection({ collectionHandle, filters, fetch });
	if (!products) return error(404, 'Collection not found');

	return { products };
};
