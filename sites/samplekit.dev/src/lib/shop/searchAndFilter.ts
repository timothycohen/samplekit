import { cleanMinMaxStr } from '$lib/svelte-stores';
import type { SearchQuery } from './api';

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

/**
 * Turn
 *
 * `?sort_by=latest-desc&availability=true&price.gte=10&price.lte=100&q=shirt`
 *
 * Into
 *
 * ```ts
 * {
 *     sortKey: 'CREATED_AT',
 *     reverse: true,
 *     availability: true,
 *     price: { min: 10, max: 100 },
 *     query: 'shirt'
 *	 }
 * ```
 */
export const parseSearchAndFilterParams = (search: URLSearchParams): SearchQuery => {
	const { sortKey, reverse } = (() => {
		const paramVal = search.get(paramNames.sortBy);
		return (sortItems.find((i) => i.value.paramName === paramVal) ?? defaultSortItem).value;
	})();

	const availability = (() => {
		const availability = search.getAll(paramNames.availability);
		if (availability.length !== 1) return undefined;
		if (availability[0] !== 'true' && availability[0] !== 'false') return undefined;
		return availability[0] === 'true';
	})();

	const price: { min?: number; max?: number } | undefined = (() => {
		const { max, min } = cleanMinMaxStr({
			absMax: maxPrice,
			newMin: search.get(paramNames.price.min),
			newMax: search.get(paramNames.price.max),
		});
		if (max !== null && min !== null) return { min, max };
		if (min !== null) return { min };
		if (max !== null) return { max };
	})();

	const query = search.get(paramNames.query) ?? undefined;

	return { sortKey, reverse, availability, price, query };
};
