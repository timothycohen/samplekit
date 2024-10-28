import type { ModuleDefinitions } from '$lib/articles/load';

export default [
	{
		title: 'PizzaDemo',
		loadComponent: () => import('./PizzaDemo.svelte'),
		icon: 'svelte',
		wrapperProps: { bg: true, center: true },
	},
	{
		title: 'ConfettiDemo',
		loadComponent: () => import('./ConfettiDemo.svelte'),
		icon: 'svelte',
		wrapperProps: { bg: true, center: true },
	},
	{ title: 'PizzaDemo.svelte', loadRaw: () => import('./PizzaDemo.svelte?raw') },
	{ title: 'ConfettiDemo.svelte', loadRaw: () => import('./ConfettiDemo.svelte?raw') },
] satisfies ModuleDefinitions;
