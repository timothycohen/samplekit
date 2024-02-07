<script lang="ts">
	import { SlidersHorizontal } from 'lucide-svelte';
	import { onMount } from 'svelte';
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

	let filterAsideOpen = false;
</script>

<div class="full px-page mt-4 w-full max-w-screen-2xl items-stretch">
	<div class="hidden items-center justify-between lg:flex">
		<button class="btn btn-hollow relative" on:click={() => (filterAsideOpen = !filterAsideOpen)}>
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
				class="animate-fade-up-and-in pr-page sticky top-14 hidden h-fit w-64 shrink-0 space-y-8 pt-8 text-sm lg:block"
			>
				<button
					class="btn btn-hollow animate-fade-up-and-in relative w-full {scrollY > 120 ? '' : 'hidden'}"
					on:click={() => (filterAsideOpen = !filterAsideOpen)}
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
			<slot />
		</div>
	</div>
</div>
