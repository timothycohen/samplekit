import type { ModuleDefinitions } from '$lib/articles/load';

export default [
	{ title: 'index.ts', loadRaw: () => import('./index.ts?raw') },
	{ title: '+server.ts', loadRaw: () => import('./+server.ts?raw') },
	{
		title: 'Fetch Detailed',
		loadComponent: () => import('./FetchDetailed.svelte'),
		wrapperProps: { bg: true, center: true },
		icon: 'svelte',
	},
	{
		title: 'Fetch Basic',
		loadComponent: () => import('./FetchBasic.svelte'),
		wrapperProps: { bg: true, center: true },
		icon: 'svelte',
	},
	{ title: 'FetchDetailed.svelte', loadRaw: () => import('./FetchDetailed.svelte?raw') },
	{ title: 'FetchBasic.svelte', loadRaw: () => import('./FetchBasic.svelte?raw') },
] satisfies ModuleDefinitions;
