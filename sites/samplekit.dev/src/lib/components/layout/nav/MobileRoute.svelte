<script lang="ts">
	import { page } from '$app/stores';
	import Self from './MobileRoute.svelte';
	import type { RouteGroup, RouteLeaf } from './routes';
	import type { Snippet } from 'svelte';

	interface Props {
		route: RouteLeaf | RouteGroup;
		onNavItemClick: () => void;
		onGroupLine?: Snippet;
	}

	const { route, onNavItemClick, onGroupLine }: Props = $props();

	const isGroup = (route: RouteLeaf | RouteGroup): route is RouteGroup => 'groupPath' in route;
</script>

<li>
	{#if isGroup(route)}
		<span class="flex items-center justify-between gap-2 text-2xl font-bold leading-10">
			{route.groupText}
			{@render onGroupLine?.()}
		</span>
		<ul class="flex flex-col">
			{#each route.children as subRoute}
				<Self {onNavItemClick} route={subRoute} />
			{/each}
		</ul>
	{:else}
		<a
			onclick={onNavItemClick}
			href={route.path}
			aria-current={(route.path === '/' && $page.url.pathname === '/') ||
			(route.path !== '/' && $page.url.pathname.startsWith(route.path))
				? 'page'
				: undefined}
			class="text-lg leading-8 text-gray-11 underline--hidden before:bottom-[.175rem] before:h-[.35rem] hover:text-gray-12 hover:before:w-full aria-[current='page']:pointer-events-none aria-[current='page']:text-gray-12 aria-[current='page']:before:w-full"
		>
			{route.text}
		</a>
	{/if}
</li>
