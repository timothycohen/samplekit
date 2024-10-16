import { get } from 'svelte/store';
import { page } from '$app/stores';
import { defineCtx } from '$lib/context';
import {
	getCartItems as getItems,
	removeCartItem as removeItem,
	updateCartItemQty as updateItemQty,
	addCartItem as addItem,
} from '$routes/shop/cart.json';
import { handleToPath, type CartWithPaths, DEFAULT_SELECTED_OPTION } from '$routes/shop/utils';

const [getCtx, setCtx] = defineCtx<{
	value: CartWithPaths | null;
	drawer: boolean;
	addItem: typeof addItem;
	getItems: typeof getItems;
	updateItemQty: typeof updateItemQty;
	removeItem: typeof removeItem;
	submitting: boolean;
	refresh: () => Promise<{ error?: App.JSONError }>;
}>();

const createCartCtx = () => {
	const submitting = $derived(
		addItem.submitting || getItems.submitting || updateItemQty.submitting || removeItem.submitting,
	);

	let value = $state(null) as CartWithPaths | null;
	let drawer = $state(false);

	const refresh: () => Promise<{ error?: App.JSONError }> = async () => {
		return getItems.send().then((res) => {
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

			value = res.data.cart as CartWithPaths;
			return {};
		});
	};

	const cart = {
		get value() {
			return value;
		},
		get drawer() {
			return drawer;
		},
		set drawer(value) {
			drawer = value;
		},
		addItem,
		getItems,
		updateItemQty,
		removeItem,
		get submitting() {
			return submitting;
		},
		refresh,
	};

	cart.refresh();

	setCtx(cart);
};

export { createCartCtx, getCtx as useCartCtx };
