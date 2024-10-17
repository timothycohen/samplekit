import { PUBLIC_SHOPIFY_STORE_DOMAIN } from '$env/static/public';
import { shop, handleToPath, type Collection } from '$lib/shop';

export const load = async ({ fetch }) => {
	const menu: { title: string; path: string }[] = (await shop.menu.get({ handle: 'main-menu', fetch })).map((item) => ({
		title: item.title,
		path: (item.url ?? '/shop').replace(PUBLIC_SHOPIFY_STORE_DOMAIN, '/shop'),
	}));

	const collections: Array<Collection & { path: string }> = (await shop.collection.getAll({ fetch })).map((c) => ({
		...c,
		path: handleToPath({ handle: c.handle, kind: 'collection' }),
	}));

	return { menu, collections, layout: { showFooter: false, showHeader: false } };
};
