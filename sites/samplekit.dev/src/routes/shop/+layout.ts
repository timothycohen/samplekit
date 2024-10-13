import { PUBLIC_SHOPIFY_STORE_DOMAIN } from '$env/static/public';
import { shop } from '$lib/shop';
import { handleToPath, type CollectionWithPath, type MenuWithPath } from '$routes/shop/utils';

export const load = async ({ fetch }) => {
	const menu: MenuWithPath = (await shop.menu.get({ handle: 'main-menu', fetch })).map((item) => ({
		title: item.title,
		path: (item.url ?? '/shop').replace(PUBLIC_SHOPIFY_STORE_DOMAIN, '/shop'),
	}));

	const collections: CollectionWithPath = (await shop.collection.getAll({ fetch })).map((c) => ({
		...c,
		path: handleToPath({ handle: c.handle, kind: 'collection' }),
	}));

	return { menu, collections, layout: { showFooter: false, showHeader: false } };
};
