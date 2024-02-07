export type Money = {
	amount: string;
	currencyCode: string;
};

export type SEO = {
	title?: string | null;
	description?: string | null;
};

export type Image = {
	url: string;
	altText?: string | null;
	width?: number | null;
	height?: number | null;
};

export type ProductOption = {
	id: string;
	name: string;
	values: string[];
};

export type ProductVariant = {
	id: string;
	title: string;
	availableForSale: boolean;
	selectedOptions: {
		name: string;
		value: string;
	}[];
	price: Money;
};

export type Product = {
	id: string;
	handle: string;
	availableForSale: boolean;
	title: string;
	description: string;
	descriptionHtml: string;
	options: ProductOption[];
	priceRange: {
		maxVariantPrice: Money;
		minVariantPrice: Money;
	};
	variants: ProductVariant[];
	images: Image[];
	seo: SEO;
	tags: string[];
	updatedAt: string;
};

export type CartItem = {
	id: string;
	quantity: number;
	cost: {
		totalAmount: Money;
	};
	merchandise: {
		id: string;
		title: string;
		selectedOptions: {
			name: string;
			value: string;
		}[];
		product: Product;
	};
};

export type Cart = {
	id: string;
	checkoutUrl: string;
	cost: {
		subtotalAmount: Money;
		totalAmount: Money;
		totalTaxAmount: Money;
	};
	totalQuantity: number;
	lines: CartItem[];
};

export type Menu = {
	title: string;
	url?: string;
}[];

export type Collection = {
	handle: string;
	title: string;
	description: string;
	seo: SEO;
	updatedAt: string;
	image?: Image | null;
	firstProductImage?: Image;
};

export type Page = {
	id: string;
	title: string;
	handle: string;
	body: string;
	bodySummary: string;
	seo?: SEO | null;
	createdAt: string;
	updatedAt: string;
};

export type SortKey = 'CREATED_AT' | 'PRICE' | 'BEST_SELLING' | 'RELEVANCE';

export type SearchQuery = {
	sortKey: SortKey;
	reverse: boolean;
	query: string | undefined;
	availability: boolean | undefined;
	price: { min?: number; max?: number } | undefined;
};
