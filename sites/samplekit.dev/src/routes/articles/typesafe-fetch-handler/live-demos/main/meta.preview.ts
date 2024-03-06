import type { ModuleDefinitions } from '$lib/articles/load';

export default [
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
	{ title: '+server.ts', loadRaw: () => import('./+server.ts?raw') },
	{ title: 'index.ts', loadRaw: () => import('./index.ts?raw') },
	{ title: 'http/client.ts', loadRaw: () => import('/src/lib/http/client.ts?raw') },
	{ title: 'http/common.ts', loadRaw: () => import('/src/lib/http/common.ts?raw') },
	{ title: 'http/server/json.ts', loadRaw: () => import('/src/lib/http/server/json.ts?raw') },
	{ title: 'types/result.ts', loadRaw: () => import('/src/lib/utils/common/types/result.ts?raw') },
] satisfies ModuleDefinitions;
