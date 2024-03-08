<script lang="ts">
	import { page } from '$app/stores';
	import { Switch } from '$lib/components';
	import { SearchBar, Price, SortBy } from '$routes/shop/components';
	import { createSearchAndFilterService, useSearchAndFilterService } from '$routes/shop/services';

	createSearchAndFilterService();

	const {
		params: { query, available, price, sortBy },
		reset,
	} = useSearchAndFilterService();
</script>

<div class="flex h-full flex-col justify-around gap-8">
	<div class="border-accent-9 bg-accent-9/25 mx-auto w-fit rounded-full border px-4 py-2 font-mono">
		<span>$page.url.search: </span>
		<span class="text-gray-11 break-all">{$page.url.search}</span>
	</div>

	<div class="space-y-4 sm:space-y-0">
		<p class="mb-2 text-2xl">Store</p>
		<div>
			<span class="block w-32 text-lg sm:inline-block">Query: </span>
			<span class="text-gray-11 break-words font-mono">{$query}</span>
		</div>
		<div>
			<span class="block w-32 text-lg sm:inline-block">Available: </span>
			<span class="text-gray-11 break-words font-mono">{$available}</span>
		</div>
		<div>
			<span class="block w-32 text-lg sm:inline-block">Price: </span>
			<span class="text-gray-11 break-words font-mono">{JSON.stringify($price)}</span>
		</div>
		<div>
			<span class="block w-32 text-lg sm:inline-block">Sort By: </span>
			<span class="text-gray-11 break-words font-mono">{JSON.stringify($sortBy)}</span>
		</div>
	</div>

	<div class="grid gap-8 sm:grid-cols-2">
		<div class="flex w-full flex-col gap-4">
			<button class="btn btn-hollow w-full" on:click={() => reset({ filtersOnly: true })}>Remove Filters</button>
			<button class="btn btn-hollow w-full" on:click={() => reset()}>Reset Filters and Sorting</button>
		</div>

		<div class="flex w-full flex-col gap-4">
			<div class="flex h-full items-center gap-4">
				<label class="text-sm font-bold" for="in-stock-only" id="in-stock-only-label">In Stock Only</label>
				<Switch state={$available} id="in-stock-only" onClick={available.toggle} />
			</div>
			<SortBy />
		</div>

		<div class="space-y-2">
			<span class="text-sm font-bold">Query</span>
			<SearchBar
				onSubmit={(e) => {
					e.preventDefault();
					query.set(e.currentTarget.querySelector('input')?.value ?? null);
				}}
			/>
		</div>

		<Price />
	</div>
</div>
