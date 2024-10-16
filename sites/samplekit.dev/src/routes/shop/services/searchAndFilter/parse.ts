import { cleanMinMaxStr } from '$lib/svelte-stores';
import { paramNames, sortItems, defaultSortItem, maxPrice, type SearchQuery } from './consts';

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
