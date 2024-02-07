<script lang="ts">
	import { ChevronUp } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { keyboard } from '$lib/actions';
	import type { RouteLeaf, RouteGroup } from './routes';

	export let route: RouteLeaf | RouteGroup;

	const isGroup = (route: RouteLeaf | RouteGroup): route is RouteGroup => 'groupPath' in route;

	$: active = $page.url.pathname.startsWith(route.path ?? route.groupPath);
	$: href = route.path ?? route.children[0]?.path;
	$: text = route.text ?? route.groupText;

	let inputEl: HTMLInputElement;
</script>

<li class="relative">
	<a
		{href}
		style="padding: 0 0 0 {1.5 + route.depth * 0.5}rem;"
		class="rounded-r-btn flex h-10 w-full items-center border-l-4
		   {!route.depth && !active
			? 'hover:bg-info-3/80 dark:hover:bg-info-3/50 border-transparent'
			: !route.depth && active
				? 'border-info-9 bg-info-3'
				: route.depth && !active
					? 'group border-transparent'
					: route.depth && active
						? 'active group border-transparent'
						: ''}"
		use:keyboard={{
			ArrowDown: [() => (inputEl.checked = true)],
			ArrowUp: [() => (inputEl.checked = false)],
		}}
	>
		<div
			class="underline--hidden before:bg-info-9 before:bottom-[.25rem] before:h-[1px] group-hover:before:w-full before:group-[.active]:h-[2px] before:group-[.active]:w-full"
		>
			{text}
		</div>
	</a>
	{#if isGroup(route)}
		<input id="{route.groupPath}-menu" type="checkbox" class="peer hidden" checked={active} bind:this={inputEl} />
		<label
			for="{route.groupPath}-menu"
			class="rounded-badge hover:bg-info-4 focus:bg-info-4 absolute right-0 top-0 h-10 w-10"
		>
		</label>
		<span
			class="pointer-events-none absolute right-0 top-0 grid h-10 w-10 place-content-center transition-transform peer-checked:rotate-180"
		>
			<ChevronUp class="h-4 w-4" />
		</span>

		<ul class="hidden peer-checked:block">
			{#each route.children as subRoute}
				<svelte:self route={subRoute} />
			{/each}
		</ul>
	{/if}
</li>
