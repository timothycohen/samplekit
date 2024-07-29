<script lang="ts">
	import { page } from '$app/stores';
	import type { RouteGroup, RouteLeaf } from './routes';

	interface Props {
		route: RouteLeaf | RouteGroup;
		onNavItemClick: () => void;
	}

	const { route, onNavItemClick }: Props = $props();

	const isGroup = (route: RouteLeaf | RouteGroup): route is RouteGroup => 'groupPath' in route;
</script>

<li>
	{#if isGroup(route)}
		<span class="t-h2 flex items-center gap-2 font-bold leading-h1">
			{route.groupText}
		</span>
		<ul class="flex flex-col">
			{#each route.children as subRoute}
				<svelte:self {onNavItemClick} route={subRoute} />
			{/each}
		</ul>
	{:else}
		<a
			onclick={onNavItemClick}
			href={route.path}
			aria-current={$page.url.pathname.startsWith(route.path) ? 'page' : undefined}
			class="text-h4 leading-h2 text-gray-12 underline--hidden before:bottom-[.175rem]
						 before:h-[.35rem] hover:text-accent-12 hover:before:w-full
						 aria-[current='page']:pointer-events-none aria-[current='page']:before:w-full"
		>
			{route.text}
		</a>
	{/if}
</li>
