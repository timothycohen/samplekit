import type { Cart, CartItem, Collection } from '$lib/shop';

export const handleToPath = ({ handle, kind }: { handle: string; kind: 'collection' | 'product' }) => {
	switch (kind) {
		case 'collection':
			return `/shop/collections/${handle}`;
		case 'product':
			return `/shop/product/${handle}`;
	}
};

export const formatPrice = ({ amount, currencyCode }: { amount: string; currencyCode: string }) => {
	return new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: currencyCode,
		currencyDisplay: 'narrowSymbol',
	}).format(parseFloat(amount));
};

export type CollectionWithPath = Array<Collection & { path: string }>;
export type MenuWithPath = { title: string; path: string }[];
export type CartWithPaths = Omit<Cart, 'lines'> & { lines: Array<CartItem & { path: string }> };
export type ProductOptionWithAvailableForSale = {
	id: string;
	name: string;
	clean: string;
	values: { name: string; clean: string; available: boolean }[];
};

export const DEFAULT_SELECTED_OPTION = 'Default Title';
