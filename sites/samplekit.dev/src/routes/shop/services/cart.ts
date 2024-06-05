import { createDialog } from '@melt-ui/svelte';
import { derived, get, writable, type Readable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import { page } from '$app/stores';
page; // https://github.com/sveltejs/eslint-plugin-svelte/issues/652#issuecomment-2087008855
import { defineContext } from '$lib/utils/client';
import { getCartItems, removeCartItem, updateCartItemQty, addCartItem } from '$routes/shop/cart.json';
import { handleToPath, type CartWithPaths, DEFAULT_SELECTED_OPTION } from '$routes/shop/utils';

const [getService, setService] = defineContext<{
	cart: Writable<CartWithPaths | null> & { refresh: () => Promise<{ error?: App.JSONError }> };
	drawerProps: ReturnType<typeof createDialog>;
	addingCartItem: ReturnType<typeof addCartItem>;
	gettingCartItems: ReturnType<typeof getCartItems>;
	updatingCartItemQty: ReturnType<typeof updateCartItemQty>;
	removingCartItem: ReturnType<typeof removeCartItem>;
	pending: Readable<boolean>;
}>();

const createCartService = () => {
	const cart = writable<CartWithPaths | null>(null) as Writable<CartWithPaths | null> & {
		refresh: () => Promise<{ error?: App.JSONError }>;
	};
	const drawerProps = createDialog({ forceVisible: true });
	const addingCartItem = addCartItem();
	const gettingCartItems = getCartItems();
	const updatingCartItemQty = updateCartItemQty();
	const removingCartItem = removeCartItem();
	const pending = derived(
		[addingCartItem, gettingCartItems, updatingCartItemQty, removingCartItem],
		([$addingCartItem, $gettingCartItems, $updatingCartItemQty, $removingCartItem]) =>
			$addingCartItem || $gettingCartItems || $updatingCartItemQty || $removingCartItem,
	);

	cart.refresh = async () => {
		if (!browser) return {};

		return gettingCartItems.send().then((res) => {
			if (res.error) return { error: res.error };

			res.data.cart.lines = (res.data.cart as CartWithPaths).lines.map((l) => {
				const lineParams = new URL(
					get(page).url.origin + handleToPath({ handle: l.merchandise.product.handle, kind: 'product' }),
				);
				l.merchandise.selectedOptions.forEach(({ name, value }) => {
					if (value !== DEFAULT_SELECTED_OPTION) {
						lineParams.searchParams.set(name.toLowerCase(), value.toLowerCase());
					}
				});
				l.path = lineParams.href;
				return l;
			});

			cart.set(res.data.cart as CartWithPaths);
			return {};
		});
	};

	cart.refresh();

	setService({ cart, drawerProps, addingCartItem, gettingCartItems, updatingCartItemQty, removingCartItem, pending });
};

export { createCartService, getService as useCartService };
