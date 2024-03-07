import type { ModuleDefinitions } from '$lib/articles/load';

export default [
	{ title: 'Demo', loadComponent: () => import('./Demo.svelte'), icon: 'svelte' },
	{ title: 'Demo.svelte', loadRaw: () => import('./Demo.svelte?raw') },
	{ title: 'FilterInputs.svelte', loadRaw: () => import('./FilterInputs.svelte?raw') },
	{ title: 'Posts.svelte', loadRaw: () => import('./Posts.svelte?raw') },
	{ title: 'searchParams.ts', loadRaw: () => import('/src/lib/stores/params/searchParams.ts?raw') },
	{ title: 'demoData.ts', loadRaw: () => import('./demoData.ts?raw') },
] satisfies ModuleDefinitions;
