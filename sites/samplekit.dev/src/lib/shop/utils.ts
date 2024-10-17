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

export const DEFAULT_SELECTED_PRODUCT_VARIANT = 'Default Title';
