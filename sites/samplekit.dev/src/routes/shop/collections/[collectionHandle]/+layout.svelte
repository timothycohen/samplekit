<script lang="ts">
	interface Props { children?: import('svelte').Snippet }

	let { children }: Props = $props();
	import { onMount } from 'svelte';
	import { SlidersHorizontal } from '$lib/styles/icons';
	import { Available, SortBy, Price } from '$routes/shop/components';
	import { useNavService, useSearchAndFilterService } from '$routes/shop/services';

	const { filterCount } = useSearchAndFilterService();

	const { desktopNav, desktopDrawer, mobileDrawer } = useNavService();
	$desktopNav = { menuUnderneath: true, showDrawerToggle: false };
	$desktopDrawer = { showSortAndFilters: true };
	$mobileDrawer = { showSearch: true, showSortAndFilters: true };

	onMount(() => {
		const { destroy } = desktopNav.collapseOnScroll();
		return () => {
			destroy();
		};
	});

	let filterAsideOpen = $state(false);
</script>

<div class="mt-4 w-full max-w-screen-2xl items-stretch px-page full">
	<div class="hidden items-center justify-between lg:flex">
		<button class="btn btn-hollow relative" onclick={() => (filterAsideOpen = !filterAsideOpen)}>
			<span><SlidersHorizontal /></span>
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
					<span><SlidersHorizontal /></span>
					<span>{filterAsideOpen ? 'Unpin ' : ''} Filters</span>
					{#if $filterCount}<span>({$filterCount})</span>{/if}
				</button>
				<Available />
				<Price />
			</aside>
		{/if}

		<div class="mt-4">
			{@render children?.()}
		</div>
	</div>
</div>
