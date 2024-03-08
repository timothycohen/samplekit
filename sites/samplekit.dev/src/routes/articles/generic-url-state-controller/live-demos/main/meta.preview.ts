import type { ModuleDefinitions } from '$lib/articles/load';

export default [
	{ title: 'Demo', loadComponent: () => import('./Demo.svelte'), icon: 'svelte' },
	{ title: 'Demo.svelte', loadRaw: () => import('./Demo.svelte?raw') },
	{
		title: 'searchAndFilterService.ts',
		loadRaw: () => import('/src/routes/shop/services/searchAndFilter/defineService.ts?raw'),
	},
	{ title: 'params.ts', loadRaw: () => import('/src/lib/stores/params/params.ts?raw') },
	{ title: 'paramsGeneric.ts', loadRaw: () => import('/src/lib/stores/params/paramsGeneric.ts?raw') },
	{
		title: 'Available.svelte',
		loadRaw: () => import('/src/routes/shop/components/searchAndFilter/Available.svelte?raw'),
	},
	{
		title: 'NoResults.svelte',
		loadRaw: () => import('/src/routes/shop/components/searchAndFilter/NoResults.svelte?raw'),
	},
	{ title: 'Price.svelte', loadRaw: () => import('/src/routes/shop/components/searchAndFilter/Price.svelte?raw') },
	{
		title: 'SearchBar.svelte',
		loadRaw: () => import('/src/routes/articles/generic-url-state-controller/live-demos/main/Search.svelte?raw'),
	},
	{ title: 'SortBy.svelte', loadRaw: () => import('/src/routes/shop/components/searchAndFilter/SortBy.svelte?raw') },
] satisfies ModuleDefinitions;
