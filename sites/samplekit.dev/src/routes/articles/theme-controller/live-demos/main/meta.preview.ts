import type { ModuleDefinitions } from '$lib/articles/load';

export default [
	{
		title: 'Appearance',
		loadComponent: () => import('../../../../appearance/+page.svelte'),
		icon: 'svelte',
	},
	{ title: 'Appearance.svelte', loadRaw: () => import('/src/routes/appearance/+page.svelte?raw') },
	{ title: 'ThemePicker.svelte', loadRaw: () => import('/src/lib/styles/components/ThemePicker.svelte?raw') },
	{ title: 'colorThemeUtils.ts', loadRaw: () => import('/src/lib/styles/colorThemeUtils.ts?raw') },
	{ title: 'themeController.ts', loadRaw: () => import('/src/lib/styles/colorThemeController.ts?raw') },
] satisfies ModuleDefinitions;
