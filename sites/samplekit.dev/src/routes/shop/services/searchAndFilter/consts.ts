import type { SearchQuery } from '$lib/shop';

export type SortItem = {
	label: string;
	value: {
		paramName: 'trending-desc' | 'latest-desc' | 'price-asc' | 'price-desc' | null;
		sortKey: SearchQuery['sortKey'];
		reverse: SearchQuery['reverse'];
	};
};

export const defaultSortItem = {
	label: 'relevance',
	value: { paramName: null, sortKey: 'RELEVANCE', reverse: false },
} as const;

export const sortItems: SortItem[] = [
	defaultSortItem,
	{ label: 'trending', value: { paramName: 'trending-desc', sortKey: 'BEST_SELLING', reverse: false } },
	{ label: 'latest arrivals', value: { paramName: 'latest-desc', sortKey: 'CREATED_AT', reverse: true } },
	{ label: 'price (low to high)', value: { paramName: 'price-asc', sortKey: 'PRICE', reverse: false } },
	{ label: 'price (high to low)', value: { paramName: 'price-desc', sortKey: 'PRICE', reverse: true } },
] as const;

export const paramNames = {
	query: 'q',
	sortBy: 'sort_by',
	price: { min: 'price.gte', max: 'price.lte' },
	availability: 'availability',
};

export const maxPrice = 9999;

export type { SearchQuery };
