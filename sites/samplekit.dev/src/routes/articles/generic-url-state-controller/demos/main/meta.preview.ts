import type { ModuleDefinitions } from '$lib/articles/load';

export default [
	{ title: 'Demo', loadComponent: () => import('./Demo.svelte'), icon: 'svelte' },
	{ title: 'Demo.svelte', loadRaw: () => import('./Demo.svelte?raw') },
	{
		title: 'searchAndFilter.ctx.ts',
		loadRaw: () => import('/src/routes/shop/lib/ctx/searchAndFilter.ctx.ts?raw'),
	},
	{ title: 'params.ts', loadRaw: () => import('/src/lib/svelte-stores/params/params.ts?raw') },
	{ title: 'paramsGeneric.ts', loadRaw: () => import('/src/lib/svelte-stores/params/paramsGeneric.ts?raw') },
	{
		title: 'Available.svelte',
		loadRaw: () => import('/src/routes/shop/lib/components/searchAndFilter/Available.svelte?raw'),
	},
	{
		title: 'NoResults.svelte',
		loadRaw: () => import('/src/routes/shop/lib/components/searchAndFilter/NoResults.svelte?raw'),
	},
	{ title: 'Price.svelte', loadRaw: () => import('/src/routes/shop/lib/components/searchAndFilter/Price.svelte?raw') },
	{
		title: 'SearchBar.svelte',
		loadRaw: () => import('/src/routes/articles/generic-url-state-controller/demos/main/Search.svelte?raw'),
	},
	{
		title: 'SortBy.svelte',
		loadRaw: () => import('/src/routes/shop/lib/components/searchAndFilter/SortBy.svelte?raw'),
	},
] satisfies ModuleDefinitions;
