import type { ModuleDefinitions } from '$lib/articles/load';

export default [
	{ title: 'Demo', loadComponent: () => import('./Demo.svelte'), icon: 'svelte' },
	{ title: 'Demo.svelte', loadRaw: () => import('./Demo.svelte?raw') },
	{
		title: 'searchAndFilter.ctx.ts',
		loadRaw: () => import('/src/routes/shop/searchAndFilter.ctx.ts?raw'),
	},
	{ title: 'params.ts', loadRaw: () => import('/src/lib/svelte-stores/params/params.ts?raw') },
	{ title: 'paramsGeneric.ts', loadRaw: () => import('/src/lib/svelte-stores/params/paramsGeneric.ts?raw') },
	{
		title: 'Available.svelte',
		loadRaw: () => import('/src/routes/shop/components/search-and-filter/Available.svelte?raw'),
	},
	{
		title: 'NoResults.svelte',
		loadRaw: () => import('/src/routes/shop/components/search-and-filter/NoResults.svelte?raw'),
	},
	{ title: 'Price.svelte', loadRaw: () => import('/src/routes/shop/components/search-and-filter/Price.svelte?raw') },
	{
		title: 'SearchBar.svelte',
		loadRaw: () => import('/src/routes/articles/generic-url-state-controller/demos/main/Search.svelte?raw'),
	},
	{
		title: 'SortBy.svelte',
		loadRaw: () => import('/src/routes/shop/components/search-and-filter/SortBy.svelte?raw'),
	},
] satisfies ModuleDefinitions;
