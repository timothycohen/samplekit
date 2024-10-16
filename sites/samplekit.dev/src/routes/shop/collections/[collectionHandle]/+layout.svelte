<script lang="ts">
	import { onMount } from 'svelte';
	import I from '$lib/icons';
	import { Available, SortBy, Price } from '$routes/shop/lib/components';
	import { useNavCtx, useSearchAndFilterCtx } from '$routes/shop/lib/ctx';

	const { filterCount } = useSearchAndFilterCtx();

	const { desktopNav, desktopDrawer, mobileDrawer } = useNavCtx();
	$desktopNav = { menuUnderneath: true, showDrawerToggle: false };
	$desktopDrawer = { showSortAndFilters: true };
	$mobileDrawer = { showSearch: true, showSortAndFilters: true };

	onMount(() => {
		const { destroy } = desktopNav.collapseOnScroll();
		return () => {
			destroy();
		};
	});

	const { children } = $props();

	let filterAsideOpen = $state(false);
</script>

<div class="mt-4 w-full max-w-screen-2xl items-stretch px-page full">
	<div class="hidden items-center justify-between lg:flex">
		<button class="btn btn-hollow relative" onclick={() => (filterAsideOpen = !filterAsideOpen)}>
			<span><I.SlidersHorizontal /></span>
			<span>{filterAsideOpen ? 'Unpin ' : ''} Filters</span>
			{#if $filterCount}<span>({$filterCount})</span>{/if}
		</button>

		<div class="w-fit">
			<SortBy />
		</div>
	</div>

	<div class="flex">
		{#if filterAsideOpen}
			<aside
				class="sticky top-14 hidden h-fit w-64 shrink-0 animate-fade-up-and-in space-y-8 pr-page pt-8 text-sm lg:block"
			>
				<button
					class="btn btn-hollow relative w-full animate-fade-up-and-in {scrollY > 120 ? '' : 'hidden'}"
					onclick={() => (filterAsideOpen = !filterAsideOpen)}
				>
					<span><I.SlidersHorizontal /></span>
					<span>{filterAsideOpen ? 'Unpin ' : ''} Filters</span>
					{#if $filterCount}<span>({$filterCount})</span>{/if}
				</button>
				<Available />
				<Price />
			</aside>
		{/if}

		<div class="mt-4">
			{@render children()}
		</div>
	</div>
</div>
