import type { ModuleDefinitions } from '$lib/articles/load';

// writing .txt bc the files are in a different package and the compiler would complain about missing packages

export default [
	{
		title: 'Table Demo',
		loadComponent: () => import('./TableDemo.svx'),
		wrapperProps: { bg: true },
		icon: 'svelte',
	},
	{ title: 'TableDemo.svx', loadRaw: () => import('./TableDemo.svx?raw'), lang: 'svelte' },
	{ title: 'tablePreprocessor.ts', loadRaw: () => import('./tablePreprocessor.txt?raw'), lang: 'ts' },
	{
		title: 'Codeblock Demo',
		loadComponent: () => import('./CodeblockDemo.svx'),
		wrapperProps: { bg: true },
		icon: 'svelte',
	},
	{ title: 'CodeblockDemo.svx', loadRaw: () => import('./CodeblockDemo.svx?raw'), lang: 'svelte' },
	{ title: 'codeblockPreprocessor.ts', loadRaw: () => import('./codeblockPreprocessor.txt?raw'), lang: 'ts' },
	{ title: 'svelte.config.js', loadRaw: () => import('./exampleSvelteConfig.txt?raw') },
] satisfies ModuleDefinitions;
