import type { ModuleDefinitions } from '$lib/articles/load';

// writing .txt bc the files are in a different package and the compiler would complain about missing packages

export default [
	{
		title: 'Table Demo',
		loadComponent: () => import('./TableDemo.svelte'),
		wrapperProps: { bg: true },
		icon: 'svelte',
	},
	{ title: 'tablePreprocessor.ts', loadRaw: () => import('./tablePreprocessor.txt?raw'), lang: 'ts' },
	{
		title: 'Codeblock Demo',
		loadComponent: () => import('./CodeblockDemo.svelte'),
		wrapperProps: { bg: true },
		icon: 'svelte',
	},
	{ title: 'codeblockPreprocessor.ts', loadRaw: () => import('./codeblockPreprocessor.txt?raw'), lang: 'ts' },
	{ title: 'svelte.config.js', loadRaw: () => import('./exampleSvelteConfig.txt?raw') },
] satisfies ModuleDefinitions;
