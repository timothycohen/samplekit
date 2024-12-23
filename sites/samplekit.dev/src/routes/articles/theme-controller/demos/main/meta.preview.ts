import type { ModuleDefinitions } from '$lib/articles/load';

export default [
	{
		title: 'Appearance',
		loadComponent: () => import('../../../../appearance/+page.svelte'),
		icon: 'svelte',
	},
	{ title: 'Appearance.svelte', loadRaw: () => import('/src/routes/appearance/+page.svelte?raw') },
	{ title: 'ThemePicker.svelte', loadRaw: () => import('/src/lib/styles/components/ThemePicker.svelte?raw') },
	{
		title: 'themeController.svelte.ts',
		loadRaw: () => import('/src/lib/styles/themeController.svelte.ts?raw'),
	},
	{ title: 'storeTheme.ts', loadRaw: () => import('/src/lib/styles/storeTheme.ts?raw') },
	{ title: 'themeUtils.ts', loadRaw: () => import('/src/lib/styles/themeUtils.ts?raw') },
] satisfies ModuleDefinitions;
