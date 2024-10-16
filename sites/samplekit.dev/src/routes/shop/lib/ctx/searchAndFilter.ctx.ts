import { derived, get, type Readable } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { createFlagParam, createSelectParam, createMinMaxParams, createStringParam } from '$lib/svelte-stores';
import { defineCtx } from '$lib/utils/client';
import { type SortItem, defaultSortItem, maxPrice, paramNames, sortItems } from '../searchAndFilter';

const [getCtx, setCtx] = defineCtx<{
	params: {
		sortBy: ReturnType<typeof createSelectParam<SortItem['value']>>;
		query: ReturnType<typeof createStringParam>;
		available: ReturnType<typeof createFlagParam>;
		price: ReturnType<typeof createMinMaxParams>;
	};
	reset: (a?: { skipGo?: true; filtersOnly?: true }) => void;
	pushToUrl: () => void;
	pullFromUrl: () => void;
	filterCount: Readable<number>;
}>();

const createSearchAndFilterCtx = () => {
	const params = {
		available: createFlagParam({ paramName: paramNames.availability, skipInitGoto: true }),
		sortBy: createSelectParam(
			{ defaultValue: defaultSortItem, paramName: paramNames.sortBy, skipInitGoto: true },
			{ options: sortItems },
		),
		query: createStringParam({ paramName: paramNames.query, skipInitGoto: true }),
		price: createMinMaxParams(
			{ skipInitGoto: true, paramNameMap: { min: paramNames.price.min, max: paramNames.price.max } },
			{ absMax: maxPrice },
		),
	};

	const pullFromUrl = () => {
		if (!browser) return;
		Object.values(params).forEach((param) => param.pullFromUrl());
	};

	const pushToUrl = () => {
		if (!browser) return;
		const mutUrl = new URL(get(page).url);
		Object.values(params).forEach((param) => param.pushToUrl(mutUrl));
		const oldUrl = new URL(window.location.href);
		if (mutUrl.href !== oldUrl.href) goto(mutUrl, { keepFocus: true, noScroll: true, replaceState: true });
	};

	const reset = ({ skipGo, filtersOnly }: { skipGo?: true; filtersOnly?: true } = {}) => {
		let changed = false;
		if (!filtersOnly && params.sortBy.setCleaned(defaultSortItem, { nogo: true }).changed) changed = true;
		if (params.query.setCleaned(null, { nogo: true }).changed) changed = true;
		if (params.available.setCleaned(null, { nogo: true }).changed) changed = true;
		if (params.price.setCleaned({ min: null, max: null }, { nogo: true }).changed) changed = true;

		if (changed && !skipGo) {
			pushToUrl();
		}
	};

	const filterCount = derived([params.query, params.available, params.price], ([$query, $available, $price]) => {
		let count = 0;
		if ($query !== null) count++;
		if ($available !== null) count++;
		if ($price.min !== null || $price.max !== null) count++;
		return count;
	});

	if (Object.values(params).some((param) => param.initiallyOutOfSync)) {
		pushToUrl();
	}

	setCtx({
		params,
		pullFromUrl,
		pushToUrl,
		reset,
		filterCount,
	});
};

export { createSearchAndFilterCtx, getCtx as useSearchAndFilterCtx };
