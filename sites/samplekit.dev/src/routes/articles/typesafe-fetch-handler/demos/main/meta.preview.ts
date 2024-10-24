import type { ModuleDefinitions } from '$lib/articles/load';

export default [
	{ title: 'common.ts', loadRaw: () => import('./demo.json/common.ts?raw') },
	{ title: 'client.ts', loadRaw: () => import('./demo.json/client.ts?raw') },
	{ title: '+server.ts', loadRaw: () => import('./demo.json/+server.ts?raw') },
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
