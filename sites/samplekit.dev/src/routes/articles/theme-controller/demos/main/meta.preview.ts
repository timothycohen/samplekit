import type { ModuleDefinitions } from '$lib/articles/load';

export default [
	{
		title: 'Appearance',
		//@ts-expect-error – This will fail fast in dev if it's moved
		loadComponent: () => import('/src/routes/appearance/+page.svelte'),
		icon: 'svelte',
	},
	{ title: 'Appearance.svelte', loadRaw: () => import('/src/routes/appearance/+page.svelte?raw') },
	{ title: 'ThemePicker.svelte', loadRaw: () => import('/src/lib/styles/components/ThemePicker.svelte?raw') },
	{ title: 'themeUtils.ts', loadRaw: () => import('/src/lib/styles/themeUtils.ts?raw') },
	{
		title: 'themeController.svelte.ts',
		loadRaw: () => import('/src/lib/styles/themeController.svelte.ts?raw'),
	},
] satisfies ModuleDefinitions;
