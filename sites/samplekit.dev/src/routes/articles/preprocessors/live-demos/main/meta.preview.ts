import type { ModuleDefinitions } from '$lib/articles/load';

export default [
	{ title: 'Code Decoration', loadComponent: () => import('./Code.svelte'), wrapperProps: { bg: true } },
	{ title: 'Markdown', loadComponent: () => import('./Markdown.svelte'), wrapperProps: { bg: true } },
	{ title: 'Math', loadComponent: () => import('./Math.svelte'), wrapperProps: { bg: true } },
	{ title: 'svelte.config.js', loadRaw: () => import('./exampleSvelteConfig.txt?raw') },
] satisfies ModuleDefinitions;
